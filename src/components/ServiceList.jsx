import "./ServiceList.css";
import { trackButtonClick } from '../utils/analytics.js';

const WA_NUMBER = "6281295125811";

const services = [
  {
    name: "Uji Baru",
    desc: "Pengurusan uji KIR pertama untuk kendaraan baru, termasuk kelengkapan dokumen awal.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3v18M3 12h18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    name: "Uji Berkala",
    desc: "Perpanjangan KIR rutin agar kendaraan tetap layak jalan dan sesuai regulasi.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
    name: "Numpang Uji",
    desc: "Uji KIR di luar wilayah pendaftaran kendaraan tanpa perlu mutasi domisili.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 17V8a1 1 0 0 1 1-1h9v10H5a1 1 0 0 1-1-1Zm10-7h4l3 3v4h-7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle
          cx="8"
          cy="18"
          r="1.8"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle
          cx="17"
          cy="18"
          r="1.8"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
  {
    name: "Mutasi Masuk",
    desc: "Pemindahan data kendaraan dari luar daerah ke wilayah Jakarta.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12h12m0 0-4-4m4 4-4 4M19 4v16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Mutasi Keluar",
    desc: "Pengurusan pindah data kendaraan ke wilayah lain sesuai domisili baru.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 12H9m0 0 4-4m-4 4 4 4M5 4v16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Buka Blokir Data KIR",
    desc: "Aktivasi kembali data KIR yang terblokir agar kendaraan bisa diuji ulang dan siap beroperasi.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="4"
          y="10"
          width="16"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M8 10V7a4 4 0 0 1 7.5-2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Laporan Kehilangan",
    desc: "Pengurusan surat keterangan kehilangan dokumen kendaraan dari kepolisian.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3 2.5 20h19L12 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M12 10v4M12 17h.01"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Surat Kuasa PT / Perorangan",
    desc: "Pembuatan surat kuasa resmi untuk pengurusan dokumen atas nama PT atau pribadi.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M14 3v5h5M9 13h7M9 17h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Balik Nama Kendaraan",
    desc: "Pengalihan kepemilikan pada data KIR ke STNK pemilik baru.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Ganti Nopol",
    desc: "Penggantian plat nomor kendaraan yang berbeda pada data KIR.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="6"
          width="18"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M7 10v4M11 10v4M15 10v4M19 10v4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Buku Uji Hilang",
    desc: "tetap bisa uji KIR walaupun buku uji KIR hilang atau rusak melalui jalur resmi.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M5 17a3 3 0 0 1 3-3h11"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="m9 8 5 5M14 8l-5 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Bikin SIM A/C",
    desc: "Pembuatan SIM A atau C baru dan perpanjang.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle
          cx="9"
          cy="11.5"
          r="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M14 9.5h4M14 13h3M7 16h10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function ServiceList() {
  return (
    <section className="servicelist-section" id="daftar-jasa">
      <div className="servicelist-inner">
        <h2 className="servicelist-title">DAFTAR JASA</h2>
        <p className="servicelist-subtitle">
          Layanan pengurusan administrasi kendaraan dan dokumen pendukung yang
          kami tangani dari awal sampai selesai.
        </p>

        <div className="servicelist-grid">
          {services.map((s) => {
            const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
              `Halo Sentra KIR, saya ingin konsultasi layanan ${s.name}.`,
            )}`;
            return (
              <a
                className="servicelist-card"
                key={s.name}
                href={waLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => { trackButtonClick('WhatsApp Click', `Service: ${s.name}`) }}
              >
                <div className="servicelist-icon">{s.icon}</div>
                <div className="servicelist-text">
                  <span className="servicelist-name">{s.name}</span>
                  <p className="servicelist-desc">{s.desc}</p>
                  <span className="servicelist-cta">
                    Konsultasi via WhatsApp
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
