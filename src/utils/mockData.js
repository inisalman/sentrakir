// Mock data for dashboard demo/preview
// Replace with real Cloudflare Analytics data when configured

// Import real button tracking data
import { getButtonStats } from './analytics.js';

// Generate dates for last 30 days
const generateDates = (days) => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const dates30 = generateDates(30);

// Generate realistic visitor data with some variation
const generateVisitors = () => {
  return dates30.map((date, i) => ({
    date,
    visitors: Math.floor(80 + Math.random() * 60 + (i % 7) * 10),
    pageviews: Math.floor(150 + Math.random() * 100 + (i % 7) * 15),
    bounce_rate: Math.floor(30 + Math.random() * 20),
  }));
};

// Get real button tracking or fallback to mock
const getRealCustomEvents = () => {
  const buttonStats = getButtonStats();
  const iconMap = {
    'WhatsApp Click': '💬',
    'CTA Click': '📞',
    'Form Submit': '📝',
    'Customer Converted': '✅',
    'Phone Click': '📱',
    'Direction Click': '📍',
  };

  const realEvents = Object.entries(buttonStats)
    .filter(([_, data]) => data.count > 0)
    .map(([event, data]) => ({
      event,
      count: data.count,
      icon: iconMap[event] || '📊',
    }));

  // If no real data, use mock
  if (realEvents.length === 0) {
    return mockCustomEvents;
  }

  return realEvents;
};

// Get real WhatsApp clicks count
const getRealWhatsAppClicks = () => {
  const buttonStats = getButtonStats();
  return buttonStats['WhatsApp Click']?.count || 156; // fallback to mock
};

// Mock stats
export const mockStats = {
  visitors: { value: 2847, change: 12.5 },
  pageviews: { value: 8921, change: 8.3 },
  whatsapp_clicks: { value: getRealWhatsAppClicks(), change: 23.1 },
  conversions: { value: 42, change: 15.7 },
  bounce_rate: { value: 38.2, change: -5.2 },
  avg_duration: { value: '2m 34s', change: 8.1 },
};

// Timeseries data
export const mockTimeseries = generateVisitors();

// Top pages
export const mockTopPages = [
  { page: '/', visitors: 1247, pageviews: 2891, bounce_rate: 32 },
  { page: '/#services', visitors: 634, pageviews: 1123, bounce_rate: 28 },
  { page: '/#about', visitors: 412, pageviews: 687, bounce_rate: 35 },
  { page: '/#location', visitors: 298, pageviews: 456, bounce_rate: 41 },
  { page: '/#process', visitors: 267, pageviews: 389, bounce_rate: 38 },
  { page: '/padajaya', visitors: 234, pageviews: 412, bounce_rate: 29 },
  { page: '/#faq', visitors: 189, pageviews: 267, bounce_rate: 44 },
  { page: '/#partners', visitors: 156, pageviews: 223, bounce_rate: 36 },
];

// Traffic sources
export const mockSources = [
  { source: 'Google Search', visitors: 1245, percentage: 43.7, color: '#4285f4' },
  { source: 'Direct', visitors: 892, percentage: 31.3, color: '#34a853' },
  { source: 'Google Ads', visitors: 423, percentage: 14.9, color: '#fbbc04' },
  { source: 'Facebook', visitors: 156, percentage: 5.5, color: '#1877f2' },
  { source: 'Instagram', visitors: 89, percentage: 3.1, color: '#e4405f' },
  { source: 'Other', visitors: 42, percentage: 1.5, color: '#718096' },
];

// Custom events (button tracking) - will use real data if available
export const mockCustomEvents = [
  { event: 'WhatsApp Click', count: 156, icon: '💬' },
  { event: 'CTA - Hubungi Kami', count: 89, icon: '📞' },
  { event: 'Form Submit', count: 42, icon: '📝' },
  { event: 'Customer Converted', count: 38, icon: '✅' },
  { event: 'Phone Click', count: 67, icon: '📱' },
  { event: 'Get Direction', count: 45, icon: '📍' },
];

// SEO metrics (mock)
export const mockSEO = {
  performance: { score: 87, label: 'Good' },
  accessibility: { score: 94, label: 'Good' },
  bestPractices: { score: 92, label: 'Good' },
  seo: { score: 78, label: 'Medium' },
};

// Countries (for future expansion)
export const mockCountries = [
  { country: 'Indonesia', visitors: 2654, percentage: 93.2 },
  { country: 'Malaysia', visitors: 89, percentage: 3.1 },
  { country: 'Singapore', visitors: 67, percentage: 2.4 },
  { country: 'Other', visitors: 37, percentage: 1.3 },
];

// Monthly summary (last 6 months)
export const mockMonthlyData = [
  { month: 'Jan', visitors: 1847, conversions: 28 },
  { month: 'Feb', visitors: 2103, conversions: 35 },
  { month: 'Mar', visitors: 2356, conversions: 41 },
  { month: 'Apr', visitors: 2678, conversions: 48 },
  { month: 'May', visitors: 2847, conversions: 52 },
  { month: 'Jun', visitors: 1523, conversions: 24 },
];

// Combine all mock data (with real button tracking)
export const getMockData = () => ({
  stats: mockStats,
  timeseries: mockTimeseries,
  topPages: mockTopPages,
  sources: mockSources,
  customEvents: getRealCustomEvents(),
  seo: mockSEO,
  countries: mockCountries,
  monthlyData: mockMonthlyData,
});
