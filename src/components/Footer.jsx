import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#top" className="brand">
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
            <span>Sentrakir</span>
          </a>
          <p>
            Mitra terpercaya untuk pengurusan dokumen dan legalitas. Cepat,
            transparan, dan resmi.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 22v-8h3l1-4h-4V7.5c0-1.1.4-2 2-2h2V2h-3.2C10.6 2 9 3.7 9 6.5V10H6v4h3v8h4Z" />
              </svg>
            </a>
            <a href="https://wa.me/62895376124400" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Layanan</h4>
          <ul>
            <li><a href="#layanan">STNK & BPKB</a></li>
            <li><a href="#layanan">SIM A, B, C</a></li>
            <li><a href="#layanan">Paspor & Visa</a></li>
            <li><a href="#layanan">SKCK</a></li>
            <li><a href="#layanan">Akta & Dokumen Sipil</a></li>
            <li><a href="#layanan">Izin Usaha & PT</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Perusahaan</h4>
          <ul>
            <li><a href="#keunggulan">Tentang Kami</a></li>
            <li><a href="#proses">Cara Kerja</a></li>
            <li><a href="#testimoni">Testimoni</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Kontak</h4>
          <ul className="footer-contact">
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              Jl. Kebon Sirih No. 24, Jakarta Pusat
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <a href="https://wa.me/62895376124400" target="_blank" rel="noreferrer">+62 895-3761-24400</a>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 7l9 6 9-6M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              halo@sentrakir.id
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 Sentrakir. Semua hak dilindungi.</span>
        <div className="footer-bottom-links">
          <a href="#">Kebijakan Privasi</a>
          <a href="#">Syarat & Ketentuan</a>
        </div>
      </div>
    </footer>
  )
}
