import React, { useState, useEffect } from 'react';
import OverviewCards from './OverviewCards.jsx';
import {
  VisitorsChart,
  SourcesChart,
  PagesChart,
  CustomEventsChart,
  SEOCard,
  MonthlyChart,
} from './Charts.jsx';
import { getMockData } from '../../utils/mockData.js';
import '../../styles/dashboard.css';

// Simple password protection (for demo - in production use proper auth)
const DASHBOARD_PASSWORD = 'sentra2024';

const DashboardLogin = ({ onLogin, error, setError }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      localStorage.setItem('dashboard_auth', 'true');
      onLogin();
    } else {
      setError('Password salah. Coba lagi.');
    }
  };

  return (
    <div className="dashboard-login">
      <div className="dashboard-login-card">
        <div className="dashboard-login-logo">📊</div>
        <h1 className="dashboard-login-title">Sentra Kir Analytics</h1>
        <p className="dashboard-login-subtitle">Masuk untuk melihat dashboard bisnis</p>
        <form className="dashboard-login-form" onSubmit={handleSubmit}>
          <input
            type="password"
            className="dashboard-login-input"
            placeholder="Masukkan password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit" className="dashboard-login-btn">
            Masuk
          </button>
          {error && <p className="dashboard-login-error">{error}</p>}
        </form>
        <p style={{ marginTop: '24px', fontSize: '13px', color: '#718096' }}>
          💡 Default password: sentra2024
        </p>
      </div>
    </div>
  );
};

const DashboardContent = ({ onLogout, dateRange, setDateRange }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setData(getMockData());
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [dateRange]);

  const handleExportData = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      buttonClicks: JSON.parse(localStorage.getItem('sentrakir_button_clicks') || '{}'),
      summary: data?.stats,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentrakir-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Hapus semua data tracking? Ini tidak bisa di-undo.')) {
      localStorage.removeItem('sentrakir_button_clicks');
      setData(getMockData());
      alert('Data tracking berhasil dihapus.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p className="dashboard-loading-text">Memuat data analytics...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <span className="dashboard-logo">📊</span>
          <h1 className="dashboard-header-title">Sentra Kir Dashboard</h1>
        </div>
        <div className="dashboard-header-right">
          <div className="dashboard-date-range">
            <button
              className={`dashboard-date-btn ${dateRange === '7d' ? 'active' : ''}`}
              onClick={() => setDateRange('7d')}
            >
              7 Hari
            </button>
            <button
              className={`dashboard-date-btn ${dateRange === '30d' ? 'active' : ''}`}
              onClick={() => setDateRange('30d')}
            >
              30 Hari
            </button>
            <button
              className={`dashboard-date-btn ${dateRange === '90d' ? 'active' : ''}`}
              onClick={() => setDateRange('90d')}
            >
              90 Hari
            </button>
          </div>
          <div className="dashboard-quick-links">
            <button onClick={handleExportData} className="dashboard-quick-link" title="Export Data">
              📥 Export
            </button>
            <button onClick={handleClearData} className="dashboard-quick-link" title="Hapus Data" style={{ color: '#e53e3e' }}>
              🗑️ Clear
            </button>
          </div>
          <button className="dashboard-logout-btn" onClick={onLogout}>
            Keluar
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {/* Stats Overview */}
        <OverviewCards stats={data.stats} />

        {/* Charts Row */}
        <div className="dashboard-charts-grid">
          <VisitorsChart data={data.timeseries} />
          <SourcesChart data={data.sources} />
        </div>

        {/* Top Pages */}
        <PagesChart data={data.topPages} />

        {/* Bottom Row */}
        <div className="dashboard-bottom-grid">
          <CustomEventsChart data={data.customEvents} />
          <div className="dashboard-chart-card">
            <SEOCard data={data.seo} />
            <div style={{ marginTop: '24px' }}>
              <MonthlyChart data={data.monthlyData} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="dashboard-last-updated">
          Data dari browser ini • Diupdate: {new Date().toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </main>
    </div>
  );
};

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('dashboard_auth') === 'true'
  );
  const [loginError, setLoginError] = useState('');
  const [dateRange, setDateRange] = useState('30d');

  const handleLogin = () => {
    setIsAuthenticated(true);
    setLoginError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboard_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <DashboardLogin
        onLogin={handleLogin}
        error={loginError}
        setError={setLoginError}
      />
    );
  }

  return (
    <DashboardContent
      onLogout={handleLogout}
      dateRange={dateRange}
      setDateRange={setDateRange}
    />
  );
};

export default Dashboard;
