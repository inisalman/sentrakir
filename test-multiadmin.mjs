// End-to-end logic test for multi-admin system.
// Simulates localStorage, then exercises registration + routing helpers.

// --- Minimal localStorage shim ---
const store = {};
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};

const {
  initFleetData,
  getFleetDatabase,
  getAdminByEmail,
  getAdminByCode,
  validateRegistrationCode,
  getRouting,
  getClientsForAdminView,
  getRequestsForAdmin,
  addVehicle,
  addServiceRequest,
} = await import('./src/utils/fleetMockData.js');

let pass = 0, fail = 0;
const check = (name, cond) => {
  if (cond) { pass++; console.log('  PASS:', name); }
  else { fail++; console.log('  FAIL:', name); }
};

console.log('\n=== 1. Admin registry & login ===');
initFleetData();
check('admin@sentrakir.com -> admin-1 (Sentra)', getAdminByEmail('admin@sentrakir.com')?.id === 'admin-1');
check('admin@padajaya.com -> admin-2 (Padajaya)', getAdminByEmail('admin@padajaya.com')?.id === 'admin-2');
check('unknown admin email rejected', getAdminByEmail('nobody@x.com') === undefined);
check('Sentra tier = primary', getAdminByEmail('admin@sentrakir.com')?.tier === 'primary');
check('Padajaya tier = secondary', getAdminByEmail('admin@padajaya.com')?.tier === 'secondary');

console.log('\n=== 2. Registration code validation ===');
check('SENTRA-2024 valid -> admin-1', validateRegistrationCode('SENTRA-2024').admin?.id === 'admin-1');
check('PADAJAYA-2024 valid -> admin-2', validateRegistrationCode('PADAJAYA-2024').admin?.id === 'admin-2');
check('invalid code rejected', validateRegistrationCode('TEST-123').valid === false);

console.log('\n=== 3. Register two clients under different admins ===');
const db = getFleetDatabase();
const sentraClient = { id: 'comp-sentra', name: 'PT Sentra Client', picName: 'Budi', picPhone: '628111', email: 'budi@sentra.com', adminId: 'admin-1', status: 'active' };
const padaClient   = { id: 'comp-pada', name: 'PT Pada Client', picName: 'Sari', picPhone: '628222', email: 'sari@pada.com', adminId: 'admin-2', status: 'active' };
db.companies.push(sentraClient, padaClient);
localStorage.setItem('sentra_fleet_database', JSON.stringify(db));

check('Sentra view sees only its own client', (() => {
  const list = getClientsForAdminView('admin-1');
  return list.length === 1 && list[0].id === 'comp-sentra';
})());
check('Padajaya view sees ALL clients (for cross-routing)', getClientsForAdminView('admin-2').length === 2);

console.log('\n=== 4. Routing logic ===');
check('KIR from Sentra client stays at admin-1', getRouting('kir_renewal', 'admin-1').assignedAdminId === 'admin-1');
check('Buka Blokir from Sentra client stays at admin-1', getRouting('buka_blokir_kir', 'admin-1').assignedAdminId === 'admin-1');
check('STNK from Sentra client routes to admin-2', getRouting('stnk_renewal', 'admin-1').assignedAdminId === 'admin-2');
check('Pajak from Sentra client routes to admin-2', getRouting('pajak_renewal', 'admin-1').assignedAdminId === 'admin-2');
check('Multiple from Sentra client routes to admin-2', getRouting('multiple', 'admin-1').assignedAdminId === 'admin-2');
check('STNK from Padajaya client stays at admin-2', getRouting('stnk_renewal', 'admin-2').assignedAdminId === 'admin-2');

console.log('\n=== 5. End-to-end request creation + client info sharing ===');
const veh = addVehicle({ companyId: 'comp-sentra', plateNumber: 'B 1 ABC', vehicleType: 'Box', kirExpiry: '2026-09-01', stnkExpiry: '2026-09-01', pajakExpiry: '2026-09-01' });
// Sentra client submits a STNK renewal -> should route to admin-2 with clientPic attached
const stnkReq = addServiceRequest({ companyId: 'comp-sentra', vehicleId: veh.id, serviceType: 'stnk_renewal', serviceTypeLabel: 'Perpanjangan STNK' });
check('STNK request originatingAdminId = admin-1', stnkReq.originatingAdminId === 'admin-1');
check('STNK request assignedAdminId = admin-2', stnkReq.assignedAdminId === 'admin-2');
check('STNK request carries clientPic (PIC name)', stnkReq.clientPic?.picName === 'Budi');
check('STNK request carries clientPic (phone)', stnkReq.clientPic?.picPhone === '628111');
check('STNK request carries clientPic (email)', stnkReq.clientPic?.email === 'budi@sentra.com');
check('STNK request carries clientPic (company)', stnkReq.clientPic?.companyName === 'PT Sentra Client');

// Sentra client submits a KIR renewal -> stays at admin-1
const kirReq = addServiceRequest({ companyId: 'comp-sentra', vehicleId: veh.id, serviceType: 'kir_renewal', serviceTypeLabel: 'Perpanjangan KIR' });
check('KIR request assignedAdminId = admin-1', kirReq.assignedAdminId === 'admin-1');

console.log('\n=== 6. Admin queue isolation ===');
const admin1Q = getRequestsForAdmin('admin-1');
const admin2Q = getRequestsForAdmin('admin-2');
console.log(`  (debug) kirReq.id=${kirReq.id} stnkReq.id=${stnkReq.id} idsCollide=${kirReq.id === stnkReq.id}`);
// Distinguish by serviceType to avoid Date.now() id collision when created in same ms
check('admin-1 queue has a kir_renewal request', admin1Q.some(r => r.serviceType === 'kir_renewal'));
check('admin-1 queue has NO stnk_renewal request', !admin1Q.some(r => r.serviceType === 'stnk_renewal'));
check('admin-2 queue has the routed stnk_renewal request', admin2Q.some(r => r.serviceType === 'stnk_renewal'));
check('admin-2 queue has NO kir_renewal request', !admin2Q.some(r => r.serviceType === 'kir_renewal'));
check('every request in admin-1 queue is assigned to admin-1', admin1Q.every(r => r.assignedAdminId === 'admin-1'));
check('every request in admin-2 queue is assigned to admin-2', admin2Q.every(r => r.assignedAdminId === 'admin-2'));

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
process.exit(fail === 0 ? 0 : 1);
