exports.requireAdmin = (req, res, next) => {
  const apiKey = req.headers['x-admin-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Admin API key required in x-admin-api-key header.'
    });
  }
  
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Invalid admin API key.'
    });
  }
  
  next();
};