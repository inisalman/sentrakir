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
const DASHBOARD_PASSWORD = 'akbar2026';

const DashboardLogin = ({ onLogin, error, setError }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (password === DASHBOARD_PASSWORD) {
        localStorage.setItem('dashboard_auth', 'true');
        onLogin();
      } else {
        setError('Password salah. Coba lagi.');
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="dashboard-login">
      <div className="dashboard-login-bg">
        <div className="dashboard-login-particles">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
      <div className="dashboard-login-card">
        <div className="dashboard-login-header">
          <div className="dashboard-login-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18"/>
              <path d="M18 17V9"/>
              <path d="M13 17V5"/>
              <path d="M8 17v-3"/>
            </svg>
          </div>
          <h1 className="dashboard-login-title">Sentra Kir</h1>
          <p className="dashboard-login-subtitle">Dashboard Analytics</p>
        </div>

        <form className="dashboard-login-form" onSubmit={handleSubmit}>
          <div className="dashboard-login-field">
            <label htmlFor="password">Password</label>
            <div className="dashboard-login-input-wrapper">
              <span className="dashboard-login-input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="dashboard-login-input"
                placeholder="Masukkan password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="dashboard-login-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="dashboard-login-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="dashboard-login-btn" disabled={isLoading}>
            {isLoading ? (
              <span className="dashboard-login-spinner"></span>
            ) : (
              <>
                Masuk
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="dashboard-login-footer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Akses Terbatas - Hanya untuk Pemilik
        </div>
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
