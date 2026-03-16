// Centralized error handling middleware
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Avoid leaking stack traces in production
  const response = {
    success: false,
    message: err.message || 'Server Error'
  };

  if (!isProduction) {
    response.stack = err.stack;
  }

  if (err.details) {
    response.errors = err.details;
  }

  // Log server-side for monitoring/observability
  console.error(err);

  res.status(statusCode).json(response);
};
