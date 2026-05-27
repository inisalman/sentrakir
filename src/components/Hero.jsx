import './Hero.css'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="m5 12 5 5L20 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Resmi & terpercaya sejak 2015
          </span>

          <h1>
            Urusan dokumen <span className="accent">cepat selesai</span>, tanpa
            ribet antri.
          </h1>

          <p className="hero-lead">
            Sentrakir membantu pengurusan STNK, BPKB, KIR, SIM, hingga SKCK dan
            tilang. Proses transparan, harga jelas di awal, dokumen diantar
            sampai depan rumah.
          </p>

          <div className="hero-actions">
            <a href="https://wa.me/62895376124400?text=Halo%20Sentrakir%2C%20saya%20ingin%20konsultasi%20pengurusan%20dokumen." target="_blank" rel="noreferrer" className="btn btn-primary">
              Mulai Konsultasi Gratis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a href="#layanan" className="btn btn-ghost">
              Lihat Layanan
            </a>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="m9 12 2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Legal & berbadan hukum
            </div>
            <div className="hero-trust-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M12 7v5l3 2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Selesai mulai 1 hari kerja
            </div>
            <div className="hero-trust-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 9.5 12 4l9 5.5M5 10v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Gratis antar dokumen
            </div>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>10.000+</strong>
              <span>Klien terbantu</span>
            </div>
            <div className="hero-stat">
              <strong>4.9/5</strong>
              <span>Rating layanan</span>
            </div>
            <div className="hero-stat">
              <strong>9 tahun</strong>
              <span>Pengalaman</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-floater hero-floater-1">
            <span className="icon-tile">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <strong>STNK Selesai</strong>
              <span>Diantar hari ini</span>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-head">
              <div>
                <div className="hero-card-title">Perpanjangan STNK</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  No. SK-0421 · An. Budi Hartono
                </p>
              </div>
              <span className="hero-card-pill">Berjalan</span>
            </div>

            <div className="timeline">
              <div className="timeline-item is-done">
                <span className="timeline-dot">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="m5 12 5 5L20 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="timeline-text">
                  <strong>Berkas diterima</strong>
                  <span>STNK & KTP terverifikasi</span>
                </div>
                <span className="timeline-time">09:14</span>
              </div>
              <div className="timeline-item is-done">
                <span className="timeline-dot">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="m5 12 5 5L20 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="timeline-text">
                  <strong>Pembayaran terkonfirmasi</strong>
                  <span>Invoice #INV-2204</span>
                </div>
                <span className="timeline-time">09:42</span>
              </div>
              <div className="timeline-item is-active">
                <span className="timeline-dot">3</span>
                <div className="timeline-text">
                  <strong>Pengurusan ke Samsat</strong>
                  <span>Estimasi selesai hari ini</span>
                </div>
                <span className="timeline-time">Sekarang</span>
              </div>
              <div className="timeline-item">
                <span className="timeline-dot">4</span>
                <div className="timeline-text">
                  <strong>Pengantaran dokumen</strong>
                  <span>Gratis seluruh kota</span>
                </div>
                <span className="timeline-time">—</span>
              </div>
            </div>
          </div>

          <div className="hero-floater hero-floater-2">
            <span className="icon-tile">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 12a9 9 0 1 1-3.5-7.1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M21 4v5h-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <strong>Update Real-time</strong>
              <span>Notifikasi via WhatsApp</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
