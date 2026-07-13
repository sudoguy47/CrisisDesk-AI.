const express = require('express');
const router = express.Router();
const {
  createReport, getReports, getReportById,
  updateReportStatus, deleteReport, getStatsSummary
} = require('../controllers/reportController');

const {
  validateCreateReport, validateStatusUpdate, validateReportQuery
} = require('../middleware/validateRequest');

const { requireAdmin } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /reports/stats/summary:
 *   get:
 *     summary: Get analytics summary
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get('/stats/summary', getStatsSummary);

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Submit a new report
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportInput'
 *     responses:
 *       201:
 *         description: Report created
 */
router.post('/', validateCreateReport, createReport);

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: List reports with filters
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/', validateReportQuery, getReports);

router.get('/:id', getReportById);

/**
 * @swagger
 * /reports/{id}/status:
 *   patch:
 *     summary: Update report status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - AdminApiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatusUpdate'
 *     responses:
 *       200:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/status', strictLimiter, requireAdmin, validateStatusUpdate, updateReportStatus);

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Delete a report (Admin only)
 *     tags: [Admin]
 *     security:
 *       - AdminApiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', strictLimiter, requireAdmin, deleteReport);

module.exports = router;