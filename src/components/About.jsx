import './About.css'

export default function About() {
  return (
    <section className="about-section" id="tentang">
      <h2 className="about-title">TENTANG KAMI</h2>

      <div className="about-body">
        <p>
          Kami merupakan layanan biro jasa yang bergerak di bidang pengurusan
          administrasi kendaraan, khususnya KIR dan SIM, dengan komitmen
          memberikan pelayanan yang profesional, terpercaya, dan efisien.
        </p>
        <p>
          Didukung oleh pengalaman dalam proses administrasi kendaraan, kami
          hadir untuk membantu masyarakat maupun pelaku usaha dalam mengurus
          berbagai kebutuhan seperti:
        </p>

        <ul className="about-list">
          <li>Pengurusan KIR kendaraan</li>
          <li>Pengurusan SIM A &amp; C Nasional</li>
        </ul>

        <p>
          Kami memahami bahwa proses administrasi sering kali memerlukan waktu
          dan perhatian khusus. Oleh karena itu, kami berupaya memberikan
          layanan yang mudah, cepat, transparan, serta didukung komunikasi yang
          responsif agar setiap proses dapat berjalan dengan baik dan sesuai
          kebutuhan pelanggan.
        </p>
        <p>
          Kepuasan dan kepercayaan pelanggan menjadi prioritas utama kami.
          Dengan pelayanan yang profesional dan berorientasi pada solusi, kami
          siap menjadi mitra terpercaya dalam membantu kebutuhan administrasi
          kendaraan Anda.
        </p>
        <p>Terima kasih atas kepercayaan yang telah diberikan kepada layanan kami.</p>
      </div>

      <div className="about-pillars">
        <div className="about-pillar">
          <span className="about-pillar-label">Komitmen kami</span>
          <h3>Proses sesuai prosedur</h3>
          <p>
            Setiap pengurusan kami jalankan melalui jalur resmi instansi terkait,
            tanpa jalan pintas yang merugikan pelanggan.
          </p>
        </div>
        <div className="about-pillar">
          <span className="about-pillar-label">Untuk siapa</span>
          <h3>Personal &amp; pelaku usaha</h3>
          <p>
            Kami membantu pemilik kendaraan pribadi maupun armada usaha,
            dengan pendekatan yang menyesuaikan kebutuhan masing-masing.
          </p>
        </div>
      </div>
    </section>
  )
}
