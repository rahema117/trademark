const rateLimit = require('express-rate-limit');

/**
 * Strict Rate Limiter for Authentication / Login endpoint
 * Prevents brute-force attack attempts (Max 10 requests per 15 minutes per IP)
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'محاولات تسجيل دخول كثيرة جداً، يرجى المحاولة بعد 15 دقيقة',
  },
});

/**
 * General Rate Limiter for API endpoints
 * Protects against DoS attacks without disrupting normal user/dashboard interactions
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تم تجاوز عدد الطلبات المسموح به، يرجى المحاولة لاحقاً',
  },
});

module.exports = {
  loginLimiter,
  apiLimiter,
};
