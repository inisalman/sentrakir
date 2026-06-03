// Cloudflare Web Analytics + Local Button Tracking
// Cloudflare tracks: pageviews, top pages, traffic sources automatically
// Button clicks are tracked locally for dashboard display

// =============================================
// CLOUDFLARE SETUP
// 1. Daftar di https://www.cloudflare.com/
// 2. Add domain kamu di Cloudflare Dashboard
// 3. Ke Analytics & Logs > Web Analytics
// 4. Enable dan copy token ke index.html
// =============================================

// Button tracking keys
const TRACKING_KEY = 'sentrakir_button_clicks';

// Event names
export const Events = {
  WHATSAPP_CLICK: 'WhatsApp Click',
  CTA_CLICK: 'CTA Click',
  FORM_SUBMIT: 'Form Submit',
  CUSTOMER_CONVERTED: 'Customer Converted',
  PHONE_CLICK: 'Phone Click',
  DIRECTION_CLICK: 'Direction Click',
};

// Get all button clicks from localStorage
export const getButtonClicks = () => {
  const data = localStorage.getItem(TRACKING_KEY);
  return data ? JSON.parse(data) : {};
};

// Track button click (local storage + Cloudflare compatible)
export const trackButtonClick = (eventName, location = 'unknown') => {
  // Store locally for dashboard
  const clicks = getButtonClicks();
  const key = `${eventName}_${location}`;

  if (!clicks[key]) {
    clicks[key] = { event: eventName, location, count: 0, lastClicked: null };
  }

  clicks[key].count += 1;
  clicks[key].lastClicked = new Date().toISOString();

  localStorage.setItem(TRACKING_KEY, JSON.stringify(clicks));

  // Also log to console for debugging
  console.log(`[Analytics] ${eventName} from ${location}`);
};

// Get aggregated button stats
export const getButtonStats = () => {
  const clicks = getButtonClicks();
  const stats = {};

  Object.values(Events).forEach(event => {
    stats[event] = {
      count: 0,
      locations: []
    };
  });

  Object.values(clicks).forEach(click => {
    if (stats[click.event]) {
      stats[click.event].count += click.count;
      stats[click.event].locations.push({
        location: click.location,
        count: click.count
      });
    }
  });

  return stats;
};

// Clear all tracking data (for testing)
export const clearTrackingData = () => {
  localStorage.removeItem(TRACKING_KEY);
};

// Track pageview (automatic with Cloudflare, but you can add custom data)
export const trackPageview = (pageName) => {
  // Cloudflare handles pageviews automatically
  // This is for custom tracking if needed
  console.log(`[Analytics] Page view: ${pageName}`);
};
