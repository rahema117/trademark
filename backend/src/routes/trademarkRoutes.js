const express = require('express');
const router = express.Router();
const {
  createTrademark,
  getTrademarks,
  getTrademarkStats,
  getTrademarkById,
  updateTrademark,
  deleteTrademark,
  exportTrademarks,
} = require('../controllers/trademarkController');
const { protect } = require('../middleware/authMiddleware');
const uploadSingleImage = require('../middleware/uploadMiddleware');

// All trademark routes are protected
router.use(protect);

router.get('/stats', getTrademarkStats);
router.post('/export', exportTrademarks);
router.get('/', getTrademarks);
router.post('/', uploadSingleImage, createTrademark);
router.get('/:id', getTrademarkById);
router.put('/:id', uploadSingleImage, updateTrademark);
router.delete('/:id', deleteTrademark);

module.exports = router;
