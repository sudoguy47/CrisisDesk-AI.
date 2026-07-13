const mongoose = require('mongoose');
const Report = require('../models/Report');
const { processWithAI } = require('../services/aiService');
const { findPossibleDuplicate } = require('../services/duplicateService');

exports.createReport = async (req, res) => {
  try {
    const { name, contact, location, description, language } = req.body;
    
    const aiData = await processWithAI(description, language || 'unknown');
    
    const report = new Report({
      name: name || '',
      contact: contact || '',
      location,
      description,
      language: language || 'unknown',
      category: aiData.category,
      urgency: aiData.urgency,
      summary: aiData.summary,
      suggestedAction: aiData.suggestedAction,
      confidence: aiData.confidence,
      status: 'pending'
    });
    
    const dupCheck = await findPossibleDuplicate(report);
    report.possibleDuplicate = dupCheck.possibleDuplicate;
    report.matchedReportId = dupCheck.matchedReportId;
    
    await report.save();
    
    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'AI classification failed. Please try again.'
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { category, urgency, status, search, startDate, endDate, page, limit } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (urgency) query.urgency = urgency;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
   if (search) {
  query.$or = [
    { location: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } }
  ];
}
  
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;
    
    const reports = await Report.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
    const total = await Report.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: reports
    });
  } catch (error) {
  console.error('Create report error:', error);
  res.status(500).json({
    success: false,
    message: 'Failed to submit report. Please try again.'
  });
}
};

exports.getReportById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid report ID.' });
    }
    
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }
    
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error.' });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid report ID.' });
    }
    
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error.' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid report ID.' });
    }
    
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error.' });
  }
};

exports.getStatsSummary = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const criticalReports = await Report.countDocuments({ urgency: 'critical' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    
    const categoryAgg = await Report.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const urgencyAgg = await Report.aggregate([{ $group: { _id: '$urgency', count: { $sum: 1 } } }]);
    
    const categoryBreakdown = {};
    categoryAgg.forEach(item => { if (item._id) categoryBreakdown[item._id] = item.count; });
    
    const urgencyBreakdown = {};
    urgencyAgg.forEach(item => { if (item._id) urgencyBreakdown[item._id] = item.count; });
    
    res.status(200).json({
      success: true,
      totalReports,
      criticalReports,
      pendingReports,
      resolvedReports,
      categoryBreakdown,
      urgencyBreakdown
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error calculating statistics.' });
  }
};