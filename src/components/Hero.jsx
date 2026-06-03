import './Hero.css'
import { trackButtonClick } from '../utils/analytics.js'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-copy">
          <h1>BIROJASA KIR &amp; SIM SENTRA</h1>

          <p className="hero-lead">
            Mudah, murah dan cepat tanpa ribet pengurusan jalur resmi.
          </p>

          <p className="hero-sub">
            Melayani Pengurusan KIR Jakarta dan Pembuatan SIM A &amp; C Nasional
          </p>

          <div className="hero-actions">
            <a
              href="https://wa.me/62895376124400?text=Halo%20Sentrakir%2C%20saya%20ingin%20konsultasi%20pengurusan%20dokumen."
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              onClick={() => { trackButtonClick('WhatsApp Click', 'Hero') }}
            >
              Hubungi Kami
            </a>
            <a href="#layanan" className="btn btn-light" onClick={() => { trackButtonClick('CTA Click', 'Daftar Layanan') }}>
              Daftar Layanan
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
