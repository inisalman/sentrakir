import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#3182ce', '#38a169', '#dd6b20', '#805ad5', '#e53e3e', '#d69e2e', '#319795', '#718096'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        padding: '12px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}>
        <p style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, fontSize: '14px' }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Visitors Line Chart
export const VisitorsChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="dashboard-chart-card">
      <div className="dashboard-chart-header">
        <div>
          <h3 className="dashboard-chart-title">Tren Pengunjung</h3>
          <p className="dashboard-chart-subtitle">Jumlah pengunjung per hari</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => {
              const d = new Date(date);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
            stroke="#718096"
            fontSize={12}
          />
          <YAxis stroke="#718096" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="visitors"
            name="Pengunjung"
            stroke="#3182ce"
            strokeWidth={2}
            dot={{ fill: '#3182ce', r: 3 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="pageviews"
            name="Pageviews"
            stroke="#38a169"
            strokeWidth={2}
            dot={{ fill: '#38a169', r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Traffic Sources Pie Chart
export const SourcesChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const chartData = data.map(item => ({
    name: item.source,
    value: item.visitors,
  }));

  return (
    <div className="dashboard-chart-card">
      <div className="dashboard-chart-header">
        <div>
          <h3 className="dashboard-chart-title">Sumber Traffic</h3>
          <p className="dashboard-chart-subtitle">Asal pengunjung</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value) => <span style={{ color: '#2d3748', fontSize: '13px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="dashboard-sources-list">
        {data.slice(0, 5).map((source, index) => (
          <div key={source.source} className="dashboard-source-item">
            <div
              className="dashboard-source-icon"
              style={{ background: `${source.color}20`, color: source.color }}
            >
              {index + 1}
            </div>
            <div className="dashboard-source-info">
              <div className="dashboard-source-name">{source.source}</div>
              <div className="dashboard-source-bar">
                <div
                  className="dashboard-source-bar-fill"
                  style={{ width: `${source.percentage}%`, background: source.color }}
                />
              </div>
            </div>
            <div className="dashboard-source-value">{source.percentage}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Top Pages Bar Chart
export const PagesChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="dashboard-pages-card">
      <div className="dashboard-chart-header">
        <div>
          <h3 className="dashboard-chart-title">Halaman Populer</h3>
          <p className="dashboard-chart-subtitle">Halaman dengan visitor tertinggi</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" stroke="#718096" fontSize={12} />
          <YAxis
            type="category"
            dataKey="page"
            width={100}
            stroke="#718096"
            fontSize={12}
            tickFormatter={(page) => page.length > 15 ? page.substring(0, 15) + '...' : page}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="visitors" name="Pengunjung" fill="#3182ce" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Halaman</th>
            <th>Pengunjung</th>
            <th>Pageviews</th>
            <th>Bounce Rate</th>
          </tr>
        </thead>
        <tbody>
          {data.map((page) => (
            <tr key={page.page}>
              <td className="dashboard-table-url">{page.page}</td>
              <td>{page.visitors.toLocaleString()}</td>
              <td>{page.pageviews.toLocaleString()}</td>
              <td>{page.bounce_rate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Custom Events Chart
export const CustomEventsChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="dashboard-chart-card">
      <div className="dashboard-chart-header">
        <div>
          <h3 className="dashboard-chart-title">Button & Event Tracking</h3>
          <p className="dashboard-chart-subtitle">Interaksi user di website</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="event" stroke="#718096" fontSize={11} angle={-15} textAnchor="end" height={60} />
          <YAxis stroke="#718096" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" name="Klik" fill="#38a169" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="dashboard-events-grid">
        {data.map((event) => (
          <div key={event.event} className="dashboard-event-item">
            <div className="dashboard-event-left">
              <div className="dashboard-event-icon" style={{ background: '#f0fff4' }}>
                {event.icon}
              </div>
              <div>
                <div className="dashboard-event-name">{event.event}</div>
                <div className="dashboard-event-label">Custom Event</div>
              </div>
            </div>
            <div className="dashboard-event-value">{event.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// SEO Score Card
export const SEOCard = ({ data }) => {
  const getScoreClass = (score) => {
    if (score >= 90) return 'good';
    if (score >= 50) return 'medium';
    return 'low';
  };

  return (
    <div className="dashboard-chart-card">
      <div className="dashboard-chart-header">
        <div>
          <h3 className="dashboard-chart-title">SEO Score</h3>
          <p className="dashboard-chart-subtitle">Lighthouse metrics</p>
        </div>
        <a
          href="https://pagespeed.web.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="dashboard-quick-link"
        >
          🔍 Check Now
        </a>
      </div>
      <div className="dashboard-seo-grid">
        <div className="dashboard-seo-item">
          <div className={`dashboard-seo-score ${getScoreClass(data.performance?.score)}`}>
            {data.performance?.score}
          </div>
          <div className="dashboard-seo-label">Performance</div>
        </div>
        <div className="dashboard-seo-item">
          <div className={`dashboard-seo-score ${getScoreClass(data.accessibility?.score)}`}>
            {data.accessibility?.score}
          </div>
          <div className="dashboard-seo-label">Accessibility</div>
        </div>
        <div className="dashboard-seo-item">
          <div className={`dashboard-seo-score ${getScoreClass(data.bestPractices?.score)}`}>
            {data.bestPractices?.score}
          </div>
          <div className="dashboard-seo-label">Best Practices</div>
        </div>
        <div className="dashboard-seo-item">
          <div className={`dashboard-seo-score ${getScoreClass(data.seo?.score)}`}>
            {data.seo?.score}
          </div>
          <div className="dashboard-seo-label">SEO</div>
        </div>
      </div>
    </div>
  );
};

// Monthly Conversions Chart
export const MonthlyChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="dashboard-chart-card">
      <div className="dashboard-chart-header">
        <div>
          <h3 className="dashboard-chart-title">Konversi Bulanan</h3>
          <p className="dashboard-chart-subtitle">Tren customer per bulan</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#718096" fontSize={12} />
          <YAxis yAxisId="left" stroke="#718096" fontSize={12} />
          <YAxis yAxisId="right" orientation="right" stroke="#718096" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar yAxisId="left" dataKey="visitors" name="Visitors" fill="#3182ce" radius={[4, 4, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="conversions"
            name="Conversions"
            stroke="#38a169"
            strokeWidth={2}
            dot={{ fill: '#38a169', r: 4 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
