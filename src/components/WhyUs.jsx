import './WhyUs.css'

const points = [
  {
    title: 'Transparan dari awal',
    desc: 'Harga, durasi, dan tahap proses kami sampaikan di awal.',
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
    desc: 'Kami bekerja melalui jalur resmi instansi terkait. Dokumen Anda 100% sah.',
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
    title: 'Murah',
    desc: 'Jasa kami terbilang murah dan terjangkau.',
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
    title: 'Bisa Antar Dokumen',
    desc: 'Kami bisa antar dokumen ke lokasi Anda.',
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
    title: 'Update Dokumen Resmi',
    desc: 'Bukan hanya dokumen Anda yang resmi, data Anda juga terupdate ke sistem.',
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
    desc: 'Dokumen akan kami jaga dengan prosedur yang ketat agar data Anda tidak bocor.',
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

export default function WhyUs() {
  return (
    <section className="whyus-section" id="kenapa-sentrakir">
      <div className="whyus-inner">
        <h2 className="whyus-title">KENAPA SENTRA KIR</h2>
        <p className="whyus-subtitle">
          Proses pengurusan dokumen mudah, murah, cepat tanpa ribet — pengurusan jalur resmi.
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
