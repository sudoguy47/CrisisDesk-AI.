const { GoogleGenerativeAI } = require("@google/generative-ai");

// Fallback Logic (API fail হলে কাজ করবে)
function classifyLocally(text) {
  const lower = text.toLowerCase();
  if (/fire|burn|আগুন/.test(lower)) return { category: 'fire', urgency: 'critical' };
  if (/flood|water|rain|বন্যা/.test(lower)) return { category: 'flood', urgency: 'high' };
  if (/accident|crash|দূর্ঘটনা/.test(lower)) return { category: 'accident', urgency: 'high' };
  if (/crime|thief|চুরি/.test(lower)) return { category: 'crime', urgency: 'medium' };
  if (/sick|fever|pain|অসুস্থ/.test(lower)) return { category: 'medical', urgency: 'high' };
  return { category: 'other', urgency: 'medium' };
}

exports.processWithAI = async (description, language) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.length > 5) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are an emergency triage AI. Analyze the following report and classify it.
Output ONLY valid JSON with these keys: category (medical,fire,accident,crime,flood,utility,public_service,infrastructure,other), urgency (low,medium,high,critical), summary (short 1 line), suggestedAction (short 1 line), confidence (0 to 1 float).
Report: "${description}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean markdown artifacts if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);
    } catch (e) {
      console.error('Gemini API failed, using fallback:', e.message);
    }
  }

  // Fallback
  const ruleResult = classifyLocally(description);
  return {
    ...ruleResult,
    summary: `Report classified locally as ${ruleResult.category}.`,
    suggestedAction: `Dispatch standard ${ruleResult.category} response team.`,
    confidence: 0.80 
  };
};