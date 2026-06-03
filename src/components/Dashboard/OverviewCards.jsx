import React from 'react';

const StatCard = ({ icon, iconClass, label, value, trend, trendDirection }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className={`stat-card-icon ${iconClass}`}>
          {icon}
        </div>
        {trend && (
          <div className={`stat-card-trend ${trendDirection}`}>
            <span>{trendDirection === 'up' ? '↑' : '↓'}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
};

const OverviewCards = ({ stats }) => {
  return (
    <div className="dashboard-stats-grid">
      <StatCard
        icon="👁️"
        iconClass="visitors"
        label="Total Pengunjung"
        value={stats.visitors?.value?.toLocaleString() || '0'}
        trend={stats.visitors?.change}
        trendDirection={stats.visitors?.change >= 0 ? 'up' : 'down'}
      />
      <StatCard
        icon="💬"
        iconClass="whatsapp"
        label="WhatsApp Klik"
        value={stats.whatsapp_clicks?.value || '0'}
        trend={stats.whatsapp_clicks?.change}
        trendDirection={stats.whatsapp_clicks?.change >= 0 ? 'up' : 'down'}
      />
      <StatCard
        icon="✅"
        iconClass="conversions"
        label="Customer Terkonversi"
        value={stats.conversions?.value || '0'}
        trend={stats.conversions?.change}
        trendDirection={stats.conversions?.change >= 0 ? 'up' : 'down'}
      />
      <StatCard
        icon="📊"
        iconClass="bounce"
        label="Bounce Rate"
        value={`${stats.bounce_rate?.value || '0'}%`}
        trend={Math.abs(stats.bounce_rate?.change)}
        trendDirection={stats.bounce_rate?.change <= 0 ? 'up' : 'down'}
      />
    </div>
  );
};

export default OverviewCards;
