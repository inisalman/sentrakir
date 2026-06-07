import "./Footer.css";
import { trackButtonClick } from '../utils/analytics.js';

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
            Mitra terpercaya untuk pengurusan dokumen KIR dan pembuatan SIM
            Cepat, transparan, dan resmi.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13 22v-8h3l1-4h-4V7.5c0-1.1.4-2 2-2h2V2h-3.2C10.6 2 9 3.7 9 6.5V10H6v4h3v8h4Z" />
              </svg>
            </a>
            <a
              href="https://wa.me/62895376124400"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              onClick={() => { trackButtonClick('WhatsApp Click', 'Footer') }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Layanan</h4>
          <ul>
            <li>
              <a href="#layanan">Pengurusan KIR</a>
            </li>
            <li>
              <a href="#layanan">Pengurusan SIM</a>
            </li>
            <li>
              <a href="/fleet">Sentra Fleet (B2B)</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Perusahaan</h4>
          <ul>
            <li>
              <a href="#keunggulan">Tentang Kami</a>
            </li>
            <li>
              <a href="#proses">Cara Kerja</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Kontak</h4>
          <ul className="footer-contact">
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <circle
                  cx="12"
                  cy="10"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
              <a
                href="https://www.google.com/maps/place/BIROJASA+KIR+SIM+SENTRA/@-6.1851922,106.9066844,20.33z/data=!4m14!1m7!3m6!1s0x2e69f5b203b3f1d9:0x7636e425a2392170!2sBIROJASA+STNK%2FKIR%2FSIM%2FTILANG+PT.PADAJAYA+STNK+KIR!8m2!3d-6.1856505!4d106.9067669!16s%2Fg%2F11jwxkyccv!3m5!1s0x2e69f51b30d450af:0x9e02ecc3dc112939!8m2!3d-6.1854549!4d106.9069635!16s%2Fg%2F11njwzqy91?entry=ttu&g_ep=EgoyMDI2MDUyNy4wIKXMDSoASAFQAw%3D%3Dg"
                target="_blank"
                rel="noreferrer"
              >
                Sentra KIR & SIM, Jakarta Timur
              </a>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
              <a
                href="https://wa.me/6281295125811"
                target="_blank"
                rel="noreferrer"
              >
                +62 8129 5125 811
              </a>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 7l9 6 9-6M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
              -
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
  );
}
