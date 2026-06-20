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
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '999281507849-gcjc6ag2cu2ktpj2dph2cr26qgrvhhpc.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    }
  }
};

export default config;