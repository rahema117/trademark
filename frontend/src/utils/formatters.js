export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toISOString().split('T')[0];
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'Active':
      return { label: 'نشطة', className: 'badge-active' };
    case 'Pending':
      return { label: 'قيد الانتظار', className: 'badge-pending' };
    case 'Expired':
      return { label: 'منتهية', className: 'badge-expired' };
    case 'Cancelled':
      return { label: 'ملغاة', className: 'badge-cancelled' };
    default:
      return { label: status || '-', className: 'badge-cancelled' };
  }
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const backendHost = apiBaseUrl.replace(/\/api\/?$/, '');
  return `${backendHost}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
