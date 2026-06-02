import '../Process.css'

const steps = [
  {
    n: '01',
    title: 'Konsultasi Gratis',
    desc: 'Hubungi kami via WhatsApp. Sampaikan kebutuhan Anda, kami berikan estimasi biaya dan durasi sebelum proses dimulai.',
  },
  {
    n: '02',
    title: 'Penjemputan / Penerimaan Berkas',
    desc: 'Tim kami menjemput berkas ke alamat Anda atau menerima berkas yang Anda kirim, lalu memverifikasi kelengkapannya.',
  },
  {
    n: '03',
    title: 'Proses di Samsat',
    desc: 'Berkas kami proses lewat jalur resmi di Samsat dan instansi terkait sampai dokumen selesai diterbitkan.',
  },
  {
    n: '04',
    title: 'Dokumen Diserahkan',
    desc: 'STNK / BPKB / dokumen lain yang sudah jadi kami antarkan kembali ke alamat Anda dan siap digunakan.',
  },
]

export default function PadajayaProcess() {
  return (
    <section className="process-section" id="proses">
      <div className="process-inner">
        <h2 className="process-title">TAHAPAN PROSES PENGERJAAN</h2>
        <p className="process-subtitle">
          Kami sederhanakan proses yang biasanya menyita waktu. Anda cukup
          satu kali kontak — sisanya biar kami yang urus.
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
