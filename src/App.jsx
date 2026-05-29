import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import WhyUs from './components/WhyUs.jsx'
import Location from './components/Location.jsx'
import Process from './components/Process.jsx'
import ServiceList from './components/ServiceList.jsx'
import Partners from './components/Partners.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
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
