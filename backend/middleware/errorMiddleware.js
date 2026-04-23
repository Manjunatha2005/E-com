/**
 * middleware/errorMiddleware.js
 * Global error handler — must be the last middleware registered.
 */

const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(err);
};

const errorHandler = (err, req, res, next) => {
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    err.message = `Resource not found (bad id: ${err.value})`;
    res.status(404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.message = `Duplicate value for field: ${field}`;
    res.status(409);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    err.message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    res.status(400);
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
