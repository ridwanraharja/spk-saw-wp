import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/errorHandler";
import { SPKCalculator } from "../utils/spkCalculations";
import prisma from "../config/database";
import { v4 as uuidv4 } from "uuid";

export class SPKController {
  // Create new SPK record
  static createSPK = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user?.userId;
      const { title, criteria, alternatives } = req.body;

      // Generate IDs for criteria first to ensure validation can work properly
      const criteriaWithIds = criteria.map(
        (criterion: {
          id?: string;
          name: string;
          weight: number;
          type: "benefit" | "cost";
        }) => ({
          ...criterion,
          id: criterion.id || uuidv4(),
        })
      );

      // Create a map of criterion names to IDs for alternative values processing
      const criterionNameToId = new Map<string, string>();
      criteriaWithIds.forEach(
        (criterion: {
          id: string;
          name: string;
          weight: number;
          type: "benefit" | "cost";
        }) => {
          criterionNameToId.set(criterion.name, criterion.id);
        }
      );

      // Transform alternatives to use criterion IDs instead of names in values
      const alternativesWithIds = alternatives.map(
        (alternative: {
          id?: string;
          name: string;
          values: { [key: string]: number };
        }) => {
          const transformedValues: { [criterionId: string]: number } = {};

          // If values are keyed by criterion names, convert to IDs
          if (alternative.values && typeof alternative.values === "object") {
            Object.entries(alternative.values).forEach(([key, value]) => {
              const criterionId = criterionNameToId.get(key);
              if (criterionId) {
                transformedValues[criterionId] = value as number;
              } else {
                // If key is already an ID, use it directly
                transformedValues[key] = value as number;
              }
            });
          }

          return {
            ...alternative,
            id: alternative.id || uuidv4(),
            values: transformedValues,
          };
        }
      );

      // Validate input data with properly formatted data
      const validation = SPKCalculator.validateInputData(
        criteriaWithIds,
        alternativesWithIds
      );
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Invalid SPK data",
          errors: validation.errors,
        });
        return;
      }

      // Calculate results using the transformed data
      const sawResults = SPKCalculator.calculateSAW(
        criteriaWithIds,
        alternativesWithIds
      );
      const wpResults = SPKCalculator.calculateWP(
        criteriaWithIds,
        alternativesWithIds
      );

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create SPK record
        const spkRecord = await tx.sPKRecord.create({
          data: {
            userId: userId!,
            title,
          },
        });

        // Create criteria using the pre-generated IDs
        const createdCriteria = await Promise.all(
          criteriaWithIds.map(
            (criterion: {
              id: string;
              name: string;
              weight: number;
              type: "benefit" | "cost";
            }) =>
              tx.criterion.create({
                data: {
                  id: criterion.id,
                  spkId: spkRecord.id,
                  name: criterion.name,
                  weight: criterion.weight,
                  type: criterion.type,
                },
              })
          )
        );

        // Create alternatives using the pre-generated IDs
        const createdAlternatives = await Promise.all(
          alternativesWithIds.map(
            (alternative: {
              id: string;
              name: string;
              values: { [key: string]: number };
            }) =>
              tx.alternative.create({
                data: {
                  id: alternative.id,
                  spkId: spkRecord.id,
                  name: alternative.name,
                },
              })
          )
        );

        // Create alternative values using the transformed values with criterion IDs
        const alternativeValues = [];
        for (const alternative of alternativesWithIds) {
          for (const criterionId of Object.keys(alternative.values)) {
            alternativeValues.push({
              alternativeId: alternative.id,
              criterionId: criterionId,
              value: alternative.values[criterionId],
            });
          }
        }

        await Promise.all(
          alternativeValues.map((value) =>
            tx.alternativeValue.create({
              data: value,
            })
          )
        );

        // Create SAW results
        await Promise.all(
          sawResults.map((result) =>
            tx.sAWResult.create({
              data: {
                spkId: spkRecord.id,
                alternativeId: result.alternativeId,
                score: result.score,
                rank: result.rank,
              },
            })
          )
        );

        // Create WP results
        await Promise.all(
          wpResults.map((result) =>
            tx.wPResult.create({
              data: {
                spkId: spkRecord.id,
                alternativeId: result.alternativeId,
                score: result.score,
                rank: result.rank,
              },
            })
          )
        );

        return spkRecord;
      });

      res.status(201).json({
        success: true,
        message: "SPK record created successfully",
        data: {
          id: result.id,
          title: result.title,
          createdAt: result.createdAt,
          sawResults,
          wpResults,
        },
      });
    }
  );

  // Get all SPK records for authenticated user
  static getSPKList = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Build where clause based on user role
      const whereClause = userRole === "admin" ? {} : { userId };

      const [spkRecords, total] = await Promise.all([
        prisma.sPKRecord.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            criteria: true,
            alternatives: {
              include: {
                alternativeValues: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.sPKRecord.count({
          where: whereClause,
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          spkRecords,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    }
  );

  // Get single SPK record by ID
  static getSPKById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const { id } = req.params;

      // Build where clause based on user role
      const whereClause = userRole === "admin" ? { id } : { id, userId }; // Ensure user can only access their own records

      const spkRecord = await prisma.sPKRecord.findFirst({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          criteria: true,
          alternatives: {
            include: {
              alternativeValues: {
                include: {
                  criterion: true,
                },
              },
            },
          },
          sawResults: {
            include: {
              alternative: true,
            },
          },
          wpResults: {
            include: {
              alternative: true,
            },
          },
        },
      });

      if (!spkRecord) {
        res.status(404).json({
          success: false,
          message: "SPK record not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { spkRecord },
      });
    }
  );

  // Update SPK record
  static updateSPK = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const { id } = req.params;
      const { title, criteria, alternatives } = req.body;

      // Build where clause based on user role
      const whereClause = userRole === "admin" ? { id } : { id, userId }; // Ensure user can only access their own records

      // Check if record exists and user has access
      const existingSPK = await prisma.sPKRecord.findFirst({
        where: whereClause,
      });

      if (!existingSPK) {
        res.status(404).json({
          success: false,
          message: "SPK record not found",
        });
        return;
      }

      // Validate input data if criteria and alternatives are provided
      let criteriaWithIds: any = criteria;
      let alternativesWithIds: any = alternatives;

      if (criteria && alternatives) {
        // Generate IDs for criteria first to ensure validation can work properly
        criteriaWithIds = criteria.map(
          (criterion: {
            id?: string;
            name: string;
            weight: number;
            type: "benefit" | "cost";
          }) => ({
            ...criterion,
            id: criterion.id || uuidv4(),
          })
        );

        // Create a map of criterion names to IDs for alternative values processing
        const criterionNameToId = new Map<string, string>();
        criteriaWithIds.forEach(
          (criterion: {
            id: string;
            name: string;
            weight: number;
            type: "benefit" | "cost";
          }) => {
            criterionNameToId.set(criterion.name, criterion.id);
          }
        );

        // Transform alternatives to use criterion IDs instead of names in values
        alternativesWithIds = alternatives.map(
          (alternative: {
            id?: string;
            name: string;
            values: { [key: string]: number };
          }) => {
            const transformedValues: { [criterionId: string]: number } = {};

            // If values are keyed by criterion names, convert to IDs
            if (alternative.values && typeof alternative.values === "object") {
              Object.entries(alternative.values).forEach(([key, value]) => {
                const criterionId = criterionNameToId.get(key);
                if (criterionId) {
                  transformedValues[criterionId] = value as number;
                } else {
                  // If key is already an ID, use it directly
                  transformedValues[key] = value as number;
                }
              });
            }

            return {
              ...alternative,
              id: alternative.id || uuidv4(),
              values: transformedValues,
            };
          }
        );

        const validation = SPKCalculator.validateInputData(
          criteriaWithIds,
          alternativesWithIds
        );
        if (!validation.isValid) {
          res.status(400).json({
            success: false,
            message: "Invalid SPK data",
            errors: validation.errors,
          });
          return;
        }
      }

      // Update in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update SPK record
        const updatedSPK = await tx.sPKRecord.update({
          where: { id },
          data: {
            ...(title && { title }),
          },
        });

        // If criteria and alternatives are provided, recalculate everything
        if (criteria && alternatives) {
          // Delete existing related data
          await tx.alternativeValue.deleteMany({
            where: { alternative: { spkId: id } },
          });
          await tx.sAWResult.deleteMany({ where: { spkId: id } });
          await tx.wPResult.deleteMany({ where: { spkId: id } });
          await tx.alternative.deleteMany({ where: { spkId: id } });
          await tx.criterion.deleteMany({ where: { spkId: id } });

          // Recalculate results using the transformed data
          const sawResults = SPKCalculator.calculateSAW(
            criteriaWithIds,
            alternativesWithIds
          );
          const wpResults = SPKCalculator.calculateWP(
            criteriaWithIds,
            alternativesWithIds
          );

          // Recreate all data (similar to create logic)
          await Promise.all(
            criteriaWithIds.map(
              (criterion: {
                id: string;
                name: string;
                weight: number;
                type: "benefit" | "cost";
              }) =>
                tx.criterion.create({
                  data: {
                    id: criterion.id,
                    spkId: id,
                    name: criterion.name,
                    weight: criterion.weight,
                    type: criterion.type,
                  },
                })
            )
          );

          const createdAlternatives = await Promise.all(
            alternativesWithIds.map(
              (alternative: {
                id: string;
                name: string;
                values: { [key: string]: number };
              }) =>
                tx.alternative.create({
                  data: {
                    id: alternative.id,
                    spkId: id,
                    name: alternative.name,
                  },
                })
            )
          );

          // Create alternative values using the transformed values with criterion IDs
          const alternativeValues = [];
          for (const alternative of alternativesWithIds) {
            for (const criterionId of Object.keys(alternative.values)) {
              alternativeValues.push({
                alternativeId: alternative.id,
                criterionId: criterionId,
                value: alternative.values[criterionId],
              });
            }
          }

          await Promise.all(
            alternativeValues.map((value) =>
              tx.alternativeValue.create({
                data: value,
              })
            )
          );

          // Create new results
          await Promise.all(
            sawResults.map((result) =>
              tx.sAWResult.create({
                data: {
                  spkId: id,
                  alternativeId: result.alternativeId,
                  score: result.score,
                  rank: result.rank,
                },
              })
            )
          );

          await Promise.all(
            wpResults.map((result) =>
              tx.wPResult.create({
                data: {
                  spkId: id,
                  alternativeId: result.alternativeId,
                  score: result.score,
                  rank: result.rank,
                },
              })
            )
          );
        }

        return updatedSPK;
      });

      res.status(200).json({
        success: true,
        message: "SPK record updated successfully",
        data: { spkRecord: result },
      });
    }
  );

  // Delete SPK record
  static deleteSPK = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const { id } = req.params;

      // Build where clause based on user role
      const whereClause = userRole === "admin" ? { id } : { id, userId }; // Ensure user can only access their own records

      // Check if record exists and user has access
      const existingSPK = await prisma.sPKRecord.findFirst({
        where: whereClause,
      });

      if (!existingSPK) {
        res.status(404).json({
          success: false,
          message: "SPK record not found",
        });
        return;
      }

      // Delete record (cascading delete will handle related records)
      await prisma.sPKRecord.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: "SPK record deleted successfully",
      });
    }
  );

  // Get dashboard statistics
  static getDashboardStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Build where clause based on user role
      const whereClause = userRole === "admin" ? {} : { userId };

      const [totalSPK, recentSPK] = await Promise.all([
        prisma.sPKRecord.count({
          where: whereClause,
        }),
        prisma.sPKRecord.findMany({
          where: whereClause,
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalSPK,
          recentSPK,
        },
      });
    }
  );
}
