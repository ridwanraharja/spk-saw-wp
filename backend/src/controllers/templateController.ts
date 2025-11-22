import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/errorHandler";
import prisma from "../config/database";

export class TemplateController {
  // Admin: Create new SPK template
  static createTemplate = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user?.userId;
      const { name, description, category, criteria } = req.body;

      const result = await prisma.$transaction(async (tx) => {
        // Create template
        const template = await tx.sPKTemplate.create({
          data: {
            name,
            description,
            category,
            userId: userId!,
          },
        });

        // Create template criteria
        const createdCriteria = await Promise.all(
          criteria.map(
            (criterion: {
              name: string;
              weight: number;
              type: "benefit" | "cost";
              order: number;
              subCriteria?: Array<{
                label: string;
                value: number;
                order: number;
              }>;
            }) =>
              tx.templateCriterion.create({
                data: {
                  templateId: template.templateId,
                  name: criterion.name,
                  weight: criterion.weight,
                  type: criterion.type,
                  order: criterion.order,
                },
              })
          )
        );

        // Create template sub-criteria
        for (let i = 0; i < criteria.length; i++) {
          const criterion = criteria[i];
          const createdCriterion = createdCriteria[i];

          if (criterion.subCriteria && criterion.subCriteria.length > 0) {
            await Promise.all(
              criterion.subCriteria.map(
                (subCriterion: {
                  label: string;
                  value: number;
                  order: number;
                }) =>
                  tx.templateSubCriteria.create({
                    data: {
                      templateCriterionId: createdCriterion.templateCriterionId,
                      label: subCriterion.label,
                      value: subCriterion.value,
                      order: subCriterion.order,
                    },
                  })
              )
            );
          } else {
            // Create default sub-criteria if none provided
            const defaultSubCriteria = [
              { label: "Sangat Rendah", value: 1, order: 1 },
              { label: "Rendah", value: 2, order: 2 },
              { label: "Sedang", value: 3, order: 3 },
              { label: "Tinggi", value: 4, order: 4 },
              { label: "Sangat Tinggi", value: 5, order: 5 },
            ];

            await Promise.all(
              defaultSubCriteria.map((subCriterion) =>
                tx.templateSubCriteria.create({
                  data: {
                    templateCriterionId: createdCriterion.templateCriterionId,
                    label: subCriterion.label,
                    value: subCriterion.value,
                    order: subCriterion.order,
                  },
                })
              )
            );
          }
        }

        return template;
      });

      res.status(201).json({
        success: true,
        message: "Template created successfully",
        data: { template: result },
      });
    }
  );

  // Get all active templates
  static getActiveTemplates = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const templates = await prisma.sPKTemplate.findMany({
        where: { isActive: true },
        include: {
          creator: {
            select: {
              userId: true,
              name: true,
              email: true,
            },
          },
          templateCriteria: {
            include: {
              templateSubCriteria: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json({
        success: true,
        data: { templates },
      });
    }
  );

  // Admin: Get all templates (including inactive)
  static getAllTemplates = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [templates, total] = await Promise.all([
        prisma.sPKTemplate.findMany({
          include: {
            creator: {
              select: {
                userId: true,
                name: true,
                email: true,
              },
            },
            templateCriteria: {
              include: {
                templateSubCriteria: {
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
            _count: {
              select: {
                spkRecords: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.sPKTemplate.count(),
      ]);

      res.status(200).json({
        success: true,
        data: {
          templates,
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

  // Get template by ID
  static getTemplateById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      const template = await prisma.sPKTemplate.findUnique({
        where: { templateId: id },
        include: {
          creator: {
            select: {
              userId: true,
              name: true,
              email: true,
            },
          },
          templateCriteria: {
            include: {
              templateSubCriteria: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!template) {
        res.status(404).json({
          success: false,
          message: "Template not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { template },
      });
    }
  );

  // Admin: Update template
  static updateTemplate = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const { name, description, category, isActive, criteria } = req.body;

      // Check if template exists
      const existingTemplate = await prisma.sPKTemplate.findUnique({
        where: { templateId: id },
      });

      if (!existingTemplate) {
        res.status(404).json({
          success: false,
          message: "Template not found",
        });
        return;
      }

      const result = await prisma.$transaction(async (tx) => {
        // Update template
        const updatedTemplate = await tx.sPKTemplate.update({
          where: { templateId: id },
          data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(category && { category }),
            ...(isActive !== undefined && { isActive }),
          },
        });

        // If criteria are provided, update them
        if (criteria) {
          // Delete existing template criteria and sub-criteria
          await tx.templateSubCriteria.deleteMany({
            where: {
              templateCriterion: { templateId: id },
            },
          });
          await tx.templateCriterion.deleteMany({
            where: { templateId: id },
          });

          // Create new criteria
          const createdCriteria = await Promise.all(
            criteria.map(
              (criterion: {
                name: string;
                weight: number;
                type: "benefit" | "cost";
                order: number;
                subCriteria?: Array<{
                  label: string;
                  value: number;
                  order: number;
                }>;
              }) =>
                tx.templateCriterion.create({
                  data: {
                    templateId: id,
                    name: criterion.name,
                    weight: criterion.weight,
                    type: criterion.type,
                    order: criterion.order,
                  },
                })
            )
          );

          // Create new sub-criteria
          for (let i = 0; i < criteria.length; i++) {
            const criterion = criteria[i];
            const createdCriterion = createdCriteria[i];

            if (criterion.subCriteria && criterion.subCriteria.length > 0) {
              await Promise.all(
                criterion.subCriteria.map(
                  (subCriterion: {
                    label: string;
                    value: number;
                    order: number;
                  }) =>
                    tx.templateSubCriteria.create({
                      data: {
                        templateCriterionId: createdCriterion.templateCriterionId,
                        label: subCriterion.label,
                        value: subCriterion.value,
                        order: subCriterion.order,
                      },
                    })
                )
              );
            } else {
              // Create default sub-criteria
              const defaultSubCriteria = [
                { label: "Sangat Rendah", value: 1, order: 1 },
                { label: "Rendah", value: 2, order: 2 },
                { label: "Sedang", value: 3, order: 3 },
                { label: "Tinggi", value: 4, order: 4 },
                { label: "Sangat Tinggi", value: 5, order: 5 },
              ];

              await Promise.all(
                defaultSubCriteria.map(
                  (subCriterion: {
                    label: string;
                    value: number;
                    order: number;
                  }) =>
                    tx.templateSubCriteria.create({
                      data: {
                        templateCriterionId: createdCriterion.templateCriterionId,
                        label: subCriterion.label,
                        value: subCriterion.value,
                        order: subCriterion.order,
                      },
                    })
                )
              );
            }
          }
        }

        return updatedTemplate;
      });

      res.status(200).json({
        success: true,
        message: "Template updated successfully",
        data: { template: result },
      });
    }
  );

  // Admin: Delete template
  static deleteTemplate = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      // Check if template exists
      const existingTemplate = await prisma.sPKTemplate.findUnique({
        where: { templateId: id },
        include: {
          _count: {
            select: {
              spkRecords: true,
            },
          },
        },
      });

      if (!existingTemplate) {
        res.status(404).json({
          success: false,
          message: "Template not found",
        });
        return;
      }

      // Check if template is being used by any SPK records
      if (existingTemplate._count.spkRecords > 0) {
        res.status(400).json({
          success: false,
          message: "Cannot delete template that is being used by SPK records",
        });
        return;
      }

      // Delete template (cascading delete will handle related records)
      await prisma.sPKTemplate.delete({
        where: { templateId: id },
      });

      res.status(200).json({
        success: true,
        message: "Template deleted successfully",
      });
    }
  );

  // Admin: Toggle template active status
  static toggleTemplateStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      const template = await prisma.sPKTemplate.findUnique({
        where: { templateId: id },
      });

      if (!template) {
        res.status(404).json({
          success: false,
          message: "Template not found",
        });
        return;
      }

      const updatedTemplate = await prisma.sPKTemplate.update({
        where: { templateId: id },
        data: {
          isActive: !template.isActive,
        },
      });

      res.status(200).json({
        success: true,
        message: `Template ${
          updatedTemplate.isActive ? "activated" : "deactivated"
        } successfully`,
        data: { template: updatedTemplate },
      });
    }
  );
}
