const mongoose = require('mongoose');
const Report = require('../models/Report');
const { processWithAI } = require('../services/aiService');
const { findDuplicates = () => ({possibleDuplicate: false, matchedReportId: null}) } = require('../services/duplicateService');

// POST /api/reports
const createReport = async (req, res) => {
  try {
    console.log("➡️ POST /api/reports called");
    const { name, contact, location, description, language } = req.body;
    const aiData = await processWithAI(description, language || 'unknown');
    
    const report = new Report({
      name, contact, location, description, language,
      category: aiData.category,
      urgency: aiData.urgency,
      summary: aiData.summary,
      suggestedAction: aiData.suggestedAction,
      confidence: aiData.confidence,
      status: 'pending'
    });

    const duplicateCheck = await findDuplicates(report);
    report.possibleDuplicate = duplicateCheck.possibleDuplicate;
    report.matchedReportId = duplicateCheck.matchedReportId;

    await report.save();
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

// GET /api/reports
const getReports = async (req, res) => {
  try {
    console.log("➡️ GET /api/reports called (Fetch All)");
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

// GET /api/reports/:id
const getSingleReport = async (req, res) => {
  try {
    console.log(`➡️ GET /api/reports/:id called with ID: ${req.params.id}`);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("❌ Invalid ID detected by validation");
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });
    
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

// PATCH /api/reports/:id
const updateStatus = async (req, res) => {
  try {
    console.log(`➡️ PATCH /api/reports/:id called with ID: ${req.params.id}`);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true }
    );
    
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });
    
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

// DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    console.log(`➡️ DELETE /api/reports/:id called with ID: ${req.params.id}`);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });
    
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

// GET /api/reports/stats/summary
const getStats = async (req, res) => {
  try {
    console.log("➡️ GET /api/reports/stats called");
    const totalReports = await Report.countDocuments();
    const criticalReports = await Report.countDocuments({ urgency: "critical" });
    const pendingReports = await Report.countDocuments({ status: "pending" });
    const resolvedReports = await Report.countDocuments({ status: "resolved" });

    res.status(200).json({ 
      success: true, 
      totalReports, 
      criticalReports,
      pendingReports,
      resolvedReports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

module.exports = { createReport, getReports, getSingleReport, updateStatus, deleteReport, getStats };