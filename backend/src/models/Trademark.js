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
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
    },
    classNumber: {
      type: Number,
      validate: {
        validator: function (val) {
          return Number.isInteger(val) && val > 0;
        },
        message: 'Class number must be a positive integer',
      },
    },
    ownerNameAr: {
      type: String,
      trim: true,
    },
    ownerNameEn: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Pending', 'Expired', 'Cancelled'],
        message: 'Status must be one of: Active, Pending, Expired, Cancelled',
      },
      default: 'Active',
    },
    filingDate: {
      type: Date,
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
trademarkSchema.index({ trademarkNumber: 1 }, { unique: true });
trademarkSchema.index({ status: 1 });
trademarkSchema.index({ classNumber: 1 });
trademarkSchema.index({ filingDate: 1 });
trademarkSchema.index({ createdAt: -1 });

const Trademark = mongoose.model('Trademark', trademarkSchema);

module.exports = Trademark;
