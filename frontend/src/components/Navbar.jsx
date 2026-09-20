import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, LayoutDashboard, FileText } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { admin, logout } = useAuth();

  return (
    <header
      style={{
        backgroundColor: '#0284c7',
        backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderBottom: '1px solid #0284c7',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
      }}
    >
      <div
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '0.6rem',
              borderRadius: '10px',
              display: 'flex',
              color: '#ffffff',
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              نظام إدارة العلامات التجارية
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#e0f2fe' }}>لوحة التحكم الخاصة بالمسؤول</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="btn"
            style={{
              fontSize: '0.9rem',
              backgroundColor: activeTab === 'dashboard' ? '#ffffff' : 'rgba(255, 255, 255, 0.15)',
              color: activeTab === 'dashboard' ? '#0284c7' : '#ffffff',
              boxShadow: activeTab === 'dashboard' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              fontWeight: 700,
            }}
          >
            <LayoutDashboard size={18} />
            الرئيسية
          </button>
          <button
            onClick={() => setActiveTab('trademarks')}
            className="btn"
            style={{
              fontSize: '0.9rem',
              backgroundColor: activeTab === 'trademarks' ? '#ffffff' : 'rgba(255, 255, 255, 0.15)',
              color: activeTab === 'trademarks' ? '#0284c7' : '#ffffff',
              boxShadow: activeTab === 'trademarks' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              fontWeight: 700,
            }}
          >
            <FileText size={18} />
            العلامات التجارية
          </button>
        </nav>

        {/* Admin info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#f0f9ff', fontWeight: 500 }}>
            {admin?.email}
          </span>
          <button
            onClick={logout}
            className="btn"
            title="تسجيل الخروج"
            style={{
              padding: '0.5rem 0.85rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <LogOut size={18} />
            <span style={{ fontSize: '0.85rem' }}>خروج</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
