import express from "express";
import { SubCriteriaController } from "../controllers/subCriteriaController";
import { authenticateToken } from "../middlewares/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get sub-criteria for a specific criterion
router.get("/:criterionId", SubCriteriaController.getSubCriteria);

// Update sub-criteria for a specific criterion
router.put("/:criterionId", SubCriteriaController.updateSubCriteria);

// Get default sub-criteria template
router.get("/", SubCriteriaController.getDefaultSubCriteria);

export default router;