const multer = require('multer');
const path = require('path');
const { sendError } = require('../utils/responseHandler');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `trademark-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('مسموح فقط برفع الصور من نوع (JPG, JPEG, PNG, WEBP)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const uploadSingleImage = (req, res, next) => {
  const uploadHandler = upload.single('image');

  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 'حجم الصورة يتجاوز الحد المسموح به (5 ميجابايت)', 400);
      }
      return sendError(res, `خطأ في رفع الملف: ${err.message}`, 400);
    } else if (err) {
      return sendError(res, err.message, 400);
    }
    next();
  });
};

module.exports = uploadSingleImage;
