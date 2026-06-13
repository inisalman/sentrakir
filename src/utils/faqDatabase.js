// FAQ Database untuk AI Support Chat
// Template FAQ untuk general support questions

export const FAQ_DATABASE = {
  pricing: [
    {
      id: 'pricing_kir',
      category: 'Pricing',
      question: 'Berapa harga layanan KIR?',
      keywords: ['harga', 'kir', 'biaya', 'tarif'],
      answer: 'Layanan KIR kami mulai dari Rp 500.000 untuk mobil standar. Untuk harga spesifik sesuai jenis kendaraan Anda, silakan hubungi admin atau cek di menu Pricing.',
      priority: 10
    },
    {
      id: 'pricing_stnk',
      category: 'Pricing',
      question: 'Berapa biaya renovasi STNK?',
      keywords: ['stnk', 'renovasi', 'harga', 'biaya'],
      answer: 'Renovasi STNK berkisar Rp 300.000 - Rp 500.000 tergantung kondisi dokumen. Untuk penawaran detail, silakan lihat daftar harga di dashboard atau tanya admin.',
      priority: 9
    },
    {
      id: 'pricing_sim',
      category: 'Pricing',
      question: 'Berapa harga perpanjangan SIM?',
      keywords: ['sim', 'perpanjangan', 'harga', 'biaya'],
      answer: 'Layanan perpanjangan SIM mulai dari Rp 200.000. Harga bervariasi sesuai jenis SIM dan paket yang dipilih. Cek menu Pricing untuk detail lengkap.',
      priority: 9
    }
  ],

  services: [
    {
      id: 'service_kir',
      category: 'Services',
      question: 'Apa saja layanan yang tersedia?',
      keywords: ['layanan', 'services', 'apa', 'ada'],
      answer: 'Kami menyediakan layanan: KIR (Kendaraan), STNK (Surat Tanda Nomor Kendaraan), SIM (Surat Izin Mengemudi), dan Perpanjangan Asuransi. Setiap layanan bisa diakses dari menu Services.',
      priority: 10
    },
    {
      id: 'service_kir_process',
      category: 'Services',
      question: 'Bagaimana proses KIR?',
      keywords: ['kir', 'proses', 'bagaimana', 'langkah'],
      answer: 'Proses KIR: 1) Pilih layanan KIR, 2) Isi data kendaraan, 3) Upload dokumen pendukung, 4) Admin review, 5) Tunggu hasil verifikasi. Total 3-5 hari kerja.',
      priority: 9
    },
    {
      id: 'service_stnk_process',
      category: 'Services',
      question: 'Bagaimana cara perpanjangan STNK?',
      keywords: ['stnk', 'proses', 'cara', 'perpanjangan'],
      answer: 'Proses STNK: 1) Kirim foto STNK asli, 2) Isi formulir data kendaraan, 3) Admin verifikasi, 4) Proses administrasi, 5) Terima dokumen baru. Durasi 5-7 hari kerja.',
      priority: 8
    }
  ],

  requirements: [
    {
      id: 'req_kir_docs',
      category: 'Requirements',
      question: 'Dokumen apa yang diperlukan untuk KIR?',
      keywords: ['dokumen', 'kir', 'diperlukan', 'file'],
      answer: 'Untuk KIR diperlukan: 1) Foto STNK asli, 2) Foto KIR terakhir, 3) Foto identitas pemilik, 4) Foto kendaraan (depan, belakang, samping), 5) Bukti pembayaran iuran pajak (jika ada).',
      priority: 10
    },
    {
      id: 'req_stnk_docs',
      category: 'Requirements',
      question: 'Dokumen apa yang diperlukan untuk STNK?',
      keywords: ['stnk', 'dokumen', 'file', 'diperlukan'],
      answer: 'Untuk STNK diperlukan: 1) Foto STNK asli (jika ada), 2) Identitas pemilik (KTP/Paspor), 3) Bukti pembayaran pajak, 4) Foto kendaraan. Jika STNK hilang, butuh laporan kehilangan dari polisi.',
      priority: 10
    },
    {
      id: 'req_sim_docs',
      category: 'Requirements',
      question: 'Berkas apa yang harus disiapkan untuk SIM?',
      keywords: ['sim', 'berkas', 'dokumen', 'siapkan'],
      answer: 'Untuk perpanjangan SIM: 1) SIM asli (jika masih ada), 2) Identitas (KTP/Paspor), 3) Surat keterangan tes kesehatan, 4) Pas foto 4x6 (4 lembar). Untuk SIM baru tambahan: Surat rekomendasi dari polisi.',
      priority: 10
    }
  ],

  account: [
    {
      id: 'account_login',
      category: 'Account',
      question: 'Bagaimana cara login ke dashboard?',
      keywords: ['login', 'masuk', 'akun', 'password'],
      answer: 'Login dengan email dan password yang Anda daftarkan. Jika lupa password, gunakan tombol "Lupa Password" untuk reset. Jika masih bermasalah, hubungi admin support.',
      priority: 8
    },
    {
      id: 'account_register',
      category: 'Account',
      question: 'Bagaimana cara daftar sebagai client baru?',
      keywords: ['daftar', 'register', 'baru', 'sign up'],
      answer: 'Klik tombol Register di halaman login, isi data perusahaan dan kontak PIC, buat email dan password, lalu verifikasi email Anda. Admin akan review dan mengaktifkan akun dalam 24 jam.',
      priority: 9
    },
    {
      id: 'account_vehicle',
      category: 'Account',
      question: 'Bagaimana menambah kendaraan baru?',
      keywords: ['kendaraan', 'tambah', 'baru', 'vehicle', 'add'],
      answer: 'Di menu Kendaraan, klik tombol "Tambah Kendaraan", isi data lengkap (plat nomor, jenis, tahun, dll), upload dokumen, lalu submit. Admin akan verifikasi dalam 1-2 hari kerja.',
      priority: 8
    }
  ],

  billing: [
    {
      id: 'billing_invoice',
      category: 'Billing',
      question: 'Bagaimana cara melihat invoice?',
      keywords: ['invoice', 'tagihan', 'billing', 'lihat'],
      answer: 'Invoice dapat dilihat di menu Billing/Tagihan. Semua transaksi tercatat dengan tanggal, nominal, dan status pembayaran. Anda bisa download invoice dalam format PDF.',
      priority: 8
    },
    {
      id: 'billing_payment',
      category: 'Billing',
      question: 'Metode pembayaran apa yang tersedia?',
      keywords: ['pembayaran', 'metode', 'bayar', 'transfer'],
      answer: 'Kami menerima pembayaran via: 1) Transfer bank (BCA, Mandiri, BRI), 2) E-wallet (GCash, Dana), 3) Cicilan (dengan persetujuan). Instruksi pembayaran akan dikirim setelah Anda submit request.',
      priority: 9
    }
  ],

  technical: [
    {
      id: 'tech_browser',
      category: 'Technical',
      question: 'Browser apa yang bisa digunakan?',
      keywords: ['browser', 'chrome', 'firefox', 'safari'],
      answer: 'Dashboard kami support: Chrome, Firefox, Safari, dan Edge (versi terbaru). Untuk pengalaman terbaik, gunakan browser terbaru dan pastikan JavaScript aktif.',
      priority: 7
    },
    {
      id: 'tech_upload',
      category: 'Technical',
      question: 'Ukuran file maksimal untuk upload?',
      keywords: ['upload', 'file', 'ukuran', 'maksimal'],
      answer: 'Ukuran file maksimal 10 MB per file. Format yang didukung: PDF, JPG, PNG, DOC, DOCX. Jika file lebih besar, compress atau split terlebih dahulu.',
      priority: 7
    }
  ]
};

// Function untuk search FAQ berdasarkan keywords
export const searchFAQ = (userMessage) => {
  const messageLower = userMessage.toLowerCase();
  const results = [];

  // Flatten all FAQs
  const allFAQs = Object.values(FAQ_DATABASE).flat();

  // Score each FAQ
  allFAQs.forEach(faq => {
    let score = 0;

    // Check question match
    if (faq.question.toLowerCase().includes(messageLower)) {
      score += 50;
    }

    // Check keywords match
    faq.keywords.forEach(keyword => {
      if (messageLower.includes(keyword.toLowerCase())) {
        score += 10;
      }
    });

    if (score > 0) {
      results.push({ ...faq, score });
    }
  });

  // Sort by score descending, then by priority
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.priority - a.priority;
  });

  return results;
};

// Function untuk check jika pertanyaan bisa dijawab oleh FAQ
export const isFAQQuestion = (userMessage) => {
  const results = searchFAQ(userMessage);
  return results.length > 0 && results[0].score >= 20; // Threshold score 20
};

// Get best FAQ match
export const getBestFAQMatch = (userMessage) => {
  const results = searchFAQ(userMessage);
  return results.length > 0 ? results[0] : null;
};
