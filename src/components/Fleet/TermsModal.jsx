import React, { useState } from 'react';

const TermsModal = ({ isOpen, onClose, onAccept }) => {
  const [activeTab, setActiveTab] = useState('terms');

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 0',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1C3967' }}>
              Syarat, Ketentuan & Kebijakan Privasi
            </h2>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '20px', color: '#94a3b8', padding: '0 4px',
            }}>✕</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0' }}>
            {[
              { id: 'terms', label: 'Syarat & Ketentuan' },
              { id: 'privacy', label: 'Kebijakan Privasi' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #1C3967' : '2px solid transparent',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: activeTab === tab.id ? '700' : '500',
                  color: activeTab === tab.id ? '#1C3967' : '#64748b',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {activeTab === 'terms' ? (
            <TermsContent />
          ) : (
            <PrivacyContent />
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} style={{
            padding: '10px 20px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            background: '#fff',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
          }}>
            Tutup
          </button>
          <button onClick={onAccept} style={{
            padding: '10px 24px',
            border: 'none',
            borderRadius: '8px',
            background: '#1C3967',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '700',
          }}>
            Saya Setuju
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== TERMS & CONDITIONS CONTENT =====
const TermsContent = () => (
  <div style={{ fontSize: '13px', lineHeight: '1.7', color: '#374151' }}>
    <h3 style={sectionTitle}>TERMS & CONDITIONS (Syarat & Ketentuan)</h3>
    <p style={subtitle}>Sentra Fleet</p>

    <Section title="1. Ketentuan Umum">
      <p>Sentra Fleet merupakan platform berbasis web yang menyediakan layanan administrasi armada kendaraan, pengelolaan dokumen kendaraan, pengingat masa berlaku dokumen, serta layanan terkait lainnya.</p>
      <p>Dengan mengakses atau menggunakan layanan Sentra Fleet, pengguna dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku.</p>
    </Section>

    <Section title="2. Akun Pengguna">
      <p>Pengguna bertanggung jawab atas:</p>
      <ul>
        <li>Keamanan akun dan kata sandi.</li>
        <li>Kebenaran data yang diberikan.</li>
        <li>Aktivitas yang dilakukan melalui akun pengguna.</li>
      </ul>
      <p>Pengguna wajib menjaga kerahasiaan informasi login dan segera menghubungi Sentra Fleet apabila terdapat indikasi akses tidak sah terhadap akun.</p>
    </Section>

    <Section title="3. Penggunaan Layanan">
      <p>Pengguna setuju untuk:</p>
      <ul>
        <li>Menggunakan layanan sesuai peraturan perundang-undangan yang berlaku.</li>
        <li>Tidak mengunggah dokumen palsu atau menyesatkan.</li>
        <li>Tidak menggunakan layanan untuk kegiatan yang melanggar hukum.</li>
      </ul>
      <p>Sentra Fleet berhak menangguhkan atau menonaktifkan akun yang terbukti melanggar ketentuan.</p>
    </Section>

    <Section title="4. Dokumen yang Diunggah">
      <p>Pengguna menyatakan bahwa:</p>
      <ul>
        <li>Memiliki hak atau izin atas dokumen yang diunggah.</li>
        <li>Dokumen yang diberikan adalah benar dan sah.</li>
        <li>Data yang diberikan dapat digunakan oleh Sentra Fleet untuk keperluan administrasi layanan.</li>
      </ul>
      <p>Dokumen yang dapat diunggah meliputi namun tidak terbatas pada: Kartu Uji Berkala (KIR), Sertifikat Uji Berkala, STNK, dan dokumen armada lainnya.</p>
    </Section>

    <Section title="5. Keamanan Sistem">
      <p>Sentra Fleet berupaya menerapkan langkah-langkah keamanan yang wajar untuk melindungi data pengguna. Namun pengguna memahami bahwa:</p>
      <ul>
        <li>Tidak ada sistem elektronik yang dapat dijamin aman 100%.</li>
        <li>Risiko gangguan sistem, kegagalan jaringan, atau serangan siber oleh pihak ketiga tetap dapat terjadi.</li>
      </ul>
      <p>Sentra Fleet tidak bertanggung jawab atas kerugian yang timbul akibat tindakan pihak ketiga yang berada di luar kendali wajar pengelola sistem.</p>
    </Section>

    <Section title="6. Ketersediaan Layanan">
      <p>Sentra Fleet dapat melakukan pemeliharaan sistem, pembaruan fitur, dan perbaikan keamanan yang sewaktu-waktu dapat menyebabkan layanan tidak tersedia sementara.</p>
    </Section>

    <Section title="7. Batasan Tanggung Jawab">
      <p>Sentra Fleet berfungsi sebagai media administrasi dan pengingat dokumen armada. Pengguna tetap bertanggung jawab untuk:</p>
      <ul>
        <li>Memastikan keabsahan dokumen.</li>
        <li>Memastikan kendaraan memenuhi ketentuan hukum yang berlaku.</li>
        <li>Memastikan kewajiban administrasi kendaraan dipenuhi tepat waktu.</li>
      </ul>
    </Section>

    <Section title="8. Perubahan Ketentuan">
      <p>Sentra Fleet berhak mengubah syarat dan ketentuan sewaktu-waktu. Perubahan akan diumumkan melalui platform dan berlaku sejak tanggal ditetapkan.</p>
    </Section>

    <Section title="9. Hukum yang Berlaku">
      <p>Syarat dan ketentuan ini tunduk pada hukum yang berlaku di Republik Indonesia.</p>
    </Section>
  </div>
);

// ===== PRIVACY POLICY CONTENT =====
const PrivacyContent = () => (
  <div style={{ fontSize: '13px', lineHeight: '1.7', color: '#374151' }}>
    <h3 style={sectionTitle}>PRIVACY POLICY (Kebijakan Privasi)</h3>
    <p style={subtitle}>Sentra Fleet</p>

    <Section title="1. Pendahuluan">
      <p>Sentra Fleet menghargai dan melindungi privasi setiap pengguna. Kebijakan Privasi ini menjelaskan bagaimana informasi pengguna dikumpulkan, digunakan, disimpan, dan dilindungi.</p>
    </Section>

    <Section title="2. Data yang Dikumpulkan">
      <p><strong>Data Akun:</strong> Nama, email, nomor telepon, nama perusahaan.</p>
      <p><strong>Data Armada:</strong> Nomor polisi, nomor rangka, nomor mesin, informasi kendaraan.</p>
      <p><strong>Data Dokumen:</strong> Foto STNK, foto kartu KIR, sertifikat KIR, dokumen administrasi armada lainnya.</p>
      <p><strong>Data Sistem:</strong> Alamat IP, log aktivitas, informasi perangkat, riwayat akses sistem.</p>
    </Section>

    <Section title="3. Tujuan Penggunaan Data">
      <p>Data digunakan untuk menyediakan layanan Sentra Fleet, menampilkan informasi armada, mengelola dokumen kendaraan, mengirim pengingat masa berlaku dokumen, meningkatkan kualitas layanan, dan menjaga keamanan sistem.</p>
    </Section>

    <Section title="4. Penyimpanan Data">
      <p>Data disimpan selama akun masih aktif atau selama diperlukan untuk memenuhi kewajiban hukum dan operasional. Setelah akun dihapus, data dapat dihapus secara permanen atau dianonimkan.</p>
    </Section>

    <Section title="5. Keamanan Data">
      <p>Sentra Fleet menerapkan langkah-langkah keamanan yang wajar, termasuk:</p>
      <ul>
        <li>Enkripsi komunikasi melalui HTTPS.</li>
        <li>Pengelolaan hak akses pengguna.</li>
        <li>Pengamanan server dan database.</li>
        <li>Backup data secara berkala.</li>
      </ul>
    </Section>

    <Section title="6. Pembagian Data kepada Pihak Ketiga">
      <p>Sentra Fleet tidak menjual data pengguna kepada pihak lain. Data hanya dapat dibagikan apabila diperlukan untuk penyediaan layanan, diperintahkan oleh peraturan perundang-undangan, atau diminta oleh aparat penegak hukum yang berwenang.</p>
    </Section>

    <Section title="7. Hak Pengguna">
      <p>Pengguna berhak untuk mengakses, memperbarui, meminta koreksi, atau meminta penghapusan data miliknya sesuai ketentuan yang berlaku.</p>
    </Section>

    <Section title="8. Cookies dan Teknologi Serupa">
      <p>Sentra Fleet dapat menggunakan cookies untuk menjaga sesi login, mengingat preferensi pengguna, dan menganalisis penggunaan layanan. Pengguna dapat mengatur penggunaan cookies melalui browser masing-masing.</p>
    </Section>

    <Section title="9. Perubahan Kebijakan Privasi">
      <p>Kebijakan Privasi dapat diperbarui sewaktu-waktu. Perubahan akan diumumkan melalui platform Sentra Fleet.</p>
    </Section>

    <Section title="10. Kontak">
      <p>Untuk pertanyaan mengenai Kebijakan Privasi atau pengelolaan data pribadi, hubungi:</p>
      <p><strong>Sentra Fleet</strong><br />Email: <a href="mailto:birojasasentrakir@gmail.com" style={{ color: '#1C3967' }}>birojasasentrakir@gmail.com</a></p>
    </Section>
  </div>
);

// ===== HELPER COMPONENTS =====
const Section = ({ title, children }) => (
  <div style={{ marginBottom: '16px' }}>
    <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: '700', color: '#1C3967' }}>{title}</h4>
    <div>{children}</div>
  </div>
);

const sectionTitle = {
  margin: '0 0 4px 0',
  fontSize: '15px',
  fontWeight: '800',
  color: '#1C3967',
};

const subtitle = {
  margin: '0 0 16px 0',
  fontSize: '12px',
  color: '#64748b',
  fontWeight: '600',
};

export default TermsModal;
