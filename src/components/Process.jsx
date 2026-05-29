import './Process.css'

const steps = [
  {
    n: '01',
    title: 'Konsultasi Gratis',
    desc: 'Hubungi via WhatsApp. Sampaikan kebutuhan Anda, kami berikan estimasi biaya dan durasi yang jelas.',
  },
  {
    n: '02',
    title: 'Penerimaan Berkas',
    desc: 'Berkas yang sudah kami terima segera kami proses sesuai tujuan pengurusan.',
  },
  {
    n: '03',
    title: 'Proses Dimulai',
    desc: 'Kami akan memproses keperluan pengurusan dokumen Anda hingga selesai ke instansi terkait.',
  },
  {
    n: '04',
    title: 'Pengurusan Selesai',
    desc: 'Dokumen serta data yang sudah jadi dan sudah update ke sistem instansi terkait siap Anda gunakan.',
  },
]

export default function Process() {
  return (
    <section className="process-section" id="proses">
      <div className="process-inner">
        <h2 className="process-title">TAHAPAN PROSES PENGERJAAN</h2>
        <p className="process-subtitle">
          Kami sederhanakan proses yang biasanya rumit. Anda hanya perlu satu
          kali kontak — sisanya biar kami yang urus.
        </p>

        <div className="process-grid">
          {steps.map((s) => (
            <div className="process-card" key={s.n}>
              <div className="process-number">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
