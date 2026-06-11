// localStorage database for Sentra Fleet
export const CURRENT_DATE_STR = new Date().toISOString().split('T')[0];
const STORAGE_KEY = 'sentra_fleet_database';

// Helper to calculate difference in days from today
export const getDaysRemaining = (targetDateStr) => {
  if (!targetDateStr) return 999;
  const current = new Date(CURRENT_DATE_STR);
  const target = new Date(targetDateStr);
  const diffTime = target - current;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper to get status object for a document
export const getDocStatus = (targetDateStr) => {
  const days = getDaysRemaining(targetDateStr);
  if (days <= 0) {
    return { code: 'danger', label: 'Jatuh Tempo', days, textClass: 'status-danger' };
  } else if (days <= 7) {
    return { code: 'warning', label: 'Jatuh Tempo H-7', days, textClass: 'status-warning' };
  } else if (days <= 30) {
    return { code: 'warning', label: 'Jatuh Tempo H-30', days, textClass: 'status-warning' };
  } else if (days <= 60) {
    return { code: 'warning', label: 'Jatuh Tempo H-60', days, textClass: 'status-warning' };
  } else if (days <= 90) {
    return { code: 'warning', label: 'Jatuh Tempo H-90', days, textClass: 'status-warning' };
  } else {
    return { code: 'success', label: 'Aman', days, textClass: 'status-success' };
  }
};

// Admin Registry (Multi-Admin System)
export const ADMINS = [
  {
    id: 'admin-1',
    email: 'admin@sentrakir.com',
    name: 'Sentra',
    registrationCode: 'SENTRA-2024',
    status: 'active',
    tier: 'primary',
    allowedServices: ['kir_renewal', 'buka_blokir_kir', 'lapor_hilang', 'media_nasional', 'bikin_sim_a', 'bikin_sim_c', 'perpanjang_sim_a', 'perpanjang_sim_c', 'kir_uji_baru', 'kir_numpang_uji', 'kir_mutasi_masuk', 'kir_mutasi_keluar', 'kir_balik_nama', 'kir_ganti_nopol'],
    createdAt: '2026-06-07T00:00:00.000Z'
  },
  {
    id: 'admin-2',
    email: 'admin@padajaya.com',
    name: 'Padajaya',
    registrationCode: 'PADAJAYA-2024',
    status: 'active',
    tier: 'secondary',
    allowedServices: ['stnk_renewal', 'pajak_renewal', 'kir_renewal', 'buka_blokir_kir', 'lapor_hilang', 'media_nasional', 'balik_nama_stnk', 'mutasi', 'mutasi_masuk_stnk', 'stnk_hilang', 'ganti_alamat', 'blokir_progresif', 'cek_fisik_bantuan', 'urus_e_tilang', 'cabut_berkas_stnk', 'bikin_sim_a', 'bikin_sim_c', 'perpanjang_sim_a', 'perpanjang_sim_c', 'kir_uji_baru', 'kir_numpang_uji', 'kir_mutasi_masuk', 'kir_mutasi_keluar', 'kir_balik_nama', 'kir_ganti_nopol'],
    createdAt: '2026-06-07T00:00:00.000Z'
  }
];

// ----------------------------------------------------
// MEMBERSHIP TIER CONFIG (Sentra controls membership)
// ----------------------------------------------------
// vehicleLimit: null = unlimited. Free tier is capped at 5 vehicles.
export const MEMBERSHIP_TIERS = {
  free: {
    id: 'free',
    name: 'Sentra Fleet Free',
    price: 0,
    priceLabel: 'Gratis',
    period: '',
    quota: '1 - 5 Kendaraan',
    vehicleLimit: 5,
    features: [
      'Hingga 5 data armada kendaraan',
      'Notifikasi jatuh tempo dasar (H-30 & H-7)',
      'Pantau status KIR / STNK / Pajak',
      'Ajukan 1 order pengurusan aktif dalam satu waktu',
      'CS support via email standar',
    ],
    // Capability flags used to differentiate tiers across the UI
    canUploadDocs: false,
    maxActiveRequests: 1,
    canUrusSekarang: true,
    prioritySupport: false,
  },
  kecil: {
    id: 'kecil',
    name: 'Sentra Fleet Kecil',
    price: 499000,
    priceLabel: 'Rp 499.000',
    period: '/ bulan',
    quota: '1 - 30 Kendaraan',
    vehicleLimit: 30,
    features: [
      'Hingga 30 data armada kendaraan',
      'Notifikasi warning jatuh tempo H-90 s/d H-7',
      'Upload pindaian & dokumen berkas (KIR / STNK / PDF)',
      'Tombol Urus Sekarang tanpa batas antrean',
      'CS support WhatsApp bisnis standard',
    ],
    canUploadDocs: true,
    maxActiveRequests: null,
    canUrusSekarang: true,
    prioritySupport: false,
  },
  menengah: {
    id: 'menengah',
    name: 'Sentra Fleet Menengah',
    price: 999000,
    priceLabel: 'Rp 999.000',
    period: '/ bulan',
    quota: '31 - 100 Kendaraan',
    vehicleLimit: 100,
    features: [
      'Hingga 100 data armada kendaraan',
      'Semua fitur paket Fleet Kecil',
      'Prioritas pelayanan verifikasi dokumen',
      'Diskon potongan biaya jasa perpanjangan',
      'PIC CRM Dedicated dari Sentra KIR',
      'Laporan ekspor data armada (CSV)',
    ],
    canUploadDocs: true,
    maxActiveRequests: null,
    canUrusSekarang: true,
    prioritySupport: true,
  },
  besar: {
    id: 'besar',
    name: 'Sentra Fleet Besar (Enterprise)',
    price: null,
    priceLabel: 'Custom Pricing',
    period: '',
    quota: '100+ Kendaraan',
    vehicleLimit: null,
    features: [
      'Kuota kendaraan tanpa batas (Custom)',
      'Semua fitur paket Fleet Menengah',
      'Integrasi API database internal logistik',
      'Layanan kurir jemput-antar berkas VIP gratis',
      'Syarat pembayaran berjangka (Term of Payment)',
      'Account Manager khusus & SLA prioritas tertinggi',
    ],
    canUploadDocs: true,
    maxActiveRequests: null,
    canUrusSekarang: true,
    prioritySupport: true,
  },
};

export const getTierConfig = (tierId) => MEMBERSHIP_TIERS[tierId] || MEMBERSHIP_TIERS.free;

// Returns the max vehicles allowed for a company's tier (null = unlimited)
export const getVehicleLimit = (tierId) => getTierConfig(tierId).vehicleLimit;

// Check whether a company can add another vehicle given its tier and current count
export const canAddVehicle = (tierId, currentCount) => {
  const limit = getVehicleLimit(tierId);
  if (limit === null) return true;
  return currentCount < limit;
};

export const initFleetData = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const db = { admins: ADMINS, companies: [], vehicles: [], requests: [], documents: [], membershipRequests: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return db;
  }
  const db = JSON.parse(existing);
  // Ensure admins array exists for migration
  if (!db.admins) {
    db.admins = ADMINS;
  }
  // Migration: ensure membershipRequests array exists
  if (!db.membershipRequests) {
    db.membershipRequests = [];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  return db;
};

// Get database state
export const getFleetDatabase = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    return initFleetData();
  }
  return JSON.parse(existing);
};

// Save database state
const saveFleetDatabase = (db) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

// ----------------------------------------------------
// ADMIN & ROUTING HELPERS (Multi-Admin System)
// ----------------------------------------------------

// Get admin by email
export const getAdminByEmail = (email) => {
  return ADMINS.find(a => a.email.toLowerCase() === email.toLowerCase());
};

// Get admin by registration code
export const getAdminByCode = (code) => {
  return ADMINS.find(a => a.registrationCode === code);
};

// Get admin by ID
export const getAdminById = (adminId) => {
  return ADMINS.find(a => a.id === adminId);
};

// Get all clients for specific admin
export const getAllClientsForAdmin = (adminId) => {
  const db = getFleetDatabase();
  return db.companies.filter(c => (c.adminId || 'admin-1') === adminId);
};

// Determine routing for service request
export const getRouting = (serviceType, originatingAdminId) => {
  // Define Jakarta STNK services (ALWAYS go to Padajaya regardless of originating admin)
  const stnkJakartaServices = ['balik_nama_stnk', 'mutasi', 'mutasi_masuk_stnk', 'stnk_hilang', 'ganti_alamat', 'blokir_progresif', 'cek_fisik_bantuan', 'urus_e_tilang', 'cabut_berkas_stnk'];

  // Define Jakarta KIR services
  const kirJakartaServices = ['kir_uji_baru', 'kir_numpang_uji', 'kir_mutasi_masuk', 'kir_mutasi_keluar', 'kir_balik_nama', 'kir_ganti_nopol', 'kir_renewal', 'buka_blokir_kir'];

  // Define SIM services
  const simServices = ['bikin_sim_a', 'bikin_sim_c', 'perpanjang_sim_a', 'perpanjang_sim_c'];

  // NEW LOGIC: If client is from Sentra Admin (admin-1)
  if (originatingAdminId === 'admin-1') {
    // EXCEPTION: Jakarta STNK services ALWAYS go to Padajaya
    if (stnkJakartaServices.includes(serviceType)) {
      return {
        assignedAdminId: 'admin-2',
        routingReason: 'Pengurusan STNK wilayah Jakarta dialihkan ke Administrator Padajaya'
      };
    }

    // EXCEPTION: Regular STNK/Pajak renewal ALWAYS go to Padajaya
    if (serviceType === 'stnk_renewal' || serviceType === 'pajak_renewal') {
      return {
        assignedAdminId: 'admin-2',
        routingReason: 'Pengurusan STNK/Pajak dialihkan ke Administrator Padajaya'
      };
    }

    // EXCEPTION: Multiple requests (KIR+STNK/Pajak) go to Padajaya
    if (serviceType === 'multiple') {
      return {
        assignedAdminId: 'admin-2',
        routingReason: 'Pengurusan kombinasi KIR+STNK/Pajak dialihkan ke Administrator Padajaya'
      };
    }

    // ALL OTHER SERVICES stay with Sentra (KIR Jakarta + SIM + Balik Nama)
    return {
      assignedAdminId: 'admin-1',
      routingReason: 'Pengurusan ditangani oleh Administrator Sentra'
    };
  }

  // For clients from other admins (admin-2, etc):
  // Jakarta STNK services go to admin-2 (Padajaya)
  if (stnkJakartaServices.includes(serviceType)) {
    return {
      assignedAdminId: 'admin-2',
      routingReason: 'Pengurusan STNK wilayah Jakarta ditangani oleh Administrator Padajaya'
    };
  }

  // STNK and Pajak renewal go to admin-2 (Padajaya)
  if (serviceType === 'stnk_renewal' || serviceType === 'pajak_renewal') {
    return {
      assignedAdminId: 'admin-2',
      routingReason: 'Pengurusan STNK/Pajak ditangani oleh Administrator Padajaya'
    };
  }

  // Multiple requests go to admin-2 (since includes STNK/Pajak)
  if (serviceType === 'multiple') {
    return {
      assignedAdminId: 'admin-2',
      routingReason: 'Pengurusan kombinasi KIR+STNK/Pajak ditangani oleh Administrator Padajaya'
    };
  }

  // KIR & Balik Nama requests stay with originating admin
  if (kirJakartaServices.includes(serviceType) || serviceType === 'balik_nama') {
    return {
      assignedAdminId: originatingAdminId,
      routingReason: 'Pengurusan KIR ditangani oleh administrator yang mengelola client'
    };
  }

  // SIM services default to originating admin
  if (simServices.includes(serviceType)) {
    return {
      assignedAdminId: originatingAdminId,
      routingReason: 'Pengurusan SIM ditangani oleh administrator yang mengelola client'
    };
  }

  return { assignedAdminId: originatingAdminId, routingReason: 'Pengurusan standar' };
};

// Check if admin can handle service type
export const canAdminHandleService = (adminId, serviceType) => {
  const admin = getAdminById(adminId);
  if (!admin) return false;
  return admin.allowedServices.includes(serviceType);
};

// Get clients for admin. Each admin ONLY sees the clients they manage.
// Cross-admin requests remain visible separately via getRequestsForAdmin()
// (each routed request carries its own clientPic contact snapshot), so the
// client database itself must stay strictly partitioned per admin.
export const getClientsForAdminView = (adminId) => {
  const db = getFleetDatabase();
  // Exclude admin-owned fleet companies (those live on the dedicated
  // "Armada Khusus Admin" page, not the registered-client database).
  return db.companies.filter(
    c => (c.adminId || 'admin-1') === adminId && c.ownerType !== 'admin'
  );
};

// Get requests for admin
export const getRequestsForAdmin = (adminId) => {
  const db = getFleetDatabase();
  return db.requests.filter(r => r.assignedAdminId === adminId);
};

// Validate registration code
export const validateRegistrationCode = (code) => {
  const admin = getAdminByCode(code);
  return admin ? { valid: true, admin } : { valid: false, admin: null };
};

// ----------------------------------------------------
// DB WRITE ACTIONS (Client Side Persistence)
// ----------------------------------------------------

// Add Vehicle
export const addVehicle = (vehicleData) => {
  const db = getFleetDatabase();
  const newVehicle = {
    id: `veh-${Date.now()}`,
    ...vehicleData,
  };
  db.vehicles.push(newVehicle);
  saveFleetDatabase(db);
  return newVehicle;
};

// Update Vehicle
export const updateVehicle = (id, updatedData) => {
  const db = getFleetDatabase();
  const index = db.vehicles.findIndex(v => v.id === id);
  if (index !== -1) {
    db.vehicles[index] = {
      ...db.vehicles[index],
      ...updatedData,
      id // preserve ID
    };
    saveFleetDatabase(db);
    return db.vehicles[index];
  }
  return null;
};

// Update Company Account
export const updateCompany = (companyId, updatedData) => {
  const db = getFleetDatabase();
  const index = db.companies.findIndex(c => c.id === companyId);
  if (index !== -1) {
    db.companies[index] = {
      ...db.companies[index],
      ...updatedData,
      id: companyId // preserve ID
    };
    saveFleetDatabase(db);
    return db.companies[index];
  }
  return null;
};

// Delete Vehicle
export const deleteVehicle = (id) => {
  const db = getFleetDatabase();
  db.vehicles = db.vehicles.filter(v => v.id !== id);
  // clean up documents associated with it
  db.documents = db.documents.filter(d => d.vehicleId !== id);
  // clean up requests associated with it
  db.requests = db.requests.filter(r => r.vehicleId !== id);
  saveFleetDatabase(db);
  return true;
};

// Submit Service Request (Urus Sekarang)
export const addServiceRequest = (requestData) => {
  const db = getFleetDatabase();
  const company = db.companies.find(c => c.id === requestData.companyId);
  const vehicle = db.vehicles.find(v => v.id === requestData.vehicleId);

  const originatingAdminId = company ? (company.adminId || 'admin-1') : 'admin-1';

  // If client explicitly provided assignedAdminId (e.g., for SIM services), use it
  // Otherwise, apply automatic routing based on service type
  let finalAssignedAdminId;
  let finalRoutingReason;

  if (requestData.assignedAdminId) {
    // Client chose a specific admin (e.g., for SIM services)
    finalAssignedAdminId = requestData.assignedAdminId;
    finalRoutingReason = 'Permintaan dikirim ke administrator yang dipilih oleh klien';
  } else {
    // Apply automatic routing based on service type
    const routing = getRouting(requestData.serviceType, originatingAdminId);
    finalAssignedAdminId = routing.assignedAdminId;
    finalRoutingReason = routing.routingReason;
  }

  // Client information to share with the handling admin (especially admin-2 for cross-routed requests)
  const clientInfo = company ? {
    picName: company.picName || 'PIC Utama',
    picPhone: company.picPhone || '62812xxxxxx',
    email: company.email || '',
    companyName: company.name || 'PT Utama'
  } : null;

  const newRequest = {
    id: `req-${Date.now()}`,
    companyName: company ? company.name : 'Unknown Company',
    plateNumber: vehicle ? vehicle.plateNumber : 'Unknown Plate',
    status: 'pending',
    statusLabel: 'Sedang Diajukan',
    estimatedCost: requestData.estimatedCost || 350000, // standard price estimate
    serviceQuote: null, // filled by admin after review (fee, estimatedTime, terms)
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    originatingAdminId,
    assignedAdminId: finalAssignedAdminId,
    routingReason: finalRoutingReason,
    clientPic: clientInfo,
    ...requestData
  };
  db.requests.push(newRequest);
  saveFleetDatabase(db);
  return newRequest;
};

// Admin sends service quote (fee, estimated time, terms) → moves request to 'quoted'
// Client may then approve (Lanjut Urus) or cancel.
export const submitServiceQuote = (requestId, quote) => {
  const db = getFleetDatabase();
  const index = db.requests.findIndex(r => r.id === requestId);
  if (index !== -1) {
    db.requests[index].serviceQuote = {
      serviceFee: Number(quote.serviceFee) || 0,
      estimatedTime: quote.estimatedTime || '',
      terms: quote.terms || '',
      quotedAt: new Date().toISOString(),
    };
    // Keep estimatedCost in sync with the quoted fee
    db.requests[index].estimatedCost = Number(quote.serviceFee) || db.requests[index].estimatedCost;
    db.requests[index].status = 'quoted';
    db.requests[index].statusLabel = 'Menunggu Persetujuan Klien';
    db.requests[index].updatedAt = new Date().toISOString();
    saveFleetDatabase(db);
    return db.requests[index];
  }
  return null;
};

// Client responds to a quote: 'approve' (Lanjut Urus) or 'cancel' (Batalkan)
export const clientRespondToQuote = (requestId, decision) => {
  const db = getFleetDatabase();
  const index = db.requests.findIndex(r => r.id === requestId);
  if (index !== -1) {
    if (decision === 'approve') {
      db.requests[index].status = 'approved';
      db.requests[index].statusLabel = 'Disetujui Klien';
      db.requests[index].clientApprovedAt = new Date().toISOString();
    } else {
      db.requests[index].status = 'cancelled';
      db.requests[index].statusLabel = 'Dibatalkan';
      db.requests[index].clientCancelledAt = new Date().toISOString();
    }
    db.requests[index].updatedAt = new Date().toISOString();
    saveFleetDatabase(db);
    return db.requests[index];
  }
  return null;
};

// Update Request Status (Admin Action)
export const updateRequestStatus = (requestId, status, cost) => {
  const db = getFleetDatabase();
  const index = db.requests.findIndex(r => r.id === requestId);
  if (index !== -1) {
    const statusLabels = {
      pending: 'Sedang Diajukan',
      quoted: 'Menunggu Persetujuan Klien',
      approved: 'Disetujui Klien',
      in_progress: 'Diproses',
      completed: 'Selesai',
      cancelled: 'Dibatalkan'
    };
    db.requests[index].status = status;
    db.requests[index].statusLabel = statusLabels[status] || status;
    if (cost !== undefined) {
      db.requests[index].estimatedCost = Number(cost);
    }
    db.requests[index].updatedAt = new Date().toISOString();

    // If completed and it was a renewal, let's automatically extend that vehicle's document expiry date!
    // This makes the simulation feel incredibly alive!
    if (status === 'completed') {
      const vehId = db.requests[index].vehicleId;
      const type = db.requests[index].serviceType; // e.g. kir_renewal, stnk_renewal, pajak_renewal, multiple
      const vehIndex = db.vehicles.findIndex(v => v.id === vehId);

      if (vehIndex !== -1) {
        const extendDate = (currentDateStr, months) => {
          const date = new Date(CURRENT_DATE_STR); // Extend from current system date so it becomes safe
          date.setMonth(date.getMonth() + months);
          return date.toISOString().split('T')[0];
        };

        if (type === 'kir_renewal' || type === 'buka_blokir_kir' || type === 'multiple') {
          db.vehicles[vehIndex].kirExpiry = extendDate(CURRENT_DATE_STR, 6); // KIR is valid for 6 months
        }
        if (type === 'stnk_renewal' || type === 'multiple') {
          db.vehicles[vehIndex].stnkExpiry = extendDate(CURRENT_DATE_STR, 60); // STNK is valid for 5 years (60 months)
        }
        if (type === 'pajak_renewal' || type === 'multiple') {
          db.vehicles[vehIndex].pajakExpiry = extendDate(CURRENT_DATE_STR, 12); // Pajak is valid for 1 year (12 months)
        }
        db.vehicles[vehIndex].updatedAt = new Date().toISOString();
      }
    }

    saveFleetDatabase(db);
    return db.requests[index];
  }
  return null;
};

// Upload Document (Simulated)
export const addDocument = (docData) => {
  const db = getFleetDatabase();
  const vehicle = db.vehicles.find(v => v.id === docData.vehicleId);
  const company = vehicle ? db.companies.find(c => c.id === vehicle.companyId) : null;

  const labels = {
    kir: 'Buku KIR',
    stnk: 'STNK',
    other: 'Dokumen Pendukung'
  };

  const newDoc = {
    id: `doc-${Date.now()}`,
    plateNumber: vehicle ? vehicle.plateNumber : 'Unknown Plate',
    companyName: company ? company.name : 'Unknown Company',
    docTypeLabel: labels[docData.docType] || docData.docType,
    verificationStatus: 'pending',
    uploadedAt: new Date().toISOString(),
    ...docData
  };

  db.documents.push(newDoc);
  saveFleetDatabase(db);
  return newDoc;
};

// Verify/Reject Document (Admin Action)
export const verifyDocument = (docId, status, reason = '') => {
  const db = getFleetDatabase();
  const index = db.documents.findIndex(d => d.id === docId);
  if (index !== -1) {
    db.documents[index].verificationStatus = status; // verified | rejected
    if (status === 'rejected') {
      db.documents[index].rejectionReason = reason;
    } else {
      db.documents[index].rejectionReason = '';
    }
    saveFleetDatabase(db);
    return db.documents[index];
  }
  return null;
};

// Add a document attachment (base64) tied to a vehicle. Used by the
// Add/Edit Vehicle modals on both client and admin side.
// fileData is a data URL string (≤1MB enforced by caller/UI).
export const addVehicleAttachment = (attachment) => {
  const db = getFleetDatabase();
  const vehicle = db.vehicles.find(v => v.id === attachment.vehicleId);
  const company = vehicle ? db.companies.find(c => c.id === vehicle.companyId) : null;

  const newDoc = {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    vehicleId: attachment.vehicleId,
    docType: attachment.docType || 'other',
    docTypeLabel: attachment.docTypeLabel || 'Dokumen Pendukung',
    fileName: attachment.fileName,
    fileData: attachment.fileData, // data URL (base64)
    fileSize: attachment.fileSize || 0,
    mimeType: attachment.mimeType || '',
    plateNumber: vehicle ? vehicle.plateNumber : 'Unknown Plate',
    companyName: company ? company.name : (attachment.companyName || 'Unknown Company'),
    uploadedBy: attachment.uploadedBy || 'client',
    verificationStatus: 'pending',
    uploadedAt: new Date().toISOString(),
  };
  db.documents.push(newDoc);
  saveFleetDatabase(db);
  return newDoc;
};

// Get all attachments for a vehicle
export const getVehicleAttachments = (vehicleId) => {
  const db = getFleetDatabase();
  return db.documents.filter(d => d.vehicleId === vehicleId && d.fileData);
};

// Remove an attachment
export const deleteDocument = (docId) => {
  const db = getFleetDatabase();
  db.documents = db.documents.filter(d => d.id !== docId);
  saveFleetDatabase(db);
  return true;
};

// ----------------------------------------------------
// MEMBERSHIP REQUESTS (Sentra is the membership authority)
// ----------------------------------------------------
// All membership changes (upgrade / downgrade / cancel) are reviewed by
// Admin Sentra (admin-1) regardless of which admin manages the client.
const SENTRA_ADMIN_ID = 'admin-1';

// Client (or admin on behalf) submits a membership request.
// requestType: 'upgrade' | 'downgrade' | 'cancel'
export const addMembershipRequest = (data) => {
  const db = getFleetDatabase();
  const company = db.companies.find(c => c.id === data.companyId);
  const originatingAdminId = company ? (company.adminId || 'admin-1') : 'admin-1';

  const newReq = {
    id: `mreq-${Date.now()}`,
    companyId: data.companyId,
    companyName: company ? company.name : 'Unknown',
    currentTier: company ? (company.membershipTier || 'free') : 'free',
    requestedTier: data.requestedTier || null,
    requestType: data.requestType, // upgrade | downgrade | cancel
    note: data.note || '',
    status: 'pending', // pending | approved | rejected
    originatingAdminId,
    // Always routed to Sentra for decision
    assignedAdminId: SENTRA_ADMIN_ID,
    routedToSentra: originatingAdminId !== SENTRA_ADMIN_ID,
    clientPic: company ? {
      picName: company.picName || '',
      picPhone: company.picPhone || '',
      email: company.email || '',
    } : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.membershipRequests.push(newReq);
  saveFleetDatabase(db);
  return newReq;
};

// Membership requests assigned to an admin (only Sentra in practice)
export const getMembershipRequestsForAdmin = (adminId) => {
  const db = getFleetDatabase();
  return db.membershipRequests.filter(r => r.assignedAdminId === adminId);
};

// Membership requests created for a company (client view)
export const getMembershipRequestsForCompany = (companyId) => {
  const db = getFleetDatabase();
  return db.membershipRequests.filter(r => r.companyId === companyId);
};

// Sentra acts on a membership request: 'approve' applies the tier change.
export const resolveMembershipRequest = (requestId, decision, adminNote = '') => {
  const db = getFleetDatabase();
  const index = db.membershipRequests.findIndex(r => r.id === requestId);
  if (index === -1) return null;

  const req = db.membershipRequests[index];
  if (decision === 'approve') {
    req.status = 'approved';
    const compIndex = db.companies.findIndex(c => c.id === req.companyId);
    if (compIndex !== -1) {
      if (req.requestType === 'cancel') {
        // Downgrade to free on cancellation (keeps account usable but limited)
        db.companies[compIndex].membershipTier = 'free';
        db.companies[compIndex].membershipPrice = 0;
        db.companies[compIndex].subscriptionStatus = 'cancelled';
      } else if (req.requestedTier) {
        const tier = getTierConfig(req.requestedTier);
        db.companies[compIndex].membershipTier = req.requestedTier;
        db.companies[compIndex].membershipPrice = tier.price;
        db.companies[compIndex].subscriptionStatus = 'active';
      }
    }
  } else {
    req.status = 'rejected';
  }
  req.adminNote = adminNote;
  req.updatedAt = new Date().toISOString();
  saveFleetDatabase(db);
  return req;
};

// Sentra directly changes a client's membership tier (manual override).
export const setCompanyMembership = (companyId, tierId) => {
  const db = getFleetDatabase();
  const index = db.companies.findIndex(c => c.id === companyId);
  if (index === -1) return null;
  const tier = getTierConfig(tierId);
  db.companies[index].membershipTier = tierId;
  db.companies[index].membershipPrice = tier.price;
  db.companies[index].subscriptionStatus = 'active';
  saveFleetDatabase(db);
  return db.companies[index];
};

// ----------------------------------------------------
// ADMIN-OWNED FLEET (Armada Khusus Admin)
// ----------------------------------------------------
// Companies/PTs created by an admin directly (not registered clients).
// Flagged with ownerType: 'admin' so they are excluded from the client DB views.
export const addAdminCompany = (adminId, data) => {
  const db = getFleetDatabase();
  const newCompany = {
    id: `acomp-${Date.now()}`,
    name: data.name,
    picName: data.picName || '',
    picPhone: data.picPhone || '',
    email: data.email || '',
    address: data.address || '',
    membershipTier: 'free',
    membershipPrice: 0,
    status: 'active',
    adminId,
    ownerType: 'admin', // distinguishes admin-owned PT from registered clients
    createdAt: new Date().toISOString(),
  };
  db.companies.push(newCompany);
  saveFleetDatabase(db);
  return newCompany;
};

// Get admin-owned companies for an admin
export const getAdminOwnedCompanies = (adminId) => {
  const db = getFleetDatabase();
  return db.companies.filter(c => c.ownerType === 'admin' && c.adminId === adminId);
};

