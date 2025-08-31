import { Router } from "express";
import { TemplateController } from "../controllers/templateController";
import { authenticateToken, requireAdmin } from "../middlewares/auth";

const router = Router();

// All template routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/templates/active:
 *   get:
 *     summary: Get all active templates
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active templates retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/active", TemplateController.getActiveTemplates);

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     summary: Get template by ID
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Template not found
 */
router.get("/:id", TemplateController.getTemplateById);

// Admin only routes
/**
 * @swagger
 * /api/templates:
 *   post:
 *     summary: Create new template (admin only)
 *     tags: [Admin, Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - criteria
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               category:
 *                 type: string
 *                 maxLength: 100
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
 *                     order:
 *                       type: integer
 *                     subCriteria:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                           value:
 *                             type: integer
 *                             minimum: 1
 *                             maximum: 5
 *                           order:
 *                             type: integer
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post("/", requireAdmin, TemplateController.createTemplate);

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Get all templates (admin only)
 *     tags: [Admin, Templates]
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
 *         description: Templates retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/", requireAdmin, TemplateController.getAllTemplates);

/**
 * @swagger
 * /api/templates/{id}:
 *   put:
 *     summary: Update template (admin only)
 *     tags: [Admin, Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               category:
 *                 type: string
 *                 maxLength: 100
 *               isActive:
 *                 type: boolean
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
 *                     order:
 *                       type: integer
 *                     subCriteria:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                           value:
 *                             type: integer
 *                             minimum: 1
 *                             maximum: 5
 *                           order:
 *                             type: integer
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Template not found
 */
router.put("/:id", requireAdmin, TemplateController.updateTemplate);

/**
 * @swagger
 * /api/templates/{id}:
 *   delete:
 *     summary: Delete template (admin only)
 *     tags: [Admin, Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       400:
 *         description: Cannot delete template in use
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Template not found
 */
router.delete("/:id", requireAdmin, TemplateController.deleteTemplate);

/**
 * @swagger
 * /api/templates/{id}/toggle:
 *   patch:
 *     summary: Toggle template active status (admin only)
 *     tags: [Admin, Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Template not found
 */
router.patch(
  "/:id/toggle",
  requireAdmin,
  TemplateController.toggleTemplateStatus
);

export default router;
