import './Location.css'
import { trackButtonClick } from '../utils/analytics.js'

const MAPS_LINK =
  'https://www.google.com/maps/place/BIROJASA+KIR+SIM+SENTRA/@-6.1854549,106.9069635,17z/data=!4m6!3m5!1s0x2e69f51b30d450af:0x9e02ecc3dc112939!8m2!3d-6.1854549!4d106.9069635!16s%2Fg%2F11njwzqy91'
const MAPS_EMBED =
  'https://www.google.com/maps?q=-6.1854549,106.9069635&z=17&output=embed'

export default function Location() {
  return (
    <section className="location-section" id="lokasi">
      <div className="location-inner">
        <div className="section-header">
          <h2 className="location-title">LOKASI KAMI</h2>
          <p>
            Kantor kami terbuka untuk konsultasi tatap muka. Kalau Anda
            berhalangan, tim kami siap menjemput berkas ke alamat Anda.
          </p>
        </div>

        <div className="location-grid">
          <div className="location-info">
            <ul className="location-list">
              <li className="location-item">
                <span className="icon-tile">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <div>
                  <strong>Alamat kantor</strong>
                  <span>
                    Birojasa KIR SIM Sentra, Jakarta Timur. Buka di Google Maps
                    untuk petunjuk arah.
                  </span>
                </div>
              </li>

              <li className="location-item">
                <span className="icon-tile">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                    <path
                      d="M12 7v5l3 2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <div>
                  <strong>Jam operasional</strong>
                  <span>Senin–Sabtu, 08.00–20.00 WIB. Minggu & libur nasional tutup.</span>
                </div>
              </li>
            </ul>

            <div className="location-actions">
              <a
                className="btn btn-primary"
                href={MAPS_LINK}
                target="_blank"
                rel="noreferrer"
                onClick={() => { trackButtonClick('Direction Click', 'Location') }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                Buka di Google Maps
              </a>
              <a
                className="btn btn-ghost"
                href="https://wa.me/62895376124400?text=Halo%20Sentrakir%2C%20saya%20ingin%20bertanya%20soal%20kunjungan%20ke%20kantor."
                target="_blank"
                rel="noreferrer"
                onClick={() => { trackButtonClick('WhatsApp Click', 'Location') }}
              >
                Tanya via WhatsApp
              </a>
            </div>
          </div>

          <div className="location-map">
            <iframe
              title="Lokasi Sentrakir di Google Maps"
              src={MAPS_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  )
}
