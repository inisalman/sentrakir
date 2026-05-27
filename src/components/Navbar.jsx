import { useEffect, useState } from 'react'
import './Navbar.css'

const links = [
  { href: '#layanan', label: 'Layanan' },
  { href: '#keunggulan', label: 'Keunggulan' },
  { href: '#proses', label: 'Proses' },
  { href: '#testimoni', label: 'Testimoni' },
  { href: '#faq', label: 'FAQ' },
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

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <a href="#top" className="brand" aria-label="Sentrakir beranda">
          <span className="brand-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12.5 10 18l10-12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="brand-name">Sentrakir</span>
        </a>

        <nav className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Navigasi utama">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="https://wa.me/62895376124400?text=Halo%20Sentrakir%2C%20saya%20ingin%20konsultasi%20pengurusan%20dokumen." target="_blank" rel="noreferrer" className="btn btn-primary nav-cta" onClick={() => setOpen(false)}>
            Konsultasi Gratis
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
