const Trademark = require('../models/Trademark');
const { sendSuccess, sendPaginated, sendError } = require('../utils/responseHandler');
const { deleteFile, getPublicUrl } = require('../services/storageService');

/**
 * @desc    Create a new trademark
 * @route   POST /api/trademarks
 * @access  Private
 */
const createTrademark = async (req, res, next) => {
  try {
    const {
      trademarkNumber,
      nameAr,
      nameEn,
      classNumber,
      ownerNameAr,
      ownerNameEn,
      status,
      filingDate,
      agentName,
    } = req.body;

    // Validate required fields
    if (
      !trademarkNumber ||
      !nameAr ||
      !nameEn ||
      !classNumber ||
      !ownerNameAr ||
      !ownerNameEn ||
      !status ||
      !filingDate
    ) {
      if (req.file) deleteFile(getPublicUrl(req.file.filename));
      return sendError(res, 'جميع الحقول المطلوبة يجب إدخالها', 400);
    }

    const classNum = parseInt(classNumber, 10);
    if (isNaN(classNum) || classNum <= 0) {
      if (req.file) deleteFile(getPublicUrl(req.file.filename));
      return sendError(res, 'رقم الفئة يجب أن يكون رقماً صحيحاً موجباً', 400);
    }

    // Check uniqueness of trademark number
    const existing = await Trademark.findOne({ trademarkNumber: trademarkNumber.trim() });
    if (existing) {
      if (req.file) deleteFile(getPublicUrl(req.file.filename));
      return sendError(res, 'رقم العلامة التجارية مسجل بالفعل', 400);
    }

    let imagePath = '';
    if (req.file) {
      imagePath = getPublicUrl(req.file.filename);
    }

    const trademark = await Trademark.create({
      image: imagePath,
      trademarkNumber: trademarkNumber.trim(),
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      classNumber: classNum,
      ownerNameAr: ownerNameAr.trim(),
      ownerNameEn: ownerNameEn.trim(),
      status,
      filingDate: new Date(filingDate),
      agentName: agentName ? agentName.trim() : '',
    });

    return sendSuccess(res, trademark, 'تم إضافة العلامة التجارية بنجاح', 201);
  } catch (error) {
    if (req.file) deleteFile(getPublicUrl(req.file.filename));
    next(error);
  }
};

/**
 * @desc    Get all trademarks with Search, Filters, Sorting & Pagination
 * @route   GET /api/trademarks
 * @access  Private
 */
const getTrademarks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const {
      search,
      status,
      classNumber,
      filingDateFrom,
      filingDateTo,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const filter = {};

    // 1. Status Filter
    if (status) {
      filter.status = status;
    }

    // 2. Class Number Filter
    if (classNumber) {
      const parsedClass = parseInt(classNumber, 10);
      if (!isNaN(parsedClass)) {
        filter.classNumber = parsedClass;
      }
    }

    // 3. Filing Date Range Filter
    if (filingDateFrom || filingDateTo) {
      filter.filingDate = {};
      if (filingDateFrom) {
        filter.filingDate.$gte = new Date(filingDateFrom);
      }
      if (filingDateTo) {
        const toDate = new Date(filingDateTo);
        toDate.setHours(23, 59, 59, 999);
        filter.filingDate.$lte = toDate;
      }
    }

    // 4. Search Filter (partial matching across multiple fields)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { trademarkNumber: searchRegex },
        { nameAr: searchRegex },
        { nameEn: searchRegex },
        { ownerNameAr: searchRegex },
        { ownerNameEn: searchRegex },
        { agentName: searchRegex },
      ];
    }

    // Sort order setup
    const sortOptions = {};
    const sortField = ['filingDate', 'trademarkNumber', 'createdAt', 'nameAr', 'nameEn', 'classNumber'].includes(sort)
      ? sort
      : 'createdAt';
    sortOptions[sortField] = order === 'asc' ? 1 : -1;

    const [trademarks, total] = await Promise.all([
      Trademark.find(filter).sort(sortOptions).skip(skip).limit(limit),
      Trademark.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return sendPaginated(
      res,
      trademarks,
      {
        page,
        limit,
        total,
        totalPages,
      },
      'تم جلب العلامات التجارية بنجاح'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard summary statistics
 * @route   GET /api/trademarks/stats
 * @access  Private
 */
const getTrademarkStats = async (req, res, next) => {
  try {
    const [total, active, pending, expired, cancelled] = await Promise.all([
      Trademark.countDocuments(),
      Trademark.countDocuments({ status: 'Active' }),
      Trademark.countDocuments({ status: 'Pending' }),
      Trademark.countDocuments({ status: 'Expired' }),
      Trademark.countDocuments({ status: 'Cancelled' }),
    ]);

    return sendSuccess(
      res,
      {
        total,
        active,
        pending,
        expired,
        cancelled,
      },
      'تم جلب الإحصائيات بنجاح'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single trademark by ID
 * @route   GET /api/trademarks/:id
 * @access  Private
 */
const getTrademarkById = async (req, res, next) => {
  try {
    const trademark = await Trademark.findById(req.params.id);
    if (!trademark) {
      return sendError(res, 'العلامة التجارية غير موجودة', 404);
    }
    return sendSuccess(res, trademark, 'تم جلب تفاصيل العلامة التجارية');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update trademark
 * @route   PUT /api/trademarks/:id
 * @access  Private
 */
const updateTrademark = async (req, res, next) => {
  try {
    const trademark = await Trademark.findById(req.params.id);
    if (!trademark) {
      if (req.file) deleteFile(getPublicUrl(req.file.filename));
      return sendError(res, 'العلامة التجارية غير موجودة', 404);
    }

    const {
      trademarkNumber,
      nameAr,
      nameEn,
      classNumber,
      ownerNameAr,
      ownerNameEn,
      status,
      filingDate,
      agentName,
    } = req.body;

    // Check trademark number uniqueness if changed
    if (trademarkNumber && trademarkNumber.trim() !== trademark.trademarkNumber) {
      const existing = await Trademark.findOne({ trademarkNumber: trademarkNumber.trim() });
      if (existing) {
        if (req.file) deleteFile(getPublicUrl(req.file.filename));
        return sendError(res, 'رقم العلامة التجارية مسجل بالفعل لعنصر آخر', 400);
      }
      trademark.trademarkNumber = trademarkNumber.trim();
    }

    if (classNumber) {
      const classNum = parseInt(classNumber, 10);
      if (isNaN(classNum) || classNum <= 0) {
        if (req.file) deleteFile(getPublicUrl(req.file.filename));
        return sendError(res, 'رقم الفئة يجب أن يكون رقماً صحيحاً موجباً', 400);
      }
      trademark.classNumber = classNum;
    }

    if (nameAr) trademark.nameAr = nameAr.trim();
    if (nameEn) trademark.nameEn = nameEn.trim();
    if (ownerNameAr) trademark.ownerNameAr = ownerNameAr.trim();
    if (ownerNameEn) trademark.ownerNameEn = ownerNameEn.trim();
    if (status) trademark.status = status;
    if (filingDate) trademark.filingDate = new Date(filingDate);
    if (agentName !== undefined) trademark.agentName = agentName ? agentName.trim() : '';

    // If new image uploaded, replace existing image and delete old file
    if (req.file) {
      if (trademark.image) {
        deleteFile(trademark.image);
      }
      trademark.image = getPublicUrl(req.file.filename);
    }

    await trademark.save();

    return sendSuccess(res, trademark, 'تم تحديث العلامة التجارية بنجاح');
  } catch (error) {
    if (req.file) deleteFile(getPublicUrl(req.file.filename));
    next(error);
  }
};

/**
 * @desc    Delete trademark
 * @route   DELETE /api/trademarks/:id
 * @access  Private
 */
const deleteTrademark = async (req, res, next) => {
  try {
    const trademark = await Trademark.findById(req.params.id);
    if (!trademark) {
      return sendError(res, 'العلامة التجارية غير موجودة', 404);
    }

    // Delete associated image file if exists
    if (trademark.image) {
      deleteFile(trademark.image);
    }

    await trademark.deleteOne();

    return sendSuccess(res, null, 'تم حذف العلامة التجارية بنجاح');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrademark,
  getTrademarks,
  getTrademarkStats,
  getTrademarkById,
  updateTrademark,
  deleteTrademark,
};
