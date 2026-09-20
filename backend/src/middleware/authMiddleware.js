const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { sendError } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

      req.admin = await Admin.findById(decoded.id).select('-passwordHash');
      if (!req.admin) {
        return sendError(res, 'غير مصرح: الحساب غير موجود', 401);
      }

      return next();
    } catch (error) {
      return sendError(res, 'غير مصرح: جلسة غير صالحة أو منتهية', 401);
    }
  }

  if (!token) {
    return sendError(res, 'غير مصرح: لم يتم توفير رمز الدخول', 401);
  }
};

module.exports = { protect };
