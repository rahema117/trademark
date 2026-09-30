import React from 'react';
import { Eye, Edit3, Trash2, Image as ImageIcon } from 'lucide-react';
import { formatDate, getStatusBadge, getImageUrl } from '../utils/formatters';

const TrademarkTable = ({
  trademarks,
  loading,
  selectedIds = [],
  onSelectToggle,
  onSelectAllToggle,
  onView,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ color: '#0284c7', fontWeight: 600, fontSize: '1.1rem' }}>
          جاري تحميل العلامات التجارية...
        </div>
      </div>
    );
  }

  if (!trademarks || trademarks.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>
          لا توجد علامات تجارية مسجلة أو مطابقة لمعايير البحث.
        </p>
      </div>
    );
  }

  const allSelected = trademarks.length > 0 && trademarks.every((tm) => selectedIds.includes(tm._id));

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '40px', textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAllToggle}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                title="تحديد الكل"
              />
            </th>
            <th style={{ width: '70px' }}>الصورة</th>
            <th>رقم العلامة</th>
            <th>اسم العلامة (عربي)</th>
            <th>اسم العلامة (إنجليزي)</th>
            <th>الفئة</th>
            <th>المالك</th>
            <th>الجنسية</th>
            <th>الحالة</th>
            <th>تاريخ الإيداع</th>
            <th>تاريخ الانتهاء</th>
            <th>اسم الوكيل</th>
            <th style={{ textAlign: 'center' }}>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {trademarks.map((tm) => {
            const statusInfo = getStatusBadge(tm.status);
            const imgUrl = getImageUrl(tm.image);
            const isSelected = selectedIds.includes(tm._id);

            return (
              <tr key={tm._id} style={{ backgroundColor: isSelected ? '#f0f9ff' : undefined }}>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectToggle(tm._id)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </td>
                <td>
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={tm.nameAr || tm.nameEn}
                      className="trademark-img-thumb"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="trademark-img-thumb"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                      }}
                    >
                      <ImageIcon size={20} />
                    </div>
                  )}
                </td>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>
                  {tm.trademarkNumber}
                </td>
                <td style={{ fontWeight: 600 }}>{tm.nameAr || '-'}</td>
                <td style={{ direction: 'ltr', textAlign: 'right' }}>{tm.nameEn || '-'}</td>
                <td>
                  {tm.classNumber ? (
                    <span
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontWeight: 700,
                      }}
                    >
                      {tm.classNumber}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{tm.ownerNameAr || '-'}</div>
                  {tm.ownerNameEn && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', direction: 'ltr', textAlign: 'right' }}>
                      {tm.ownerNameEn}
                    </div>
                  )}
                </td>
                <td>{tm.nationality || '-'}</td>
                <td>
                  <span className={`badge ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </td>
                <td>{formatDate(tm.filingDate)}</td>
                <td>{formatDate(tm.expiryDate)}</td>
                <td>{tm.agentName || '-'}</td>
                <td>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <button
                      onClick={() => onView(tm)}
                      className="btn-icon"
                      title="عرض التفاصيل"
                      style={{ color: '#0284c7' }}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onEdit(tm)}
                      className="btn-icon"
                      title="تعديل"
                      style={{ color: '#d97706' }}
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(tm)}
                      className="btn-icon"
                      title="حذف"
                      style={{ color: '#dc2626' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TrademarkTable;
