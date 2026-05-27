import './Testimonials.css'

const items = [
  {
    quote:
      'Perpanjangan STNK 5 tahunan biasanya saya korbankan satu hari kerja. Pakai Sentrakir tinggal kirim foto KTP dan BPKB, dua hari kemudian dokumen sudah di meja saya.',
    name: 'Andi Pratama',
    role: 'Pemilik usaha logistik, Jakarta',
    initial: 'A',
  },
  {
    quote:
      'Tim Sentrakir profesional banget. Update progres jelas tiap tahap. Bahkan ketika ada kekurangan berkas, mereka yang bantu komunikasikan ke notaris.',
    name: 'Ratna Kusuma',
    role: 'HR Manager, Tangerang',
    initial: 'R',
  },
  {
    quote:
      'Bikin PT untuk startup saya selesai dalam 10 hari kerja, lengkap dengan NIB dan NPWP perusahaan. Harga juga jauh lebih masuk akal dibanding tempat lain.',
    name: 'Bayu Santoso',
    role: 'Founder, Bandung',
    initial: 'B',
  },
]

const Star = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="m12 2 3 6.9 7.5.7-5.6 5 1.7 7.4L12 18l-6.6 4 1.7-7.4-5.6-5 7.5-.7L12 2Z" />
  </svg>
)

export default function Testimonials() {
  return (
    <section className="section section-soft" id="testimoni">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">Testimoni klien</span>
          <h2>Dipercaya ribuan individu dan perusahaan</h2>
          <p>
            Kami dinilai berdasarkan hasil. Berikut cerita mereka yang sudah
            merasakan kemudahannya.
          </p>
        </div>

        <div className="testi-grid">
          {items.map((t) => (
            <figure className="testi-card" key={t.name}>
              <div className="testi-stars" aria-label="5 bintang">
                <Star />
                <Star />
                <Star />
                <Star />
                <Star />
              </div>
              <blockquote>"{t.quote}"</blockquote>
              <figcaption>
                <span className="testi-avatar">{t.initial}</span>
                <span>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
