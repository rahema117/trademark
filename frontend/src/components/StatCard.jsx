import React from 'react';

const StatCard = ({ title, count, icon: Icon, color, bgColor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="card"
      style={{
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 1.5rem',
      }}
    >
      <div>
        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
          {title}
        </p>
        <h3 style={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          {count}
        </h3>
      </div>
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          backgroundColor: bgColor || 'rgba(2, 132, 199, 0.12)',
          color: color || '#0284c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {Icon && <Icon size={28} />}
      </div>
    </div>
  );
};

export default StatCard;
