function errorHandler(err, req, res, _next) {
  // Use the status already set on res, or fall back to 500
  const status = res.statusCode !== 200 ? res.statusCode : 500;

  const body = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Include validation errors when present
  if (err.errors) body.errors = err.errors;

  // In development, include the stack trace
  if (process.env.NODE_ENV === 'development') body.stack = err.stack;

  // Never leak mongoose internal messages in production
  if (process.env.NODE_ENV === 'production' && status === 500) {
    body.message = 'Internal Server Error';
  }

  res.status(status).json(body);
}

module.exports = errorHandler;
