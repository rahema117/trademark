const { sendError } = require('../utils/responseHandler');

const notFound = (req, res, next) => {
  return sendError(res, `المسار غير موجود - ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'حدث خطأ في الخادم';
  let errors = [];

  // Handle Mongoose Duplicate Key Error (e.g. duplicate trademarkNumber)
  if (err.code === 11000) {
    statusCode = 400;
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : '';
    message = field === 'trademarkNumber' 
      ? 'رقم العلامة التجارية مسجل بالفعل' 
      : field ? `${field} مسجل بالفعل` : 'قيمة مكررة غير صالحة';
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `عنصر غير صالحة: ${err.value || err.path}`;
  }

  // Ensure internal 500 server error details are not leaked in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'حدث خطأ في الخادم';
  }

  console.error('[Error Middleware]:', err);

  return sendError(
    res,
    message,
    statusCode,
    errors,
    process.env.NODE_ENV === 'production' ? null : err.stack
  );
};

module.exports = { notFound, errorHandler };
