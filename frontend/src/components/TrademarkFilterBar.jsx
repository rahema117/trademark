import React from 'react';
import { Search, RotateCcw, Filter, Calendar } from 'lucide-react';

const TrademarkFilterBar = ({ filters, updateFilters, resetFilters }) => {
  return (
    <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'end',
        }}
      >
        {/* Search Field */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">البحث (رقم، اسم، مالك، وكيل)</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="ابحث هنا..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
              }}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">الحالة</label>
          <select
            className="form-control"
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
          >
            <option value="">جميع الحالات</option>
            <option value="Active">نشطة (Active)</option>
            <option value="Pending">قيد الانتظار (Pending)</option>
            <option value="Expired">منتهية (Expired)</option>
            <option value="Cancelled">ملغاة (Cancelled)</option>
          </select>
        </div>

        {/* Class Number Filter */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">الفئة (Class)</label>
          <input
            type="number"
            min="1"
            className="form-control"
            placeholder="مثال: 35"
            value={filters.classNumber}
            onChange={(e) => updateFilters({ classNumber: e.target.value })}
          />
        </div>

        {/* Filing Date From */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">تاريخ الإيداع من</label>
          <input
            type="date"
            className="form-control"
            value={filters.filingDateFrom}
            onChange={(e) => updateFilters({ filingDateFrom: e.target.value })}
          />
        </div>

        {/* Filing Date To */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">تاريخ الإيداع إلى</label>
          <input
            type="date"
            className="form-control"
            value={filters.filingDateTo}
            onChange={(e) => updateFilters({ filingDateTo: e.target.value })}
          />
        </div>

        {/* Sort Field & Reset Button */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <label className="form-label">الترتيب حسب</label>
            <select
              className="form-control"
              value={`${filters.sort}_${filters.order}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('_');
                updateFilters({ sort, order });
              }}
            >
              <option value="createdAt_desc">الأحدث إضافة</option>
              <option value="createdAt_asc">الأقدم إضافة</option>
              <option value="filingDate_desc">تاريخ الإيداع (الأحدث)</option>
              <option value="filingDate_asc">تاريخ الإيداع (الأقدم)</option>
              <option value="trademarkNumber_asc">رقم العلامة (تصاعدي)</option>
              <option value="trademarkNumber_desc">رقم العلامة (تنازلي)</option>
              <option value="nameAr_asc">الاسم العربي (أ-ي)</option>
            </select>
          </div>

          <button
            onClick={resetFilters}
            className="btn btn-secondary"
            title="إعادة ضبط الفلاتر"
            style={{ height: '42px', marginTop: 'auto', padding: '0 0.85rem' }}
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrademarkFilterBar;
