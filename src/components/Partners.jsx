import './Partners.css'

const partners = [
  {
    name: 'Birojasa PT. Padajaya',
    logo: '/logo-padajaya.png',
    desc: 'Birojasa terpercaya melayani pengurusan STNK Motor & Mobil Jabodetabek.',
    waLink:
      'https://wa.me/6281295125811?text=' +
      encodeURIComponent('Halo, saya ingin info tentang kerja sama dengan PT. Padajaya.'),
  },
]

export default function Partners() {
  return (
    <section className="partners-section" id="mitra">
      <div className="partners-inner">
        <h2 className="partners-title">MITRA KAMI</h2>
        <p className="partners-subtitle">
          Kami bekerja bersama mitra terpercaya untuk memperluas jangkauan
          layanan dan menjamin proses yang sah di setiap wilayah.
        </p>

        <div className="partners-grid">
          {partners.map((p) => (
            <article className="partner-card" key={p.name}>
              <div className="partner-logo-wrap">
                <img src={p.logo} alt={p.name} className="partner-logo" />
              </div>
              <h3 className="partner-name">{p.name}</h3>
              <p className="partner-desc">{p.desc}</p>
              <div className="partner-actions">
                <a
                  className="btn btn-primary partner-btn"
                  href={p.waLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Hubungi
                </a>
                <a className="btn btn-ghost partner-btn" href="#top">
                  Beranda
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
