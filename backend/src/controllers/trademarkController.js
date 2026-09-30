const Trademark = require('../models/Trademark');
const { sendSuccess, sendPaginated, sendError } = require('../utils/responseHandler');
const { uploadImage, deleteFile } = require('../services/storageService');

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
      nationality,
      status,
      filingDate,
      expiryDate,
      agentName,
    } = req.body;

    // ONLY trademarkNumber, nameAr, and nameEn are REQUIRED
    if (!trademarkNumber || !nameAr || !nameEn) {
      return sendError(res, 'رقم العلامة التجارية واسم العلامة بالعربي والإنجليزي مطلوبة', 400);
    }

    let classNum = null;
    if (classNumber !== undefined && classNumber !== null && classNumber !== '') {
      classNum = parseInt(classNumber, 10);
      if (isNaN(classNum) || classNum <= 0) {
        return sendError(res, 'رقم الفئة يجب أن يكون رقماً صحيحاً موجباً', 400);
      }
    }

    // Check uniqueness of trademark number
    const existing = await Trademark.findOne({ trademarkNumber: trademarkNumber.trim() });
    if (existing) {
      return sendError(res, 'رقم العلامة التجارية مسجل بالفعل', 400);
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    }

    const trademark = await Trademark.create({
      image: imageUrl,
      trademarkNumber: trademarkNumber.trim(),
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      classNumber: classNum,
      ownerNameAr: ownerNameAr ? ownerNameAr.trim() : '',
      ownerNameEn: ownerNameEn ? ownerNameEn.trim() : '',
      nationality: nationality ? nationality.trim() : '',
      status: status || 'Active',
      filingDate: filingDate ? new Date(filingDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      agentName: agentName ? agentName.trim() : '',
    });

    return sendSuccess(res, trademark, 'تم إضافة العلامة التجارية بنجاح', 201);
  } catch (error) {
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
    const isExportAll = req.query.limit === 'all' || req.query.limit === '0' || req.query.all === 'true';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = isExportAll ? 0 : parseInt(req.query.limit, 10) || 20;
    const skip = isExportAll ? 0 : (page - 1) * limit;

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

    // 4. Search Filter
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { trademarkNumber: searchRegex },
        { nameAr: searchRegex },
        { nameEn: searchRegex },
        { ownerNameAr: searchRegex },
        { ownerNameEn: searchRegex },
        { nationality: searchRegex },
        { agentName: searchRegex },
      ];
    }

    // Sort order setup
    const sortOptions = {};
    const sortField = ['filingDate', 'expiryDate', 'trademarkNumber', 'createdAt', 'nameAr', 'nameEn', 'classNumber'].includes(sort)
      ? sort
      : 'createdAt';
    sortOptions[sortField] = order === 'asc' ? 1 : -1;

    let findQuery = Trademark.find(filter).sort(sortOptions);
    if (!isExportAll && limit > 0) {
      findQuery = findQuery.skip(skip).limit(limit);
    }

    const [trademarks, total] = await Promise.all([
      findQuery,
      Trademark.countDocuments(filter),
    ]);

    const totalPages = isExportAll ? 1 : Math.ceil(total / limit) || 1;

    return sendPaginated(
      res,
      trademarks,
      {
        page: isExportAll ? 1 : page,
        limit: isExportAll ? total : limit,
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
      return sendError(res, 'العلامة التجارية غير موجودة', 404);
    }

    const {
      trademarkNumber,
      nameAr,
      nameEn,
      classNumber,
      ownerNameAr,
      ownerNameEn,
      nationality,
      status,
      filingDate,
      expiryDate,
      agentName,
    } = req.body;

    // Check trademark number uniqueness if changed
    if (trademarkNumber && trademarkNumber.trim() !== trademark.trademarkNumber) {
      const existing = await Trademark.findOne({ trademarkNumber: trademarkNumber.trim() });
      if (existing) {
        return sendError(res, 'رقم العلامة التجارية مسجل بالفعل لعنصر آخر', 400);
      }
      trademark.trademarkNumber = trademarkNumber.trim();
    }

    if (nameAr) trademark.nameAr = nameAr.trim();
    if (nameEn) trademark.nameEn = nameEn.trim();

    if (classNumber !== undefined) {
      if (classNumber === '' || classNumber === null) {
        trademark.classNumber = null;
      } else {
        const classNum = parseInt(classNumber, 10);
        if (isNaN(classNum) || classNum <= 0) {
          return sendError(res, 'رقم الفئة يجب أن يكون رقماً صحيحاً موجباً', 400);
        }
        trademark.classNumber = classNum;
      }
    }

    if (ownerNameAr !== undefined) trademark.ownerNameAr = ownerNameAr ? ownerNameAr.trim() : '';
    if (ownerNameEn !== undefined) trademark.ownerNameEn = ownerNameEn ? ownerNameEn.trim() : '';
    if (nationality !== undefined) trademark.nationality = nationality ? nationality.trim() : '';
    if (status !== undefined) trademark.status = status;
    
    if (filingDate !== undefined) {
      trademark.filingDate = filingDate ? new Date(filingDate) : null;
    }

    if (expiryDate !== undefined) {
      trademark.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }

    if (agentName !== undefined) trademark.agentName = agentName ? agentName.trim() : '';

    // If new image uploaded, replace existing image and delete old image
    if (req.file) {
      const oldImage = trademark.image;
      const newImageUrl = await uploadImage(req.file);
      trademark.image = newImageUrl;

      if (oldImage) {
        deleteFile(oldImage).catch((err) => console.error('[StorageService] Error deleting old image:', err));
      }
    }

    await trademark.save();

    return sendSuccess(res, trademark, 'تم تحديث العلامة التجارية بنجاح');
  } catch (error) {
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

    if (trademark.image) {
      deleteFile(trademark.image).catch((err) => console.error('[StorageService] Error deleting image:', err));
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
