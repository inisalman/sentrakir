import '../About.css'

export default function PadajayaAbout() {
  return (
    <section className="about-section" id="tentang">
      <h2 className="about-title">TENTANG KAMI</h2>

      <div className="about-body">
        <p>
          PT Padajaya adalah biro jasa yang fokus pada pengurusan administrasi
          kendaraan bermotor — mulai dari STNK, BPKB, mutasi, hingga balik
          nama. Kami berkomitmen memberikan layanan yang profesional,
          transparan, dan resmi.
        </p>
        <p>
          Berbekal pengalaman bertahun-tahun bersama pemilik kendaraan
          pribadi maupun pelaku usaha, kami hadir untuk memudahkan setiap
          urusan administrasi seperti:
        </p>

        <ul className="about-list">
          <li>Perpanjangan STNK tahunan dan 5 tahunan</li>
          <li>Mutasi kendaraan keluar &amp; masuk daerah</li>
          <li>Balik nama kendaraan motor &amp; mobil</li>
          <li>Pengurusan BPKB dan dokumen pendukung</li>
        </ul>

        <p>
          Kami tahu mengurus dokumen kendaraan sering kali menyita waktu dan
          tenaga. Karena itu, tim kami menjalankan setiap proses lewat jalur
          resmi instansi terkait, dengan komunikasi yang responsif sehingga
          Anda tetap update di setiap tahap.
        </p>
        <p>
          Kepercayaan dan kenyamanan pelanggan adalah prioritas. Dengan
          pendekatan yang berorientasi solusi, kami siap menjadi mitra
          jangka panjang dalam pengurusan dokumen kendaraan Anda.
        </p>
        <p>Terima kasih atas kepercayaan yang telah diberikan kepada kami.</p>
      </div>

      <div className="about-pillars">
        <div className="about-pillar">
          <span className="about-pillar-label">Komitmen kami</span>
          <h3>Resmi &amp; sesuai prosedur</h3>
          <p>
            Setiap berkas kami proses melalui Samsat dan instansi terkait
            tanpa jalan pintas yang merugikan pelanggan.
          </p>
        </div>
        <div className="about-pillar">
          <span className="about-pillar-label">Untuk siapa</span>
          <h3>Personal, perusahaan &amp; armada</h3>
          <p>
            Kami melayani pemilik kendaraan pribadi, perusahaan dengan armada,
            sampai showroom — pendekatan kami menyesuaikan kebutuhan masing-masing.
          </p>
        </div>
      </div>
    </section>
  )
}
