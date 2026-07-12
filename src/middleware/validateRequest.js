const { z } = require('zod');

const reportSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  location: z.string().min(1, 'Location cannot be empty'),
  description: z.string().min(1, 'Description cannot be empty'),
  language: z.enum(['bn', 'en', 'unknown']).optional().default('unknown')
});

const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'in_review', 'assigned', 'resolved', 'rejected'])
});

exports.validateCreateReport = (req, res, next) => {
  try {
    reportSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.errors[0].message || "Validation Failed"
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
      message: "Invalid status value provided."
    });
  }
};