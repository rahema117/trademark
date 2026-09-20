import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TrademarksPage from './pages/TrademarksPage';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          color: '#0284c7',
          fontSize: '1.2rem',
          fontWeight: 700,
        }}
      >
        جاري التحميل والتأكد من بيانات الجلسة...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleNavigateToTrademarks = (filterStatus = '') => {
    setStatusFilter(filterStatus);
    setActiveTab('trademarks');
  };

  const handleOpenAddModal = () => {
    setActiveTab('trademarks');
    setIsFormOpen(true);
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'dashboard' ? (
          <DashboardPage
            onNavigateToTrademarks={handleNavigateToTrademarks}
            onOpenAddModal={handleOpenAddModal}
          />
        ) : (
          <TrademarksPage
            initialStatusFilter={statusFilter}
            isFormOpen={isFormOpen}
            setIsFormOpen={setIsFormOpen}
          />
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
