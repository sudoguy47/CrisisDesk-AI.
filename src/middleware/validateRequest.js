const { z } = require('zod');

const reportSchema = z.object({
  name: z.string().trim().optional().or(z.literal('')),
  contact: z.string().trim().optional().or(z.literal('')),
  location: z.string().trim().min(1, 'Location is required'),
  description: z.string().trim().min(1, 'Description is required'),
  language: z.enum(['bn', 'en', 'unknown']).optional().default('unknown')
});

const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'in_review', 'assigned', 'resolved', 'rejected'])
});

const querySchema = z.object({
  category: z.enum(['medical', 'fire', 'accident', 'crime', 'flood', 'utility', 'public_service', 'infrastructure', 'other']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['pending', 'in_review', 'assigned', 'resolved', 'rejected']).optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});

exports.validateCreateReport = (req, res, next) => {
  try {
    reportSchema.parse(req.body);
    next();
  } catch (err) {
    const errors = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
};

exports.validateStatusUpdate = (req, res, next) => {
  try {
    statusUpdateSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value provided.'
    });
  }
};

exports.validateReportQuery = (req, res, next) => {
  try {
    querySchema.parse(req.query);
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters.'
    });
  }
};