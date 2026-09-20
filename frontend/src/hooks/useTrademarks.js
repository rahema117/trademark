import { useState, useEffect, useCallback } from 'react';
import { getTrademarks } from '../api/trademarkApi';

export const useTrademarks = (initialParams = {}) => {
  const [trademarks, setTrademarks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    search: initialParams.search || '',
    status: initialParams.status || '',
    classNumber: initialParams.classNumber || '',
    filingDateFrom: initialParams.filingDateFrom || '',
    filingDateTo: initialParams.filingDateTo || '',
    page: initialParams.page || 1,
    limit: initialParams.limit || 20,
    sort: initialParams.sort || 'createdAt',
    order: initialParams.order || 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrademarksList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build active params object
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.classNumber) params.classNumber = filters.classNumber;
      if (filters.filingDateFrom) params.filingDateFrom = filters.filingDateFrom;
      if (filters.filingDateTo) params.filingDateTo = filters.filingDateTo;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.sort) params.sort = filters.sort;
      if (filters.order) params.order = filters.order;

      const res = await getTrademarks(params);

      if (res.success) {
        setTrademarks(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'فشل في جلب العلامات التجارية');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTrademarksList();
  }, [fetchTrademarksList]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 if search/filter values change (unless page was explicitly updated)
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      classNumber: '',
      filingDateFrom: '',
      filingDateTo: '',
      page: 1,
      limit: 20,
      sort: 'createdAt',
      order: 'desc',
    });
  };

  return {
    trademarks,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    resetFilters,
    refresh: fetchTrademarksList,
  };
};
