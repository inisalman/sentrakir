import { Capacitor } from '@capacitor/core'
import { useEffect } from 'react'
import './styles/fleet-native.css'
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
import Dashboard from './components/Dashboard/Dashboard.jsx'
import FleetPortal from './components/Fleet/FleetPortal.jsx'

export default function App() {
  const pathname = window.location.pathname

  // Add capacitor-native class to body when running on native platform
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      document.body.classList.add('capacitor-native')
    }
    return () => {
      document.body.classList.remove('capacitor-native')
    }
  }, [])

  // Di Android APK, langsung masuk Fleet Portal (admin login)
  if (Capacitor.isNativePlatform()) {
    // Set initial path ke admin login jika belum authenticated
    if (pathname === '/' || pathname === '/index.html') {
      window.history.replaceState(null, '', '/fleet/admin/login')
    }
    return <FleetPortal />
  }

  // Fleet routes (/fleet or /fleet/*)
  if (pathname === '/fleet' || pathname.startsWith('/fleet/')) {
    return <FleetPortal />
  }

  // Dashboard routes (/dashboard or /admin)
  if (pathname === '/dashboard' || pathname === '/admin') {
    return <Dashboard />
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
