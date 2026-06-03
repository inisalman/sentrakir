import './CTA.css'
import { trackButtonClick } from '../utils/analytics.js'

export default function CTA() {
  return (
    <section className="section" id="kontak">
      <div className="container">
        <div className="cta">
          <div className="cta-glow" aria-hidden="true" />
          <div className="cta-grid">
            <div className="cta-copy">
              <span className="eyebrow cta-eyebrow">Siap memulai?</span>
              <h2>Konsultasikan kebutuhan dokumen Anda hari ini.</h2>
              <p>
                Gratis tanpa komitmen. Tim Sentrakir akan menghubungi Anda dalam
                15 menit di jam kerja, lengkap dengan estimasi biaya dan durasi.
              </p>
              <div className="cta-actions">
                <a className="btn btn-primary" href="https://wa.me/62895376124400?text=Halo%20Sentrakir%2C%20saya%20ingin%20konsultasi%20pengurusan%20dokumen." target="_blank" rel="noreferrer" onClick={() => { trackButtonClick('WhatsApp Click', 'CTA Section') }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l.36.572-1 3.648 3.737-.98.882.5zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.198-.298.297-.496.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z"/>
                  </svg>
                  Chat WhatsApp
                </a>
              </div>
              <p className="cta-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Senin–Sabtu, 08.00–20.00 WIB
              </p>
            </div>

            <div className="cta-card" aria-hidden="true">
              <div className="cta-card-row">
                <span>Layanan</span>
                <strong>Perpanjangan STNK</strong>
              </div>
              <div className="cta-card-row">
                <span>Estimasi selesai</span>
                <strong>1 hari kerja</strong>
              </div>
              <div className="cta-card-row">
                <span>Total biaya</span>
                <strong>Rp 350.000</strong>
              </div>
              <div className="cta-card-divider" />
              <div className="cta-card-foot">
                <span>Termasuk antar dokumen</span>
                <span className="cta-card-tag">Gratis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
