exports.notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.'
  });
};

exports.errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered.';
  }
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(val => val.message);
    message = messages.join(', ');
  }
  
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON payload.';
  }
  
  res.status(statusCode).json({
    success: false,
    message: message
  });
};