const Report = require('../models/Report');

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function textToVector(text) {
  const tokens = tokenize(text);
  const vector = {};
  tokens.forEach(token => { vector[token] = (vector[token] || 0) + 1; });
  return vector;
}

function cosineSimilarity(vecA, vecB) {
  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dotProduct = 0, magA = 0, magB = 0;
  allKeys.forEach(key => {
    const a = vecA[key] || 0, b = vecB[key] || 0;
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  });
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

function locationSimilarity(loc1, loc2) {
  const a = loc1.toLowerCase().trim(), b = loc2.toLowerCase().trim();
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.85;
  const set1 = new Set(a.split(/\s+/)), set2 = new Set(b.split(/\s+/));
  const inter = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return union.size === 0 ? 0 : inter.size / union.size;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.findPossibleDuplicate = async (newReport) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const locationTokens = newReport.location
    .split(/\s+/)
    .slice(0, 2)
    .map(escapeRegex)
    .join('|');

  const candidates = await Report.find({
    createdAt: { $gte: twentyFourHoursAgo },
    $or: [
      { category: newReport.category },
      { location: { $regex: new RegExp(locationTokens, 'i') } }
    ]
  }).sort({ createdAt: -1 }).limit(15);
  
  const newDescVector = textToVector(newReport.description);
  let bestMatch = null, bestScore = 0;
  
  for (const candidate of candidates) {
    const locSim = locationSimilarity(newReport.location, candidate.location);
    const catMatch = candidate.category === newReport.category ? 1 : 0;
    const descSim = cosineSimilarity(newDescVector, textToVector(candidate.description));
    const score = (locSim * 0.40) + (catMatch * 0.20) + (descSim * 0.40);
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }
  
  if (bestMatch && bestScore >= 0.65) {
    return {
      possibleDuplicate: true,
      matchedReportId: bestMatch._id,
      score: parseFloat(bestScore.toFixed(3))
    };
  }
  
  return { possibleDuplicate: false, matchedReportId: null, score: 0 };
};