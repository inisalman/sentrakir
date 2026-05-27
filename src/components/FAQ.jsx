import { useState } from 'react'
import './FAQ.css'

const items = [
  {
    q: 'Apakah Sentrakir resmi dan legal?',
    a: 'Ya. Sentrakir berbadan hukum dan bekerja melalui jalur resmi instansi terkait. Semua dokumen yang Anda terima 100% sah dan terdaftar di sistem pemerintah.',
  },
  {
    q: 'Bagaimana cara mengetahui biaya pasti?',
    a: 'Setelah Anda menghubungi kami via WhatsApp dan menjelaskan kebutuhan, tim akan mengirimkan rincian biaya lengkap (PNBP + jasa) sebelum proses dimulai. Tidak ada biaya tersembunyi.',
  },
  {
    q: 'Berapa lama proses pengurusan dokumen?',
    a: 'Tergantung jenis dokumen. STNK tahunan bisa selesai 1 hari kerja, paspor sekitar 4–7 hari, pendirian PT 7–14 hari kerja. Estimasi pasti diberikan saat konsultasi awal.',
  },
  {
    q: 'Bagaimana jika dokumen saya kurang lengkap?',
    a: 'Tim kami akan memeriksa kelengkapan berkas di awal dan memandu Anda melengkapinya. Kalau perlu, kami bantu uruskan persyaratan pendukung dengan biaya tambahan yang disepakati.',
  },
  {
    q: 'Apakah bisa di luar kota?',
    a: 'Bisa untuk beberapa jenis layanan seperti pendirian PT/CV, NIB, dan pengurusan visa. Untuk dokumen yang membutuhkan kehadiran fisik (SIM, paspor), saat ini kami melayani Jabodetabek.',
  },
  {
    q: 'Bagaimana jika saya tidak puas dengan layanan?',
    a: 'Kami beri garansi proses. Jika dokumen tidak selesai sesuai estimasi karena kesalahan kami, biaya jasa akan dikembalikan penuh.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section className="section" id="faq">
      <div className="container faq-wrap">
        <div className="section-header faq-header">
          <span className="eyebrow">Pertanyaan umum</span>
          <h2>Hal yang sering ditanyakan klien</h2>
          <p>
            Belum menemukan jawabannya? Sapa kami di WhatsApp, tim kami siap
            membantu setiap hari kerja pukul 08.00–20.00 WIB.
          </p>
        </div>

        <div className="faq-list">
          {items.map((it, i) => (
            <button
              key={it.q}
              className={`faq-item ${open === i ? 'is-open' : ''}`}
              onClick={() => setOpen(open === i ? -1 : i)}
              aria-expanded={open === i}
            >
              <div className="faq-q">
                <span>{it.q}</span>
                <span className="faq-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <div className="faq-a">
                <p>{it.a}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
