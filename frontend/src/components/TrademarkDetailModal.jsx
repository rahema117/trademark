import React from 'react';
import { X, Calendar, User, Shield, Hash, Layers, Image as ImageIcon, Clock, Globe } from 'lucide-react';
import { formatDate, formatDateTime, getStatusBadge, getImageUrl } from '../utils/formatters';

const TrademarkDetailModal = ({ isOpen, onClose, trademark }) => {
  if (!isOpen || !trademark) return null;

  const statusInfo = getStatusBadge(trademark.status);
  const imgUrl = getImageUrl(trademark.image);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
            تفاصيل العلامة التجارية
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {/* Top Header: Image & Status */}
          <div
            style={{
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'center',
              backgroundColor: '#f0f9ff',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #bae6fd',
              marginBottom: '1.5rem',
            }}
          >
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={trademark.nameAr}
                style={{
                  width: '90px',
                  height: '90px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              />
            ) : (
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '10px',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                }}
              >
                <ImageIcon size={36} />
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <span className={`badge ${statusInfo.className}`}>{statusInfo.label}</span>
                {trademark.classNumber ? (
                  <span
                    style={{
                      backgroundColor: '#e2e8f0',
                      color: '#0f172a',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    الفئة {trademark.classNumber}
                  </span>
                ) : null}
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                {trademark.nameAr || '-'}
              </h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0, direction: 'ltr', textAlign: 'right' }}>
                {trademark.nameEn || '-'}
              </p>
            </div>
          </div>

          {/* Key-Value Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem 1.5rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Hash size={14} /> رقم العلامة
              </span>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginTop: '0.2rem' }}>
                {trademark.trademarkNumber}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Globe size={14} /> الجنسية
              </span>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a', marginTop: '0.2rem' }}>
                {trademark.nationality || 'غير محدد'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} /> تاريخ الإيداع
              </span>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a', marginTop: '0.2rem' }}>
                {formatDate(trademark.filingDate)}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} /> تاريخ الانتهاء
              </span>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a', marginTop: '0.2rem' }}>
                {formatDate(trademark.expiryDate)}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} /> المالك (عربي)
              </span>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a', marginTop: '0.2rem' }}>
                {trademark.ownerNameAr || 'لا يوجد'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} /> المالك (إنجليزي)
              </span>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  marginTop: '0.2rem',
                  direction: 'ltr',
                  textAlign: 'right',
                }}
              >
                {trademark.ownerNameEn || 'لا يوجد'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Shield size={14} /> اسم الوكيل
              </span>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a', marginTop: '0.2rem' }}>
                {trademark.agentName || 'لا يوجد'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} /> آخر تحديث
              </span>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>
                {formatDateTime(trademark.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrademarkDetailModal;
