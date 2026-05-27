import './Process.css'

const steps = [
  {
    n: '01',
    title: 'Konsultasi gratis',
    desc: 'Hubungi via WhatsApp. Sampaikan kebutuhan Anda, kami berikan estimasi biaya dan durasi yang jelas.',
  },
  {
    n: '02',
    title: 'Kirim berkas',
    desc: 'Tim kami menjemput dokumen ke rumah/kantor Anda, atau kirim digital. Anda tinggal duduk manis.',
  },
  {
    n: '03',
    title: 'Proses dimulai',
    desc: 'Kami urus ke instansi terkait. Status real-time dikirim ke WhatsApp Anda di setiap tahap.',
  },
  {
    n: '04',
    title: 'Dokumen sampai',
    desc: 'Dokumen jadi diantar gratis sampai depan pintu. Bayar sesuai kesepakatan, tanpa biaya tambahan.',
  },
]

export default function Process() {
  return (
    <section className="section" id="proses">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">Cara kerja</span>
          <h2>Empat langkah, urusan Anda beres</h2>
          <p>
            Kami sederhanakan proses yang biasanya rumit. Anda hanya perlu satu
            kali kontak — sisanya biar kami yang lari.
          </p>
        </div>

        <div className="process-grid">
          {steps.map((s, i) => (
            <div className="process-card" key={s.n}>
              <div className="process-number">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < steps.length - 1 && <span className="process-connector" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
