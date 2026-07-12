const express = require('express');
const router = express.Router();
const { 
  createReport, 
  getReports, 
  getSingleReport, 
  updateStatus, 
  deleteReport, 
  getStats 
} = require('../controllers/reportController');

const { validateCreateReport, validateStatusUpdate } = require('../middleware/validateRequest');

// ১. স্ট্যাটস রাউট (আইডি রাউটের উপরে থাকতে হবে)
router.get('/stats/summary', getStats);
router.get('/stats', getStats);

// ২. সাধারণ রাউট (এগুলো একদম আলাদা থাকবে)
router.get('/', getReports);
router.post('/', validateCreateReport, createReport);

// ৩. আইডি রাউট (আইডি রাউটগুলো সবার শেষে থাকবে)
router.get('/:id', getSingleReport);
router.delete('/:id', deleteReport);
router.patch('/:id', validateStatusUpdate, updateStatus);

module.exports = router;