const Report = require('../models/Report');
const { processWithAI } = require('../services/aiService');
const { findDuplicates } = require('../services/duplicateService');

// POST /api/reports
exports.createReport = async (req, res) => {
  try {
    const { name, contact, location, description, language } = req.body;

    // 1. AI Classification
    const aiData = await processWithAI(description, language || 'unknown');

    // 2. Create Report Object
    const report = new Report({
      name, contact, location, description, language,
      category: aiData.category,
      urgency: aiData.urgency,
      summary: aiData.summary,
      suggestedAction: aiData.suggestedAction,
      confidence: aiData.confidence,
      status: 'pending'
    });

    // 3. Check Duplicates
    const duplicateCheck = await findDuplicates(report);
    report.possibleDuplicate = duplicateCheck.possibleDuplicate;
    report.matchedReportId = duplicateCheck.matchedReportId;

    // 4. Save
    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error during report submission." });
  }
};

// GET /api/reports
exports.getReports = async (req, res) => {
  try {
    let query = {};
    
    if (req.query.category) query.category = req.query.category;
    if (req.query.urgency) query.urgency = req.query.urgency;
    if (req.query.status) query.status = req.query.status;
    
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
    }

    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

// GET /api/reports/:id
exports.getSingleReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found." });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

// PATCH /api/reports/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!report) return res.status(404).json({ success: false, message: "Report not found." });
    res.status(200).json({ success: true, message: "Status updated", data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error updating status." });
  }
};

// DELETE /api/reports/:id
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found." });
    res.status(200).json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

// GET /api/reports/stats/summary
exports.getStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $facet: {
          totalReports: [{ $count: "count" }],
          criticalReports: [{ $match: { urgency: "critical" } }, { $count: "count" }],
          pendingReports: [{ $match: { status: "pending" } }, { $count: "count" }],
          resolvedReports: [{ $match: { status: "resolved" } }, { $count: "count" }],
          categories: [{ $group: { _id: "$category", count: { $sum: 1 } } }],
          urgencies: [{ $group: { _id: "$urgency", count: { $sum: 1 } } }]
        }
      }
    ]);

    const result = stats[0];
    
    const formatBreakdown = (arr) => {
      let obj = {};
      arr.forEach(item => { obj[item._id] = item.count; });
      return obj;
    };

    res.status(200).json({
      success: true,
      totalReports: result.totalReports[0]?.count || 0,
      criticalReports: result.criticalReports[0]?.count || 0,
      pendingReports: result.pendingReports[0]?.count || 0,
      resolvedReports: result.resolvedReports[0]?.count || 0,
      categoryBreakdown: formatBreakdown(result.categories),
      urgencyBreakdown: formatBreakdown(result.urgencies)
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error calculating statistics." });
  }
};