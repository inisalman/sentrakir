import './Services.css'

const services = [
  {
    title: 'STNK & BPKB',
    desc: 'Perpanjangan tahunan, balik nama, mutasi, hingga pembuatan baru kendaraan bermotor.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 13h18M5 13l1.5-5A2 2 0 0 1 8.4 6.5h7.2a2 2 0 0 1 1.9 1.5L19 13M5 13v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2m11 2v-5m0 5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    badge: 'Populer',
  },
  {
    title: 'SIM A, B, C',
    desc: 'Perpanjangan dan pembuatan SIM baru. Termasuk pendampingan ujian teori & praktek.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="9" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M14 9.5h4M14 13h3M7 16h10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Paspor & Visa',
    desc: 'Pembuatan paspor baru, perpanjangan, hingga pengurusan visa berbagai negara.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'SKCK & Kepolisian',
    desc: 'Penerbitan dan perpanjangan SKCK, surat keterangan kepolisian, sidik jari resmi.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-3Z"
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
    ),
  },
  {
    title: 'Akta & Dokumen Sipil',
    desc: 'Akta lahir, akta nikah, kartu keluarga, KTP, hingga legalisir dokumen kependudukan.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M14 3v5h5M9 13h7M9 17h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Izin Usaha & PT',
    desc: 'Pendirian PT/CV, NIB, NPWP, izin operasional, sampai sertifikasi BPOM dan halal.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 21V8a1 1 0 0 1 1-1h6V3h8a1 1 0 0 1 1 1v17"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M8 11h.01M8 15h.01M8 19h.01M14 7h.01M14 11h.01M14 15h.01M14 19h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    badge: 'Baru',
  },
]

export default function Services() {
  return (
    <section className="section" id="layanan">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">Layanan kami</span>
          <h2>Satu mitra untuk semua urusan dokumen Anda</h2>
          <p>
            Dari kendaraan, kependudukan, sampai legalitas usaha — kami tangani
            semua dengan jalur resmi dan tarif yang transparan.
          </p>
        </div>

        <div className="services-grid">
          {services.map((s) => (
            <article className="card service-card" key={s.title}>
              {s.badge && <span className="service-badge">{s.badge}</span>}
              <div className="icon-tile">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <a className="btn-link" href={`https://wa.me/62895376124400?text=${encodeURIComponent('Halo Sentrakir, saya ingin konsultasi layanan ' + s.title + '.')}`} target="_blank" rel="noreferrer">
                Konsultasi
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
