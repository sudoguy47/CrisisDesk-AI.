const Report = require('../models/Report');

exports.findDuplicates = async (newReport) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const query = {
    createdAt: { $gte: twentyFourHoursAgo },
    $or: [
      { location: { $regex: new RegExp(newReport.location, 'i') } },
    ]
  };

  if (newReport.category && newReport.category !== 'other') {
    query.$or.push({ category: newReport.category });
  }

  const existing = await Report.findOne(query).sort({ createdAt: -1 });

  if (existing) {
    return {
      possibleDuplicate: true,
      matchedReportId: existing._id
    };
  }

  return { possibleDuplicate: false, matchedReportId: null };
};