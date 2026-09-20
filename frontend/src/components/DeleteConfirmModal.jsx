import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { deleteTrademark } from '../api/trademarkApi';

const DeleteConfirmModal = ({ isOpen, onClose, trademark, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !trademark) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await deleteTrademark(trademark._id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء حذف العلامة التجارية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
            <AlertTriangle size={22} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              تأكيد حذف العلامة التجارية
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              <span>{error}</span>
            </div>
          )}

          <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6 }}>
            هل أنت أصلًا متأكد من رغبتك في حذف العلامة التجارية{' '}
            <strong style={{ color: '#0f172a' }}>"{trademark.nameAr}"</strong> (رقم: {trademark.trademarkNumber})؟
          </p>

          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            ملاحظة: سيؤدي هذا الإجراء إلى مسح بيانات العلامة والصورة المرفقة بها بشكل نهائي من الخادم.
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
            إلغاء
          </button>
          <button onClick={handleDelete} className="btn btn-danger" disabled={loading}>
            <Trash2 size={18} />
            <span>{loading ? 'جاري الحذف...' : 'نعم، قم بالحذف'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
