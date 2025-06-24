import { Router } from "express";
import { SPKController } from "../controllers/spkController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics for authenticated user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSPK:
 *                       type: integer
 *                       description: Total number of SPK records
 *                     recentSPK:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", SPKController.getDashboardStats);

export default router;
