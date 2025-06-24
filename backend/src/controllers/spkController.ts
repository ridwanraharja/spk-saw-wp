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

      // Validate input data
      const validation = SPKCalculator.validateInputData(
        criteria,
        alternatives
      );
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Invalid SPK data",
          errors: validation.errors,
        });
        return;
      }

      // Calculate results
      const sawResults = SPKCalculator.calculateSAW(criteria, alternatives);
      const wpResults = SPKCalculator.calculateWP(criteria, alternatives);

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create SPK record
        const spkRecord = await tx.sPKRecord.create({
          data: {
            userId: userId!,
            title,
          },
        });

        // Create criteria
        const createdCriteria = await Promise.all(
          criteria.map((criterion: any) =>
            tx.criterion.create({
              data: {
                id: criterion.id || uuidv4(),
                spkId: spkRecord.id,
                name: criterion.name,
                weight: criterion.weight,
                type: criterion.type,
              },
            })
          )
        );

        // Create alternatives
        const createdAlternatives = await Promise.all(
          alternatives.map((alternative: any) =>
            tx.alternative.create({
              data: {
                id: alternative.id || uuidv4(),
                spkId: spkRecord.id,
                name: alternative.name,
              },
            })
          )
        );

        // Create alternative values
        const alternativeValues = [];
        for (const alternative of alternatives) {
          for (const criterionId of Object.keys(alternative.values)) {
            alternativeValues.push({
              alternativeId:
                alternative.id ||
                createdAlternatives.find((a) => a.name === alternative.name)
                  ?.id,
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [spkRecords, total] = await Promise.all([
        prisma.sPKRecord.findMany({
          where: { userId },
          include: {
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
          where: { userId },
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
      const { id } = req.params;

      const spkRecord = await prisma.sPKRecord.findFirst({
        where: {
          id,
          userId, // Ensure user can only access their own records
        },
        include: {
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
      const { id } = req.params;
      const { title, criteria, alternatives } = req.body;

      // Check if record exists and belongs to user
      const existingSPK = await prisma.sPKRecord.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingSPK) {
        res.status(404).json({
          success: false,
          message: "SPK record not found",
        });
        return;
      }

      // Validate input data if criteria and alternatives are provided
      if (criteria && alternatives) {
        const validation = SPKCalculator.validateInputData(
          criteria,
          alternatives
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

          // Recalculate results
          const sawResults = SPKCalculator.calculateSAW(criteria, alternatives);
          const wpResults = SPKCalculator.calculateWP(criteria, alternatives);

          // Recreate all data (similar to create logic)
          await Promise.all(
            criteria.map((criterion: any) =>
              tx.criterion.create({
                data: {
                  id: criterion.id || uuidv4(),
                  spkId: id,
                  name: criterion.name,
                  weight: criterion.weight,
                  type: criterion.type,
                },
              })
            )
          );

          const createdAlternatives = await Promise.all(
            alternatives.map((alternative: any) =>
              tx.alternative.create({
                data: {
                  id: alternative.id || uuidv4(),
                  spkId: id,
                  name: alternative.name,
                },
              })
            )
          );

          // Create alternative values
          const alternativeValues = [];
          for (const alternative of alternatives) {
            for (const criterionId of Object.keys(alternative.values)) {
              alternativeValues.push({
                alternativeId:
                  alternative.id ||
                  createdAlternatives.find((a) => a.name === alternative.name)
                    ?.id,
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
      const { id } = req.params;

      // Check if record exists and belongs to user
      const existingSPK = await prisma.sPKRecord.findFirst({
        where: {
          id,
          userId,
        },
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

      const [totalSPK, recentSPK] = await Promise.all([
        prisma.sPKRecord.count({
          where: { userId },
        }),
        prisma.sPKRecord.findMany({
          where: { userId },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            createdAt: true,
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
