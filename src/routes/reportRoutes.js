const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  deleteReport,
  getStatsSummary
} = require('../controllers/reportController');

const {
  validateCreateReport,
  validateStatusUpdate,
  validateReportQuery
} = require('../middleware/validateRequest');

// IMPORTANT: /stats/summary MUST be before /:id
router.get('/stats/summary', getStatsSummary);

router.post('/', validateCreateReport, createReport);
router.get('/', validateReportQuery, getReports);

router.get('/:id', getReportById);
router.patch('/:id/status', validateStatusUpdate, updateReportStatus);
router.delete('/:id', deleteReport);

module.exports = router;