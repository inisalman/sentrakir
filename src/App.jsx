import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import React, { useEffect, Suspense, lazy } from 'react'
import './styles/fleet-native.css'
import NativeSplashScreen from './components/NativeSplashScreen.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import WhyUs from './components/WhyUs.jsx'
import Location from './components/Location.jsx'
import Process from './components/Process.jsx'
import ServiceList from './components/ServiceList.jsx'
import Partners from './components/Partners.jsx'
import Footer from './components/Footer.jsx'
import PadajayaNavbar from './components/padajaya/PadajayaNavbar.jsx'
import PadajayaHero from './components/padajaya/PadajayaHero.jsx'
import PadajayaAbout from './components/padajaya/PadajayaAbout.jsx'
import PadajayaWhyUs from './components/padajaya/PadajayaWhyUs.jsx'
import PadajayaProcess from './components/padajaya/PadajayaProcess.jsx'

const Dashboard = lazy(() => import('./components/Dashboard/Dashboard.jsx'));
const FleetPortal = lazy(() => import('./components/Fleet/FleetPortal.jsx'));

// Android APK OAuth Bridge: Disabled — native now uses GoogleAuth.signIn() directly
// which returns token without opening a browser, so no bridge redirect is needed.

// OAuth Callback Router: Kalau Supabase redirect ke root (/) dengan access_token,
// redirect ke /fleet/login SEBELUM React render supaya tidak ada flash landing page.
const IS_OAUTH_CALLBACK = (() => {
  const hash = window.location.hash || '';
  const hasOAuthToken = hash.includes('access_token=') || hash.includes('error=') || hash.includes('error_description=');

  // Untuk native platform, handle OAuth callback dari deep link
  if (Capacitor.isNativePlatform() && hasOAuthToken) {
    console.log('[OAuth Callback] Native platform detected with token');
    // Redirect ke fleet login untuk handle token
    window.history.replaceState(null, '', '/fleet/login' + hash);
    return true;
  }

  // Untuk web platform
  if (!Capacitor.isNativePlatform() && hasOAuthToken && !window.location.pathname.startsWith('/fleet/')) {
    // Use replaceState + reload to redirect synchronously without rendering
    window.history.replaceState(null, '', '/fleet/login' + hash);
    return true;
  }

  return false;
})();

export default function App() {
  const pathname = window.location.pathname

  // Add capacitor-native class to body when running on native platform
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      document.body.classList.add('capacitor-native')
      // Hide splash screen after app is ready
      setTimeout(() => {
        SplashScreen.hide()
      }, 100)
    }
    return () => {
      document.body.classList.remove('capacitor-native')
    }
  }, [])

  // Native Platform Routing (Android APK)
  if (Capacitor.isNativePlatform()) {
    // Cek apakah VITE_APP_MODE diset jadi admin atau client (default client jika kosong)
    const mode = import.meta.env.VITE_APP_MODE || 'client';

    // Set initial path sesuai mode jika belum ter-routing
    if (pathname === '/' || pathname === '/index.html') {
      if (mode === 'admin') {
        window.history.replaceState(null, '', '/fleet/admin/login')
      } else {
        window.history.replaceState(null, '', '/fleet/login')
      }
    }

    return (
      <NativeSplashScreen>
        <Suspense fallback={<div className="dashboard-loading-spinner"></div>}>
          <FleetPortal />
        </Suspense>
      </NativeSplashScreen>
    )
  }

  // Fleet routes (/fleet or /fleet/*)
  if (pathname === '/fleet' || pathname.startsWith('/fleet/')) {
    return (
      <Suspense fallback={<div className="dashboard-loading-spinner"></div>}>
        <FleetPortal />
      </Suspense>
    )
  }

  // Dashboard routes (/dashboard or /admin)
  if (pathname === '/dashboard' || pathname === '/admin') {
    return (
      <Suspense fallback={<div className="dashboard-loading-spinner"></div>}>
        <Dashboard />
      </Suspense>
    )
  }

  const isPadajayaPage = pathname === '/padajaya'

  if (isPadajayaPage) {
    return (
      <div className="padajaya-page">
        <PadajayaNavbar />
        <main>
          <PadajayaHero />
          <PadajayaAbout />
          <PadajayaWhyUs />
          <PadajayaProcess />
          <ServiceList />
          <Location />
          <Partners />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <WhyUs />
        <Process />
        <ServiceList />
        <Location />
        <Partners />
      </main>
      <Footer />
    </>
  )
}
