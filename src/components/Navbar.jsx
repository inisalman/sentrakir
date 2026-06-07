import { useEffect, useState } from 'react'
import './Navbar.css'
import { trackButtonClick } from '../utils/analytics.js'

const links = [
  { href: '#tentang', label: 'Tentang Kami' },
  { href: '#kenapa-sentrakir', label: 'Mengapa Sentra KIR' },
  { href: '#proses', label: 'Alur Proses' },
  { href: '#daftar-jasa', label: 'Daftar Jasa' },
  { href: '#lokasi', label: 'Lokasi' },
  { href: '#mitra', label: 'Mitra Kami' },
  { href: '/fleet', label: 'Sentra Fleet (B2B)' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (e, href) => {
    if (!href || !href.startsWith('#')) return
    const targetId = href.slice(1)
    const target = targetId === 'top' ? document.body : document.getElementById(targetId)
    if (!target) return
    e.preventDefault()
    const navbar = document.querySelector('.navbar')
    const navbarHeight = navbar ? navbar.offsetHeight : 0
    const offsetTop =
      target === document.body
        ? 0
        : target.getBoundingClientRect().top + window.scrollY - navbarHeight + 1
    window.scrollTo({ top: offsetTop, behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <a
          href="#top"
          className="brand"
          aria-label="Sentra KIR beranda"
          onClick={(e) => handleNavClick(e, '#top')}
        >
          <img
            src="/logo-sentra-kir.png"
            alt="Sentra KIR — Birojasa KIR & SIM"
            className="brand-logo"
          />
        </a>

        <nav className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Navigasi utama">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://wa.me/6281295125811?text=Halo%20Sentra%20KIR%2C%20saya%20ingin%20konsultasi%20pengurusan%20dokumen."
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary nav-cta"
            onClick={() => {
              setOpen(false)
              trackButtonClick('WhatsApp Click', 'Navbar')
            }}
          >
            HUBUNGI KAMI
          </a>
        </nav>

        <button
          className="nav-toggle"
          aria-label="Buka menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
