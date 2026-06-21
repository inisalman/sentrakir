import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sentrakir.fleet',
  appName: 'Sentra Fleet',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: "#1e293b",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '105550504783-39924gg3a754dh8u6re7858id2qg0es8.apps.googleusercontent.com',
      forceCodeForRefreshToken: false,
    }
  }
};

export default config;