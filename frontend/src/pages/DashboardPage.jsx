import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { getTrademarkStats } from '../api/trademarkApi';
import { Plus, ListFilter, CheckCircle2, Clock, XCircle, FileSpreadsheet, Shield } from 'lucide-react';

const DashboardPage = ({ onNavigateToTrademarks, onOpenAddModal }) => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    expired: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getTrademarkStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        setError(err.message || 'فشل جلب إحصائيات لوحة التحكم');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      {/* Top Banner & Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            نظرة عامة على لوحة التحكم
          </h2>
          <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            ملخص حالة العلامات التجارية المسجلة بالنظام
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem' }}>
          <button onClick={onOpenAddModal} className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            <Plus size={20} />
            <span>إضافة علامة جديدة</span>
          </button>
          <button onClick={() => onNavigateToTrademarks()} className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem' }}>
            <ListFilter size={20} />
            <span>عرض جميع العلامات</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <StatCard
          title="إجمالي العلامات"
          count={loading ? '...' : stats.total}
          icon={FileSpreadsheet}
          color="#0284c7"
          bgColor="#f0f9ff"
          onClick={() => onNavigateToTrademarks('')}
        />
        <StatCard
          title="علامات نشطة"
          count={loading ? '...' : stats.active}
          icon={CheckCircle2}
          color="#059669"
          bgColor="#ecfdf5"
          onClick={() => onNavigateToTrademarks('Active')}
        />
        <StatCard
          title="قيد الانتظار"
          count={loading ? '...' : stats.pending}
          icon={Clock}
          color="#d97706"
          bgColor="#fffbeb"
          onClick={() => onNavigateToTrademarks('Pending')}
        />
        <StatCard
          title="علامات منتهية"
          count={loading ? '...' : stats.expired}
          icon={XCircle}
          color="#dc2626"
          bgColor="#fef2f2"
          onClick={() => onNavigateToTrademarks('Expired')}
        />
        <StatCard
          title="علامات ملغاة"
          count={loading ? '...' : stats.cancelled}
          icon={Shield}
          color="#64748b"
          bgColor="#f1f5f9"
          onClick={() => onNavigateToTrademarks('Cancelled')}
        />
      </div>

      {/* Quick Welcome & Tips Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
          دليل استخدام النظام السريع
        </h3>
        <ul style={{ color: '#334155', paddingRight: '1.25rem', fontSize: '0.95rem', lineHeight: 1.8 }}>
          <li>يمكنك البحث الشامل بواسطة رقم العلامة، الاسم بالعربي أو الإنجليزي، اسم المالك أو الوكيل.</li>
          <li>تصفية العلامات بحسب رقم الفئة المخصصة أو النطاق الزمني لتاريخ الإيداع.</li>
          <li>رفع وحفظ شعارات العلامات مع إمكانية تحديث الصورة تلقائيًا ومسح الملفات القديمة.</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
