import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sentrakir.fleet',
  appName: 'Sentra Fleet',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#1e293b",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
    }
  }
};

export default config;