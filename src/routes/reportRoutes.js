const express = require('express');
const router = express.Router();
const { createReport, getReports, getSingleReport, updateStatus, deleteReport, getStats } = require('../controllers/reportController');

router.post('/', createReport);
router.get('/stats', getStats);
router.get('/', getReports);
router.get('/:id', getSingleReport);
router.patch('/:id', updateStatus);
router.delete('/:id', deleteReport);

module.exports = router;