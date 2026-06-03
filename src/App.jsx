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

export default function App() {
  const pathname = window.location.pathname

  // Dashboard route
  if (pathname === '/dashboard') {
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
