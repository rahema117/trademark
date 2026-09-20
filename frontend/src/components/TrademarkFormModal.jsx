import React, { useState, useEffect } from 'react';
import { X, Upload, Save, AlertCircle } from 'lucide-react';
import { createTrademark, updateTrademark } from '../api/trademarkApi';
import { formatDate, getImageUrl } from '../utils/formatters';

const TrademarkFormModal = ({ isOpen, onClose, trademarkToEdit, onSuccess }) => {
  const isEditMode = !!trademarkToEdit;

  const [formData, setFormData] = useState({
    trademarkNumber: '',
    nameAr: '',
    nameEn: '',
    classNumber: '',
    ownerNameAr: '',
    ownerNameEn: '',
    status: 'Active',
    filingDate: '',
    agentName: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (trademarkToEdit) {
      setFormData({
        trademarkNumber: trademarkToEdit.trademarkNumber || '',
        nameAr: trademarkToEdit.nameAr || '',
        nameEn: trademarkToEdit.nameEn || '',
        classNumber: trademarkToEdit.classNumber || '',
        ownerNameAr: trademarkToEdit.ownerNameAr || '',
        ownerNameEn: trademarkToEdit.ownerNameEn || '',
        status: trademarkToEdit.status || 'Active',
        filingDate: formatDate(trademarkToEdit.filingDate),
        agentName: trademarkToEdit.agentName || '',
      });
      setImagePreview(getImageUrl(trademarkToEdit.image));
    } else {
      setFormData({
        trademarkNumber: '',
        nameAr: '',
        nameEn: '',
        classNumber: '',
        ownerNameAr: '',
        ownerNameEn: '',
        status: 'Active',
        filingDate: new Date().toISOString().split('T')[0],
        agentName: '',
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setErrorMessage('');
  }, [trademarkToEdit, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.mimetype) && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
        setErrorMessage('مسموح فقط برفع الصور بصيغ (JPG, JPEG, PNG, WEBP)');
        return;
      }
      // Validate size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('حجم الصورة يتجاوز الحد المسموح به (5 ميجابايت)');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic frontend validations
    if (
      !formData.trademarkNumber ||
      !formData.nameAr ||
      !formData.nameEn ||
      !formData.classNumber ||
      !formData.ownerNameAr ||
      !formData.ownerNameEn ||
      !formData.status ||
      !formData.filingDate
    ) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const classNum = parseInt(formData.classNumber, 10);
    if (isNaN(classNum) || classNum <= 0) {
      setErrorMessage('رقم الفئة يجب أن يكون رقماً صحيحاً موجباً');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('trademarkNumber', formData.trademarkNumber.trim());
      data.append('nameAr', formData.nameAr.trim());
      data.append('nameEn', formData.nameEn.trim());
      data.append('classNumber', classNum);
      data.append('ownerNameAr', formData.ownerNameAr.trim());
      data.append('ownerNameEn', formData.ownerNameEn.trim());
      data.append('status', formData.status);
      data.append('filingDate', formData.filingDate);
      data.append('agentName', formData.agentName.trim());

      if (imageFile) {
        data.append('image', imageFile);
      }

      if (isEditMode) {
        await updateTrademark(trademarkToEdit._id, data);
      } else {
        await createTrademark(data);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ العلامة التجارية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
            {isEditMode ? 'تعديل بيانات العلامة التجارية' : 'إضافة علامة تجارية جديدة'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMessage && (
              <div className="alert alert-danger">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Image Upload Area */}
            <div className="form-group">
              <label className="form-label">صورة العلامة / الشعار</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="معاينة"
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                    }}
                  />
                )}
                <label
                  className="btn btn-secondary"
                  style={{ cursor: 'pointer', flex: 1, justifyContent: 'center' }}
                >
                  <Upload size={18} />
                  <span>{imagePreview ? 'تغيير الصورة' : 'رفع صورة (JPG, PNG, WEBP)'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Trademark Number */}
              <div className="form-group">
                <label className="form-label">رقم العلامة التجارية *</label>
                <input
                  type="text"
                  name="trademarkNumber"
                  className="form-control"
                  placeholder="مثال: TM-98234"
                  value={formData.trademarkNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Class Number */}
              <div className="form-group">
                <label className="form-label">رقم الفئة (Class) *</label>
                <input
                  type="number"
                  name="classNumber"
                  min="1"
                  className="form-control"
                  placeholder="مثال: 35"
                  value={formData.classNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Arabic Name */}
              <div className="form-group">
                <label className="form-label">اسم العلامة (عربي) *</label>
                <input
                  type="text"
                  name="nameAr"
                  className="form-control"
                  placeholder="اسم العلامة بالعربي"
                  value={formData.nameAr}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* English Name */}
              <div className="form-group">
                <label className="form-label">اسم العلامة (إنجليزي) *</label>
                <input
                  type="text"
                  name="nameEn"
                  className="form-control"
                  placeholder="Trademark English Name"
                  style={{ direction: 'ltr', textAlign: 'right' }}
                  value={formData.nameEn}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Arabic Owner Name */}
              <div className="form-group">
                <label className="form-label">اسم المالك (عربي) *</label>
                <input
                  type="text"
                  name="ownerNameAr"
                  className="form-control"
                  placeholder="اسم المالك بالعربي"
                  value={formData.ownerNameAr}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* English Owner Name */}
              <div className="form-group">
                <label className="form-label">اسم المالك (إنجليزي) *</label>
                <input
                  type="text"
                  name="ownerNameEn"
                  className="form-control"
                  placeholder="Owner English Name"
                  style={{ direction: 'ltr', textAlign: 'right' }}
                  value={formData.ownerNameEn}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Status */}
              <div className="form-group">
                <label className="form-label">الحالة *</label>
                <select
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Active">نشطة (Active)</option>
                  <option value="Pending">قيد الانتظار (Pending)</option>
                  <option value="Expired">منتهية (Expired)</option>
                  <option value="Cancelled">ملغاة (Cancelled)</option>
                </select>
              </div>

              {/* Filing Date */}
              <div className="form-group">
                <label className="form-label">تاريخ الإيداع *</label>
                <input
                  type="date"
                  name="filingDate"
                  className="form-control"
                  value={formData.filingDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Agent Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">اسم الوكيل (اختياري)</label>
              <input
                type="text"
                name="agentName"
                className="form-control"
                placeholder="اسم شركة الوكالة أو الوكيل"
                value={formData.agentName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              إلغاء
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Save size={18} />
              <span>{loading ? 'جاري الحفظ...' : isEditMode ? 'تحديث البيانات' : 'حفظ العلامة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrademarkFormModal;
