import { Router } from "express";
import { SPKController } from "../controllers/spkController";
import { authenticateToken } from "../middlewares/auth";
// import { validate, validateParams } from '../middlewares/validation';
// import { spkSchemas, commonSchemas } from '../utils/validationSchemas';

const router = Router();

// All SPK routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/spk:
 *   post:
 *     summary: Create new SPK record
 *     tags: [SPK]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - criteria
 *               - alternatives
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               criteria:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     weight:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 1
 *                     type:
 *                       type: string
 *                       enum: [benefit, cost]
 *               alternatives:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     values:
 *                       type: object
 *     responses:
 *       201:
 *         description: SPK record created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", SPKController.createSPK);

/**
 * @swagger
 * /api/spk:
 *   get:
 *     summary: Get all SPK records for authenticated user
 *     tags: [SPK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: SPK records retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", SPKController.getSPKList);

/**
 * @swagger
 * /api/spk/{id}:
 *   get:
 *     summary: Get SPK record by ID
 *     tags: [SPK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: SPK record ID
 *     responses:
 *       200:
 *         description: SPK record retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: SPK record not found
 */
router.get("/:id", SPKController.getSPKById);

/**
 * @swagger
 * /api/spk/{id}:
 *   put:
 *     summary: Update SPK record
 *     tags: [SPK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: SPK record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               criteria:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     weight:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 1
 *                     type:
 *                       type: string
 *                       enum: [benefit, cost]
 *               alternatives:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     values:
 *                       type: object
 *     responses:
 *       200:
 *         description: SPK record updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: SPK record not found
 */
router.put("/:id", SPKController.updateSPK);

/**
 * @swagger
 * /api/spk/{id}:
 *   delete:
 *     summary: Delete SPK record
 *     tags: [SPK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: SPK record ID
 *     responses:
 *       200:
 *         description: SPK record deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: SPK record not found
 */
router.delete("/:id", SPKController.deleteSPK);

export default router;
