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
    allowedServices: ['kir_renewal', 'buka_blokir_kir', 'lapor_hilang', 'media_nasional'],
    createdAt: '2026-06-07T00:00:00.000Z'
  },
  {
    id: 'admin-2',
    email: 'admin@padajaya.com',
    name: 'Padajaya',
    registrationCode: 'PADAJAYA-2024',
    status: 'active',
    tier: 'secondary',
    allowedServices: ['stnk_renewal', 'pajak_renewal', 'kir_renewal', 'buka_blokir_kir', 'lapor_hilang', 'media_nasional'],
    createdAt: '2026-06-07T00:00:00.000Z'
  }
];

// Initialize database in localStorage (start empty)
export const initFleetData = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const db = { admins: ADMINS, companies: [], vehicles: [], requests: [], documents: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return db;
  }
  const db = JSON.parse(existing);
  // Ensure admins array exists for migration
  if (!db.admins) {
    db.admins = ADMINS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
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
  // STNK and Pajak ALWAYS go to admin-2 (Padajaya)
  if (serviceType === 'stnk_renewal' || serviceType === 'pajak_renewal') {
    return {
      assignedAdminId: 'admin-2',
      routingReason: 'Permintaan STNK/Pajak selalu ditangani oleh administrator Padajaya'
    };
  }

  // KIR & Balik Nama requests stay with originating admin
  if (serviceType === 'kir_renewal' || serviceType === 'buka_blokir_kir' || serviceType === 'balik_nama') {
    return {
      assignedAdminId: originatingAdminId,
      routingReason: 'Permintaan KIR ditangani oleh administrator yang mengelola client'
    };
  }

  // Multiple requests go to admin-2 (since includes STNK/Pajak)
  if (serviceType === 'multiple') {
    return {
      assignedAdminId: 'admin-2',
      routingReason: 'Permintaan kombinasi KIR+STNK/Pajak ditangani oleh administrator Padajaya'
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

// Get clients for admin (including cross-routed requests)
export const getClientsForAdminView = (adminId) => {
  const db = getFleetDatabase();

  if (adminId === 'admin-1') {
    // Admin 1 sees only their own clients (default to admin-1 if undefined)
    return db.companies.filter(c => (c.adminId || 'admin-1') === 'admin-1');
  } else if (adminId === 'admin-2') {
    // Admin 2 sees their own clients + clients from other admins (for cross-routed requests visibility)
    return db.companies;
  }

  return [];
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
  const routing = getRouting(requestData.serviceType, originatingAdminId);

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
    statusLabel: 'Menunggu Konfirmasi',
    estimatedCost: requestData.estimatedCost || 350000, // standard price estimate
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    originatingAdminId,
    assignedAdminId: routing.assignedAdminId,
    routingReason: routing.routingReason,
    clientPic: clientInfo,
    ...requestData
  };
  db.requests.push(newRequest);
  saveFleetDatabase(db);
  return newRequest;
};

// Update Request Status (Admin Action)
export const updateRequestStatus = (requestId, status, cost) => {
  const db = getFleetDatabase();
  const index = db.requests.findIndex(r => r.id === requestId);
  if (index !== -1) {
    const statusLabels = {
      pending: 'Menunggu Konfirmasi',
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
