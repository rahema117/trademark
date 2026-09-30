const mongoose = require('mongoose');

const trademarkSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: '',
    },
    trademarkNumber: {
      type: String,
      required: [true, 'Trademark number is required'],
      unique: true,
      trim: true,
    },
    nameAr: {
      type: String,
      required: [true, 'اسم العلامة بالعربي مطلوب'],
      trim: true,
    },
    nameEn: {
      type: String,
      required: [true, 'اسم العلامة بالإنجليزي مطلوب'],
      trim: true,
    },
    classNumber: {
      type: Number,
      validate: {
        validator: function (val) {
          return val === null || val === undefined || (Number.isInteger(val) && val > 0);
        },
        message: 'Class number must be a positive integer',
      },
      default: null,
    },
    ownerNameAr: {
      type: String,
      trim: true,
      default: '',
    },
    ownerNameEn: {
      type: String,
      trim: true,
      default: '',
    },
    nationality: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Pending', 'Expired', 'Cancelled', ''],
        message: 'Status must be one of: Active, Pending, Expired, Cancelled',
      },
      default: 'Active',
    },
    filingDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    agentName: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Database Indexes for search & filtering efficiency
trademarkSchema.index({ status: 1 });
trademarkSchema.index({ classNumber: 1 });
trademarkSchema.index({ filingDate: 1 });
trademarkSchema.index({ expiryDate: 1 });
trademarkSchema.index({ createdAt: -1 });

const Trademark = mongoose.model('Trademark', trademarkSchema);

module.exports = Trademark;