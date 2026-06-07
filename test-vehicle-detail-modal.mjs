/**
 * Test: Vehicle Detail Modal Feature
 *
 * Verifies that the "Data Lengkap Kendaraan" modal is properly integrated
 * into the ClientDashboard component and displays all vehicle information.
 */

import fs from 'fs';
import path from 'path';

console.log('='.repeat(70));
console.log('TEST: Vehicle Detail Modal Feature');
console.log('='.repeat(70));

const clientDashboardPath = path.join(process.cwd(), 'src/components/Fleet/ClientDashboard.jsx');

if (!fs.existsSync(clientDashboardPath)) {
  console.error('❌ ClientDashboard.jsx not found');
  process.exit(1);
}

const content = fs.readFileSync(clientDashboardPath, 'utf-8');

// Test 1: Check state initialization
console.log('\n✓ Test 1: State initialization');
if (content.includes('const [vehicleDetailModal, setVehicleDetailModal] = useState(null)')) {
  console.log('  ✅ vehicleDetailModal state properly initialized');
} else {
  console.error('  ❌ vehicleDetailModal state not found');
  process.exit(1);
}

// Test 2: Check button to open modal
console.log('\n✓ Test 2: Button to open modal');
if (content.includes('onClick={() => setVehicleDetailModal(v)}') &&
    content.includes('title="Lihat Data Lengkap"')) {
  console.log('  ✅ Button with onClick handler and title found');
} else {
  console.error('  ❌ Button not properly configured');
  process.exit(1);
}

// Test 3: Check modal overlay structure
console.log('\n✓ Test 3: Modal overlay structure');
if (content.includes('{vehicleDetailModal && (') &&
    content.includes('className="fleet-modal-overlay"')) {
  console.log('  ✅ Modal overlay conditional rendering found');
} else {
  console.error('  ❌ Modal overlay structure missing');
  process.exit(1);
}

// Test 4: Check modal header
console.log('\n✓ Test 4: Modal header');
if (content.includes('📋 Data Lengkap Kendaraan') &&
    content.includes('{vehicleDetailModal.plateNumber}')) {
  console.log('  ✅ Modal header with plate number found');
} else {
  console.error('  ❌ Modal header not properly structured');
  process.exit(1);
}

// Test 5: Check Informasi Dasar section
console.log('\n✓ Test 5: Informasi Dasar section');
if (content.includes('📌 Informasi Dasar Kendaraan') &&
    content.includes('vehicleDetailModal.vehicleType')) {
  console.log('  ✅ Basic vehicle info section found');
} else {
  console.error('  ❌ Basic vehicle info section missing');
  process.exit(1);
}

// Test 6: Check Masa Berlaku Dokumen section
console.log('\n✓ Test 6: Masa Berlaku Dokumen section');
if (content.includes('📅 Masa Berlaku Dokumen') &&
    content.includes('vehicleDetailModal.kirExpiry') &&
    content.includes('vehicleDetailModal.stnkExpiry') &&
    content.includes('vehicleDetailModal.pajakExpiry')) {
  console.log('  ✅ Document expiry section found with all three document types');
} else {
  console.error('  ❌ Document expiry section incomplete');
  process.exit(1);
}

// Test 7: Check Status Dokumen Pindaian section
console.log('\n✓ Test 7: Status Dokumen Pindaian section');
if (content.includes('📄 Status Dokumen Pindaian') &&
    content.includes('kartuKir') &&
    content.includes('sertifikatKir') &&
    content.includes('stnk')) {
  console.log('  ✅ Document scan status section with all document types found');
} else {
  console.error('  ❌ Document scan status section incomplete');
  process.exit(1);
}

// Test 8: Check getDaysRemaining usage
console.log('\n✓ Test 8: getDaysRemaining integration');
const dayRemainingCount = (content.match(/getDaysRemaining\(vehicleDetailModal\./g) || []).length;
if (dayRemainingCount >= 4) {
  console.log(`  ✅ getDaysRemaining called ${dayRemainingCount} times for status calculation`);
} else {
  console.error(`  ❌ getDaysRemaining not used enough (found ${dayRemainingCount}, expected >= 4)`);
  process.exit(1);
}

// Test 9: Check modal close functionality
console.log('\n✓ Test 9: Modal close functionality');
if (content.includes('onClick={() => setVehicleDetailModal(null)}')) {
  console.log('  ✅ Modal close button found (multiple instances)');
} else {
  console.error('  ❌ Modal close functionality missing');
  process.exit(1);
}

// Test 10: Check optional SIM Driver section
console.log('\n✓ Test 10: Optional SIM Driver section');
if (content.includes('{vehicleDetailModal.simDriverExpiry && (') &&
    content.includes('🪪 SIM Driver')) {
  console.log('  ✅ Optional SIM Driver section properly conditionally rendered');
} else {
  console.error('  ❌ SIM Driver section not conditional');
  process.exit(1);
}

// Test 11: Check optional Notes section
console.log('\n✓ Test 11: Optional Catatan section');
if (content.includes('{vehicleDetailModal.notes && (') &&
    content.includes('📝 Catatan Tambahan')) {
  console.log('  ✅ Optional Notes section properly conditionally rendered');
} else {
  console.error('  ❌ Notes section not conditional');
  process.exit(1);
}

// Test 12: Check styling consistency
console.log('\n✓ Test 12: Styling consistency');
if (content.includes('maxWidth: "700px"') &&
    content.includes('gridTemplateColumns: "1fr 1fr"') &&
    content.includes('gridTemplateColumns: "1fr 1fr 1fr"')) {
  console.log('  ✅ Modal and grid styling properly configured');
} else {
  console.error('  ❌ Styling may be incomplete');
  process.exit(1);
}

console.log('\n' + '='.repeat(70));
console.log('✅ ALL TESTS PASSED');
console.log('='.repeat(70));
console.log('\nFeature Summary:');
console.log('• Modal state: vehicleDetailModal');
console.log('• Trigger button: 👁️ "Lihat Data Lengkap" on vehicle table');
console.log('• Sections: Informasi Dasar, Masa Berlaku, SIM Driver (optional),');
console.log('  Status Dokumen, Catatan (optional)');
console.log('• Responsive grid layout with proper color coding');
console.log('• Integration with getDaysRemaining for status calculation');
console.log('\n');
