import './Features.css'

const features = [
  {
    title: 'Transparan dari awal',
    desc: 'Harga, durasi, dan tahap proses kami sampaikan di awal — tidak ada biaya kejutan di tengah jalan.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3v18M5 7c0 2 2 3 4 3s4-1 4-3-2-3-4-3-4 1-4 3Zm6 10c0 2 2 3 4 3s4-1 4-3-2-3-4-3-4 1-4 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Resmi & legal',
    desc: 'Berbadan hukum dan bekerja melalui jalur resmi instansi terkait. Dokumen Anda 100% sah.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
    ),
  },
  {
    title: 'Update real-time',
    desc: 'Pantau status pengurusan kapan saja melalui WhatsApp. Tidak perlu menebak-nebak progres.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 11.5a8.5 8.5 0 1 1-3.4-6.8L21 4l-.7 3.4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 8v4l2.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Antar-jemput dokumen',
    desc: 'Tim kami menjemput berkas dari rumah/kantor Anda, dan mengantar dokumen jadi gratis.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 7h11v9H3zM14 10h4l3 3v3h-7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: 'Garansi proses',
    desc: 'Kalau dokumen tidak selesai sesuai estimasi, kami refund biaya jasa. Tanpa drama.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3 4 7v5c0 4.5 3.2 8.5 8 9 4.8-.5 8-4.5 8-9V7l-8-4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M12 9v4l3 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Data Anda aman',
    desc: 'Dokumen pribadi disimpan dengan prosedur ketat dan dimusnahkan setelah proses selesai.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M8 10V7a4 4 0 1 1 8 0v3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export default function Features() {
  return (
    <section className="section section-soft" id="keunggulan">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">Kenapa Sentrakir</span>
          <h2>Kerja cepat, tetap rapi, dan tanpa drama</h2>
          <p>
            Kami bukan calo. Kami partner profesional yang membuat urusan
            administrasi Anda terasa seperti mengirim paket — beres, terlacak,
            sampai tujuan.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-item" key={f.title}>
              <div className="icon-tile">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
