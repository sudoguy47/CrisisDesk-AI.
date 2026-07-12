const express = require('express');
const router = express.Router();
const { validateCreateReport, validateStatusUpdate } = require('../middleware/validateRequest');
const { 
  createReport, getReports, getSingleReport, 
  updateStatus, deleteReport, getStats 
} = require('../controllers/reportController');

router.route('/')
  .get(getReports)
  .post(validateCreateReport, createReport);

router.get('/stats/summary', getStats);

router.route('/:id')
  .get(getSingleReport)
  .delete(deleteReport)
  .patch(validateStatusUpdate, updateStatus);

module.exports = router;