import '../Hero.css'

const WA_LINK =
  'https://wa.me/6281295125811?text=' +
  encodeURIComponent('Halo PT Padajaya, saya ingin konsultasi pengurusan dokumen kendaraan.')

export default function PadajayaHero() {
  return (
    <section className="hero" id="top">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-copy">
          <h1>BIROJASA STNK &amp; BPKB PADAJAYA</h1>

          <p className="hero-lead">
            Pengurusan STNK, BPKB, dan mutasi kendaraan jalur resmi — cepat,
            transparan, tanpa antre.
          </p>

          <p className="hero-sub">
            Melayani Pengurusan STNK Motor &amp; Mobil se-Jabodetabek
          </p>

          <div className="hero-actions">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Hubungi Kami
            </a>
            <a href="#daftar-jasa" className="btn btn-light">
              Daftar Layanan
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
