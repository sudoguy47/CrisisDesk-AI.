const { GoogleGenerativeAI } = require('@google/generative-ai');

function classifyLocally(text, lang) {
  const lower = text.toLowerCase();
  const keywords = {
    fire: ['fire', 'burn', 'flame', 'আগুন', 'burning'],
    flood: ['flood', 'water', 'rain', 'বন্যা', 'ডুবে'],
    accident: ['accident', 'crash', 'collision', 'দুর্ঘটনা'],
    crime: ['crime', 'thief', 'robbery', 'চুরি', 'ছিনতাই', 'murder'],
    medical: ['sick', 'fever', 'pain', 'medical', 'doctor', 'ডাক্তার', 'অসুস্থ', 'injured'],
    infrastructure: ['road', 'pothole', 'light', 'electric', 'রাস্তা', 'বিদ্যুৎ', 'bridge'],
    utility: ['water supply', 'gas', 'electricity', 'internet', 'wifi', 'utility']
  };

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(w => lower.includes(w))) {
      const urgency = category === 'fire' || category === 'medical' ? 'critical' 
        : category === 'flood' || category === 'accident' ? 'high'
        : category === 'crime' ? 'medium'
        : 'low';
      return { category, urgency };
    }
  }
  return { category: 'other', urgency: 'medium' };
}

exports.processWithAI = async (description, language) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (apiKey && apiKey.length > 5) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
      
      const prompt = `You are an emergency triage AI. Analyze the following citizen report and classify it.
Report language: ${language || 'unknown'}
Report text: "${description}"

Return ONLY a valid JSON object with exactly these keys:
- category: one of [medical, fire, accident, crime, flood, utility, public_service, infrastructure, other]
- urgency: one of [low, medium, high, critical]
- summary: a short 1-sentence summary
- suggestedAction: a short recommended action for responders
- confidence: a number between 0 and 1

Do not include markdown formatting or explanations.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      
      const validCategories = ['medical', 'fire', 'accident', 'crime', 'flood', 'utility', 'public_service', 'infrastructure', 'other'];
      const validUrgencies = ['low', 'medium', 'high', 'critical'];
      
      if (!validCategories.includes(parsed.category)) parsed.category = 'other';
      if (!validUrgencies.includes(parsed.urgency)) parsed.urgency = 'medium';
      if (typeof parsed.confidence !== 'number') parsed.confidence = 0.85;
      
      return parsed;
    } catch (err) {
      console.error('Gemini failed, using fallback:', err.message);
    }
  }
  
  const ruleResult = classifyLocally(description, language);
  return {
    ...ruleResult,
    summary: `Report classified as ${ruleResult.category} via local analysis.`,
    suggestedAction: `Dispatch appropriate ${ruleResult.category} response team.`,
    confidence: 0.75
  };
};