import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Setup deep linking for Supabase Auth in Native Platform
if (Capacitor.isNativePlatform()) {
  App.addListener('appUrlOpen', async (data) => {
    // If the URL contains access_token or refresh_token, it's an OAuth callback
    if (data.url.includes('#access_token=') || data.url.includes('?code=')) {
      // Close the in-app browser manually if opened
      try {
        const { Browser } = await import('@capacitor/browser');
        await Browser.close();
      } catch (e) {
        console.log("Browser already closed or error closing");
      }
    }
  });
}
