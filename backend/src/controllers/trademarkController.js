const ExcelJS = require('exceljs');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

const Trademark = require('../models/Trademark');
const { sendSuccess, sendPaginated, sendError } = require('../utils/responseHandler');
const { uploadImage, deleteFile } = require('../services/storageService');

/**
 * Helper to download/read image buffer for Excel embedding
 */
const fetchImageBuffer = async (imagePath) => {
  if (!imagePath) return null;

  try {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      let fullUrl = imagePath;
      
      // For Cloudinary URLs, force PNG conversion so ExcelJS gets a supported format
      if (fullUrl.includes('cloudinary.com')) {
        fullUrl = fullUrl.replace(/\/upload\/(?:f_[^\/]+\/)?/, '/upload/f_png/').replace(/\.webp$/i, '.png');
      }

      return new Promise((resolve) => {
        const client = fullUrl.startsWith('https') ? https : http;
        const req = client.get(fullUrl, (res) => {
          // Handle HTTP redirects (301, 302, 307)
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return resolve(fetchImageBuffer(res.headers.location));
          }

          if (res.statusCode !== 200) {
            return resolve(null);
          }

          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
            const buffer = Buffer.concat(chunks);
            if (!buffer || buffer.length === 0) return resolve(null);

            // Validate image magic bytes to ensure supported format (PNG, JPEG, GIF)
            const isPng = buffer.length > 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
            const isJpeg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
            const isGif = buffer.length > 3 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;

            let extension = null;
            if (isPng) extension = 'png';
            else if (isJpeg) extension = 'jpeg';
            else if (isGif) extension = 'gif';

            if (!extension) {
              console.warn('[ExcelExport] Image format unrecognized or unsupported (e.g. WebP), skipping embedding for this row.');
              return resolve(null);
            }

            resolve({ buffer, extension });
          });
          res.on('error', () => resolve(null));
        });

        req.on('error', () => resolve(null));
        req.setTimeout(10000, () => {
          req.destroy();
          resolve(null);
        });
      });
    } else {
      const localPath = path.isAbsolute(imagePath)
        ? imagePath
        : path.join(process.cwd(), imagePath.startsWith('/') ? imagePath.slice(1) : imagePath);

      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const ext = path.extname(localPath).toLowerCase().replace('.', '');
        const extension = ext === 'jpg' ? 'jpeg' : (ext || 'png');
        if (extension !== 'png' && extension !== 'jpeg' && extension !== 'gif') {
          return null;
        }
        return { buffer, extension };
      }
    }
  } catch (err) {
    console.error('[ExcelExport] Image fetch error:', err.message);
  }
  return null;
};

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

/**
 * @desc    Export trademarks to Excel with embedded images
 * @route   POST /api/trademarks/export
 * @access  Private
 */
const exportTrademarks = async (req, res, next) => {
  try {
    const { ids, search, status, classNumber, filingDateFrom, filingDateTo, sort = 'createdAt', order = 'desc' } = req.body || {};

    let filter = {};

    if (Array.isArray(ids) && ids.length > 0) {
      filter._id = { $in: ids };
    } else {
      if (status) filter.status = status;
      if (classNumber) {
        const parsedClass = parseInt(classNumber, 10);
        if (!isNaN(parsedClass)) filter.classNumber = parsedClass;
      }
      if (filingDateFrom || filingDateTo) {
        filter.filingDate = {};
        if (filingDateFrom) filter.filingDate.$gte = new Date(filingDateFrom);
        if (filingDateTo) {
          const toDate = new Date(filingDateTo);
          toDate.setHours(23, 59, 59, 999);
          filter.filingDate.$lte = toDate;
        }
      }
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
    }

    const sortOptions = {};
    const sortField = ['filingDate', 'expiryDate', 'trademarkNumber', 'createdAt', 'nameAr', 'nameEn', 'classNumber'].includes(sort)
      ? sort
      : 'createdAt';
    sortOptions[sortField] = order === 'asc' ? 1 : -1;

    const trademarks = await Trademark.find(filter).sort(sortOptions);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Trademarks');

    worksheet.columns = [
      { header: 'Image', key: 'image', width: 16 },
      { header: 'Trademark Number', key: 'trademarkNumber', width: 20 },
      { header: 'Trademark Name Arabic', key: 'nameAr', width: 25 },
      { header: 'Trademark Name English', key: 'nameEn', width: 25 },
      { header: 'Class', key: 'classNumber', width: 12 },
      { header: 'Owner Name Arabic', key: 'ownerNameAr', width: 25 },
      { header: 'Owner Name English', key: 'ownerNameEn', width: 25 },
      { header: 'Nationality', key: 'nationality', width: 15 },
      { header: 'Filing Date', key: 'filingDate', width: 16 },
      { header: 'Expiry Date', key: 'expiryDate', width: 16 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Agent Name', key: 'agentName', width: 22 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0284C7' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    const formatDateStr = (dateVal) => {
      if (!dateVal) return '';
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    };

    for (let i = 0; i < trademarks.length; i++) {
      const tm = trademarks[i];
      const rowIdx = i + 2;

      worksheet.addRow({
        image: '',
        trademarkNumber: tm.trademarkNumber || '',
        nameAr: tm.nameAr || '',
        nameEn: tm.nameEn || '',
        classNumber: tm.classNumber !== null && tm.classNumber !== undefined ? tm.classNumber : '',
        ownerNameAr: tm.ownerNameAr || '',
        ownerNameEn: tm.ownerNameEn || '',
        nationality: tm.nationality || '',
        filingDate: formatDateStr(tm.filingDate),
        expiryDate: formatDateStr(tm.expiryDate),
        status: tm.status || '',
        agentName: tm.agentName || '',
      });

      const row = worksheet.getRow(rowIdx);
      row.height = 55;
      row.alignment = { vertical: 'middle', horizontal: 'left' };

      // Align cells
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }; // Image cell
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' }; // TM Number
      row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' }; // Class
      row.getCell(9).alignment = { vertical: 'middle', horizontal: 'center' }; // Filing Date
      row.getCell(10).alignment = { vertical: 'middle', horizontal: 'center' }; // Expiry Date
      row.getCell(11).alignment = { vertical: 'middle', horizontal: 'center' }; // Status

      // Download and embed image if available
      if (tm.image) {
        const imgData = await fetchImageBuffer(tm.image);
        if (imgData && imgData.buffer && imgData.buffer.length > 0) {
          try {
            const imageId = workbook.addImage({
              buffer: imgData.buffer,
              extension: imgData.extension,
            });

            worksheet.addImage(imageId, {
              tl: { col: 0.18, row: rowIdx - 1 + 0.1 },
              ext: { width: 50, height: 50 },
              editAs: 'oneCell',
            });
          } catch (embedErr) {
            console.error('[ExcelExport] Error embedding image for row:', rowIdx, embedErr.message);
          }
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="trademarks.xlsx"');
    res.setHeader('Content-Length', buffer.byteLength || buffer.length);

    return res.send(Buffer.from(buffer));
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
  exportTrademarks,
};
