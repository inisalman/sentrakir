import '../WhyUs.css'

const points = [
  {
    title: 'Transparan dari awal',
    desc: 'Biaya, durasi, dan tahapan kami sampaikan jelas sebelum proses dimulai.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 7v5l3 2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Resmi & Legal',
    desc: 'Pengurusan via Samsat dan instansi resmi. Dokumen yang Anda terima 100% sah.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
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
    title: 'Harga bersaing',
    desc: 'Tarif jasa kami terjangkau dengan rincian biaya yang jelas, tanpa biaya tersembunyi.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M14.5 9.2c-.6-.7-1.5-1.1-2.5-1.1-1.7 0-3 .9-3 2.1s1.3 1.9 3 2.1c1.7.2 3 .9 3 2.1s-1.3 2.1-3 2.1c-1 0-1.9-.4-2.5-1.1M12 6.5v1.6M12 15.9v1.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Jemput Berkas',
    desc: 'Tim kami siap menjemput dan mengantar berkas ke alamat Anda di Jabodetabek.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
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
    title: 'Update progres',
    desc: 'Anda mendapat update progres pengurusan secara berkala lewat WhatsApp.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 11.5a8.5 8.5 0 1 1-3.4-6.8L21 4l-.7 3.4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 8v4l2.5 2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Data Anda Aman',
    desc: 'Dokumen dan data Anda kami simpan dengan prosedur ketat selama proses berjalan.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
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

export default function PadajayaWhyUs() {
  return (
    <section className="whyus-section" id="kenapa">
      <div className="whyus-inner">
        <h2 className="whyus-title">KENAPA PADAJAYA</h2>
        <p className="whyus-subtitle">
          Pengurusan STNK &amp; BPKB lewat jalur resmi — cepat, transparan,
          tanpa drama.
        </p>

        <div className="whyus-grid">
          {points.map((p) => (
            <div className="whyus-item" key={p.title}>
              <div className="whyus-icon">{p.icon}</div>
              <div className="whyus-text">
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
