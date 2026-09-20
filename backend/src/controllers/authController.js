const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '7d',
  });
};

/**
 * @desc    Auth Admin & Get JWT Token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'يرجى إدخال البريد الإلكتروني وكلمة المرور', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return sendError(res, 'بيانات الدخول غير صحيحة', 401);
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 'بيانات الدخول غير صحيحة', 401);
    }

    const token = generateToken(admin._id);

    return sendSuccess(
      res,
      {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
        },
      },
      'تم تسجيل الدخول بنجاح'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current Admin Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    return sendSuccess(
      res,
      {
        admin: {
          id: req.admin._id,
          email: req.admin.email,
        },
      },
      'تم جلب بيانات المسؤول بنجاح'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
};
