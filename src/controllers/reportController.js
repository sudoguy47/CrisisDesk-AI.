const Report = require('../models/Report');
const { processWithAI } = require('../services/aiService');
const { findDuplicates } = require('../services/duplicateService');

const createReport = async (req, res) => {
  try {
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

const getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

const getSingleReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

const updateStatus = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!report) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

const getStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const criticalReports = await Report.countDocuments({ urgency: "critical" });
    res.status(200).json({ success: true, totalReports, criticalReports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

module.exports = { createReport, getReports, getSingleReport, updateStatus, deleteReport, getStats };