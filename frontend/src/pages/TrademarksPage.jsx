import React, { useState } from 'react';
import { useTrademarks } from '../hooks/useTrademarks';
import TrademarkFilterBar from '../components/TrademarkFilterBar';
import TrademarkTable from '../components/TrademarkTable';
import TrademarkFormModal from '../components/TrademarkFormModal';
import TrademarkDetailModal from '../components/TrademarkDetailModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { getTrademarks } from '../api/trademarkApi';
import { exportTrademarksToExcel } from '../utils/excelExporter';
import { Plus, ChevronRight, ChevronLeft, FileSpreadsheet, AlertCircle } from 'lucide-react';

const TrademarksPage = ({ initialStatusFilter = '', isFormOpen, setIsFormOpen }) => {
  const {
    trademarks,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    resetFilters,
    refresh,
  } = useTrademarks({ status: initialStatusFilter });

  const [selectedMap, setSelectedMap] = useState({});
  const [selectedTrademark, setSelectedTrademark] = useState(null);
  const [trademarkToEdit, setTrademarkToEdit] = useState(null);
  const [trademarkToDelete, setTrademarkToDelete] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [exportMessage, setExportMessage] = useState('');
  const [exportingAll, setExportingAll] = useState(false);

  const selectedIds = Object.keys(selectedMap);

  const handleSelectToggle = (id) => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        const found = trademarks.find((t) => t._id === id);
        if (found) next[id] = found;
      }
      return next;
    });
  };

  const handleSelectAllToggle = () => {
    const currentIds = trademarks.map((tm) => tm._id);
    const allCurrentSelected = currentIds.every((id) => !!selectedMap[id]);

    setSelectedMap((prev) => {
      const next = { ...prev };
      if (allCurrentSelected) {
        currentIds.forEach((id) => delete next[id]);
      } else {
        trademarks.forEach((tm) => {
          next[tm._id] = tm;
        });
      }
      return next;
    });
  };

  const handleExportSelected = () => {
    setExportMessage('');
    if (selectedIds.length === 0) {
      setExportMessage('Please select at least one trademark to export.');
      return;
    }
    const selectedList = Object.values(selectedMap);
    exportTrademarksToExcel(selectedList, 'selected-trademarks.xlsx');
  };

  const handleExportAll = async () => {
    setExportMessage('');
    setExportingAll(true);
    try {
      const res = await getTrademarks({ limit: 'all', ...filters });
      if (res.success && res.data) {
        exportTrademarksToExcel(res.data, 'trademarks.xlsx');
      } else {
        setExportMessage('حدث خطأ أثناء جلب البيانات للتصدير');
      }
    } catch (err) {
      setExportMessage(err.message || 'فشل في تصدير البيانات');
    } finally {
      setExportingAll(false);
    }
  };

  const handleOpenAddModal = () => {
    setTrademarkToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (trademark) => {
    setTrademarkToEdit(trademark);
    setIsFormOpen(true);
  };

  const handleOpenDetailModal = (trademark) => {
    setSelectedTrademark(trademark);
    setIsDetailOpen(true);
  };

  const handleOpenDeleteModal = (trademark) => {
    setTrademarkToDelete(trademark);
    setIsDeleteOpen(true);
  };

  return (
    <div>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            سجل العلامات التجارية
          </h2>
          <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            عرض، تصفية، تصدير وتعديل العلامات المسجلة بالنظام
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleExportSelected}
            className="btn btn-secondary"
            title="تصدير العلامات المحددة فقط"
          >
            <FileSpreadsheet size={18} style={{ color: '#16a34a' }} />
            <span>تصدير المحدد ({selectedIds.length})</span>
          </button>

          <button
            onClick={handleExportAll}
            disabled={exportingAll}
            className="btn btn-secondary"
            title="تصدير جميع العلامات"
          >
            <FileSpreadsheet size={18} style={{ color: '#0284c7' }} />
            <span>{exportingAll ? 'جاري التصدير...' : 'تصدير الكل'}</span>
          </button>

          <button onClick={handleOpenAddModal} className="btn btn-primary">
            <Plus size={20} />
            <span>إضافة علامة جديدة</span>
          </button>
        </div>
      </div>

      {(error || exportMessage) && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{exportMessage || error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <TrademarkFilterBar
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
      />

      {/* Trademark Table */}
      <TrademarkTable
        trademarks={trademarks}
        loading={loading}
        selectedIds={selectedIds}
        onSelectToggle={handleSelectToggle}
        onSelectAllToggle={handleSelectAllToggle}
        onView={handleOpenDetailModal}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
      />

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1.5rem',
            padding: '1rem 1.25rem',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
            عرض الصفحة {pagination.page} من إجمالي {pagination.totalPages} صفحات ({pagination.total} عنصر)
          </span>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => updateFilters({ page: pagination.page - 1 })}
              disabled={pagination.page <= 1 || loading}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            >
              <ChevronRight size={18} />
              <span>السابق</span>
            </button>

            <button
              onClick={() => updateFilters({ page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            >
              <span>التالي</span>
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Form Modal (Add/Edit) */}
      <TrademarkFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        trademarkToEdit={trademarkToEdit}
        onSuccess={refresh}
      />

      {/* Detail Modal */}
      <TrademarkDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        trademark={selectedTrademark}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        trademark={trademarkToDelete}
        onSuccess={refresh}
      />
    </div>
  );
};

export default TrademarksPage;
