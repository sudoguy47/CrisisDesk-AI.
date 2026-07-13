require('dotenv').config();

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const connectDB = require('../config/db');

// 🎯 Mock Services (রিয়েল API কল বন্ধ → ফাস্ট টেস্ট)
jest.mock('../services/aiService', () => ({
  processWithAI: jest.fn()
}));

jest.mock('../services/duplicateService', () => ({
  findPossibleDuplicate: jest.fn()
}));

const { processWithAI } = require('../services/aiService');
const { findPossibleDuplicate } = require('../services/duplicateService');

// 🔌 DB কানেক্ট + ডিসকানেক্ট
beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

// 🔄 প্রতি টেস্টের আগে Mock Reset
beforeEach(() => {
  processWithAI.mockResolvedValue({
    category: 'fire',
    urgency: 'critical',
    summary: 'Fire reported near building',
    suggestedAction: 'Dispatch fire service immediately',
    confidence: 0.95
  });

  findPossibleDuplicate.mockResolvedValue({
    possibleDuplicate: false,
    matchedReportId: null,
    score: 0
  });
});

describe('CrisisDesk API', () => {
  test('GET /health - should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/reports - should fail validation without location', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({ description: 'test only' });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/reports - should create report successfully', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({
        name: 'Test User',
        contact: '01711111111',
        location: 'Dhaka Gulshan',
        description: 'Fire in building near park',
        language: 'en'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category).toBe('fire');
    expect(res.body.data.urgency).toBe('critical');
    expect(res.body.data.possibleDuplicate).toBe(false);
  });

  test('GET /api/reports - should return list', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});