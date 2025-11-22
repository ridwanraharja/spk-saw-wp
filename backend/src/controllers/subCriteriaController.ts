import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/errorHandler";
import prisma from "../config/database";

export class SubCriteriaController {
  // Get sub-criteria for a specific criterion
  static getSubCriteria = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { criterionId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Check if user has access to this criterion
      const criterion = await prisma.criterion.findFirst({
        where: {
          criterionId: criterionId,
          spkRecord: userRole === "admin" ? {} : { userId },
        },
        include: {
          subCriteria: {
            orderBy: { order: 'asc' }
          }
        }
      });

      if (!criterion) {
        res.status(404).json({
          success: false,
          message: "Criterion not found or access denied",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          criterionId,
          subCriteria: criterion.subCriteria,
        },
      });
    }
  );

  // Update sub-criteria for a specific criterion
  static updateSubCriteria = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { criterionId } = req.params;
      const { subCriteria } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Validate input
      if (!Array.isArray(subCriteria) || subCriteria.length !== 5) {
        res.status(400).json({
          success: false,
          message: "Sub-criteria must be an array of exactly 5 items",
        });
        return;
      }

      // Validate each sub-criteria item
      for (let i = 0; i < subCriteria.length; i++) {
        const item = subCriteria[i];
        if (!item.label || typeof item.label !== 'string') {
          res.status(400).json({
            success: false,
            message: `Sub-criteria item ${i + 1} must have a valid label`,
          });
          return;
        }
        if (item.value !== i + 1) {
          res.status(400).json({
            success: false,
            message: `Sub-criteria item ${i + 1} must have value ${i + 1}`,
          });
          return;
        }
        if (item.order !== i + 1) {
          res.status(400).json({
            success: false,
            message: `Sub-criteria item ${i + 1} must have order ${i + 1}`,
          });
          return;
        }
      }

      // Check if user has access to this criterion
      const criterion = await prisma.criterion.findFirst({
        where: {
          criterionId: criterionId,
          spkRecord: userRole === "admin" ? {} : { userId },
        },
      });

      if (!criterion) {
        res.status(404).json({
          success: false,
          message: "Criterion not found or access denied",
        });
        return;
      }

      // Update sub-criteria in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Delete existing sub-criteria
        await tx.subCriteria.deleteMany({
          where: { criterionId },
        });

        // Create new sub-criteria
        const createdSubCriteria = await Promise.all(
          subCriteria.map((item: { label: string; value: number; order: number }) =>
            tx.subCriteria.create({
              data: {
                criterionId,
                label: item.label,
                value: item.value,
                order: item.order,
              },
            })
          )
        );

        return createdSubCriteria;
      });

      res.status(200).json({
        success: true,
        message: "Sub-criteria updated successfully",
        data: {
          criterionId,
          subCriteria: result,
        },
      });
    }
  );

  // Get default sub-criteria template
  static getDefaultSubCriteria = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const defaultSubCriteria = [
        { label: "Sangat Rendah", value: 1, order: 1 },
        { label: "Rendah", value: 2, order: 2 },
        { label: "Sedang", value: 3, order: 3 },
        { label: "Tinggi", value: 4, order: 4 },
        { label: "Sangat Tinggi", value: 5, order: 5 }
      ];

      res.status(200).json({
        success: true,
        data: {
          subCriteria: defaultSubCriteria,
        },
      });
    }
  );
}