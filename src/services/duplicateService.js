const Report = require('../models/Report');

function tokenize(text) {
  return text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
}

function jaccardSimilarity(text1, text2) {
  const set1 = new Set(tokenize(text1));
  const set2 = new Set(tokenize(text2));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function locationSimilarity(loc1, loc2) {
  const a = loc1.toLowerCase().trim();
  const b = loc2.toLowerCase().trim();
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.8;
  return jaccardSimilarity(a, b);
}

exports.findPossibleDuplicate = async (newReport) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const candidates = await Report.find({
    createdAt: { $gte: twentyFourHoursAgo },
    $or: [
      { category: newReport.category },
      { location: { $regex: new RegExp(newReport.location.split(/\s+/).slice(0, 2).join('|'), 'i') } }
    ]
  }).sort({ createdAt: -1 }).limit(10);
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const candidate of candidates) {
    const locSim = locationSimilarity(newReport.location, candidate.location);
    const catMatch = candidate.category === newReport.category ? 1 : 0;
    const descSim = jaccardSimilarity(newReport.description, candidate.description);
    const score = (locSim * 0.45) + (catMatch * 0.25) + (descSim * 0.30);
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }
  
  const threshold = 0.68;
  
  if (bestMatch && bestScore >= threshold) {
    return {
      possibleDuplicate: true,
      matchedReportId: bestMatch._id,
      score: bestScore
    };
  }
  
  return {
    possibleDuplicate: false,
    matchedReportId: null,
    score: 0
  };
};