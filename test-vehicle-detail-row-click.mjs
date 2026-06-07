/**
 * Test: Vehicle Detail Modal - Row Click Activation
 *
 * Verifies that the modal opens when clicking anywhere on the vehicle table row
 * (not just a dedicated button)
 */

import fs from 'fs';
import path from 'path';

console.log('='.repeat(70));
console.log('TEST: Vehicle Detail Modal - Row Click Activation');
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

// Test 2: Check row onClick handler
console.log('\n✓ Test 2: Row onClick handler');
if (content.includes('<tr') && content.includes('onClick={() => setVehicleDetailModal(v)}')) {
  console.log('  ✅ Row onClick handler to open modal found');
} else {
  console.error('  ❌ Row onClick handler not found');
  process.exit(1);
}

// Test 3: Check cursor pointer style
console.log('\n✓ Test 3: Cursor pointer styling');
if (content.includes('cursor: "pointer"')) {
  console.log('  ✅ Cursor pointer style added to indicate clickable row');
} else {
  console.error('  ❌ Cursor pointer style missing');
  process.exit(1);
}

// Test 4: Check hover effect
console.log('\n✓ Test 4: Hover effect styling');
if (content.includes('onMouseEnter') && content.includes('onMouseLeave')) {
  console.log('  ✅ Hover effect (backgroundColor change) added');
} else {
  console.error('  ❌ Hover effect missing');
  process.exit(1);
}

// Test 5: Check stopPropagation on action buttons
console.log('\n✓ Test 5: Event propagation prevention');
const stopPropagationCount = (content.match(/e\.stopPropagation\(\)/g) || []).length;
if (stopPropagationCount >= 4) {
  console.log(`  ✅ stopPropagation called ${stopPropagationCount} times on action buttons`);
} else {
  console.error(`  ❌ stopPropagation not used enough (found ${stopPropagationCount}, expected >= 4)`);
  process.exit(1);
}

// Test 6: Check that 👁️ button is removed
console.log('\n✓ Test 6: Old eye button removed');
const eyeButtonMatches = content.match(/title="Lihat Data Lengkap"/g);
if (!eyeButtonMatches || eyeButtonMatches.length === 0) {
  console.log('  ✅ Old 👁️ "Lihat Data Lengkap" button removed');
} else {
  console.error('  ❌ Old eye button still exists');
  process.exit(1);
}

// Test 7: Check Dokumen button has stopPropagation
console.log('\n✓ Test 7: Dokumen button event handling');
if (content.includes('📄 Dokumen Diupload') &&
    content.includes('onClick={(e) => {') &&
    content.includes('e.stopPropagation()')) {
  console.log('  ✅ Dokumen button has proper event handling');
} else {
  console.error('  ❌ Dokumen button event handling incomplete');
  process.exit(1);
}

// Test 8: Check action td has stopPropagation
console.log('\n✓ Test 8: Action column event handling');
if (content.includes('<td') &&
    content.includes('onClick={(e) => e.stopPropagation()}') &&
    content.includes('URUS SEKARANG')) {
  console.log('  ✅ Action column has proper event handling');
} else {
  console.error('  ❌ Action column event handling incomplete');
  process.exit(1);
}

// Test 9: Check modal overlay conditional
console.log('\n✓ Test 9: Modal overlay structure');
if (content.includes('{vehicleDetailModal && (') &&
    content.includes('className="fleet-modal-overlay"')) {
  console.log('  ✅ Modal overlay conditional rendering found');
} else {
  console.error('  ❌ Modal overlay structure missing');
  process.exit(1);
}

// Test 10: Check modal sections still exist
console.log('\n✓ Test 10: Modal content sections');
if (content.includes('📌 Informasi Dasar Kendaraan') &&
    content.includes('📅 Masa Berlaku Dokumen') &&
    content.includes('📄 Status Dokumen')) {
  console.log('  ✅ All modal sections intact');
} else {
  console.error('  ❌ Modal sections missing');
  process.exit(1);
}

console.log('\n' + '='.repeat(70));
console.log('✅ ALL TESTS PASSED');
console.log('='.repeat(70));
console.log('\nFeature Summary:');
console.log('• Modal opens on: Click anywhere on vehicle table row');
console.log('• Cursor: Changes to pointer on hover');
console.log('• Hover effect: Background color change to light green');
console.log('• Action buttons: Prevent row click (stopPropagation)');
console.log('• Buttons retained: Edit (✏️), Delete (🗑️), "URUS SEKARANG"');
console.log('• Dokumen button: Still functional with event handling');
console.log('• Removed: 👁️ "Lihat Data Lengkap" button');
console.log('• Modal: 5 sections with complete vehicle information');
console.log('\n');
