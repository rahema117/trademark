const { sendError } = require('../utils/responseHandler');

const notFound = (req, res, next) => {
  return sendError(res, `المسار غير موجود - ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'حدث خطأ في الخادم';

  // Handle Mongoose Duplicate Key Error (e.g. duplicate trademarkNumber)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = field === 'trademarkNumber' 
      ? 'رقم العلامة التجارية مسجل بالفعل' 
      : `${field} مسجل بالفعل`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  console.error('[Error Middleware]:', err);
  return sendError(res, message, statusCode);
};

module.exports = { notFound, errorHandler };
