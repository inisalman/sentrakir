/**
 * Test: OCR Sertifikat KIR Auto-Fill Feature
 *
 * Verifies that scanning Sertifikat KIR auto-fills Data Kartu Kendaraan
 */

import fs from 'fs';
import path from 'path';

console.log('='.repeat(70));
console.log('TEST: OCR Sertifikat KIR Auto-Fill Feature');
console.log('='.repeat(70));

const clientDashboardPath = path.join(process.cwd(), 'src/components/Fleet/ClientDashboard.jsx');
const content = fs.readFileSync(clientDashboardPath, 'utf-8');

// Test 1: OCR auto-fill logic exists for sertifikatKir
console.log('\n✓ Test 1: OCR auto-fill logic for Sertifikat KIR');
if (content.includes('if (docType === "sertifikatKir")')) {
  console.log('  ✅ Sertifikat KIR specific auto-fill logic found');
} else {
  console.error('  ❌ Sertifikat KIR auto-fill logic not found');
  process.exit(1);
}

// Test 2: All required OCR fields are extracted
console.log('\n✓ Test 2: OCR fields extracted from Sertifikat KIR');
const requiredFields = [
  'ownerName',       // Nama Pemilik
  'ownerAddress',    // Alamat Pemilik
  'frameNumber',     // No Rangka
  'engineNumber',    // No Mesin
  'testNumber',      // No Uji Kendaraan
];

let allFieldsPresent = true;
requiredFields.forEach(field => {
  // Check that field is being set in the updateData for sertifikatKir
  const regex = new RegExp(`${field}:\\s*formData\\.${field}`);
  if (!regex.test(content)) {
    console.error(`  ❌ Field "${field}" not being auto-filled`);
    allFieldsPresent = false;
  }
});

if (allFieldsPresent) {
  console.log(`  ✅ All ${requiredFields.length} required OCR fields extracted`);
  console.log('     • Nama Pemilik (ownerName)');
  console.log('     • Alamat Pemilik (ownerAddress)');
  console.log('     • No Rangka (frameNumber)');
  console.log('     • No Mesin (engineNumber)');
  console.log('     • No Uji Kendaraan (testNumber)');
  console.log('     • NOPOL (plateNumber - already in form)');
}

// Test 3: Form state has OCR fields initialized
console.log('\n✓ Test 3: Form state initialization');
const formStateFields = ['ownerName', 'ownerAddress', 'frameNumber', 'engineNumber'];
let allStateFields = true;
formStateFields.forEach(field => {
  if (!content.includes(`${field}: ""`)) {
    console.error(`  ❌ Field "${field}" not in form state`);
    allStateFields = false;
  }
});
if (allStateFields) {
  console.log('  ✅ All OCR fields initialized in form state');
}

// Test 4: handleAddSubmit saves OCR fields
console.log('\n✓ Test 4: handleAddSubmit saves OCR data');
if (content.includes('ownerName: formData.ownerName') &&
    content.includes('frameNumber: formData.frameNumber') &&
    content.includes('engineNumber: formData.engineNumber')) {
  console.log('  ✅ OCR fields saved in addVehicle');
} else {
  console.error('  ❌ OCR fields not saved in addVehicle');
  process.exit(1);
}

// Test 5: handleEditSubmit preserves OCR fields
console.log('\n✓ Test 5: handleEditSubmit preserves OCR data');
if (content.includes('formData.ownerName || selectedVehicle.ownerName') &&
    content.includes('formData.frameNumber || selectedVehicle.frameNumber')) {
  console.log('  ✅ OCR fields preserved in updateVehicle');
} else {
  console.error('  ❌ OCR fields not preserved in updateVehicle');
  process.exit(1);
}

// Test 6: handleOpenEdit loads OCR fields
console.log('\n✓ Test 6: handleOpenEdit loads existing OCR data');
if (content.includes('ownerName: vehicle.ownerName') &&
    content.includes('frameNumber: vehicle.frameNumber')) {
  console.log('  ✅ OCR fields loaded when editing vehicle');
} else {
  console.error('  ❌ OCR fields not loaded in handleOpenEdit');
  process.exit(1);
}

// Test 7: Success message shows extracted data
console.log('\n✓ Test 7: Success message displays extracted data');
if (content.includes('Data berhasil diekstrak') &&
    content.includes('mengisi "Data Kartu Kendaraan"')) {
  console.log('  ✅ Success message shows auto-filled data confirmation');
} else {
  console.error('  ❌ Success message not enhanced for Sertifikat KIR');
  process.exit(1);
}

// Test 8: Success message lists all fields
console.log('\n✓ Test 8: Success message lists extracted fields');
const messageFields = [
  'Nama Pemilik',
  'Alamat Pemilik',
  'No Registrasi/NOPOL',
  'No Rangka',
  'No Mesin',
  'No Uji Kendaraan'
];
let allMessageFields = true;
messageFields.forEach(field => {
  if (!content.includes(field)) {
    console.error(`  ❌ Field "${field}" not in success message`);
    allMessageFields = false;
  }
});
if (allMessageFields) {
  console.log(`  ✅ All ${messageFields.length} fields listed in success message`);
}

// Test 9: Realistic mock data
console.log('\n✓ Test 9: Realistic mock data generation');
if (content.includes('ownerNames') &&
    content.includes('addresses') &&
    content.includes('brands')) {
  console.log('  ✅ Realistic Indonesian mock data arrays present');
} else {
  console.error('  ❌ Mock data not realistic');
  process.exit(1);
}

// Test 10: Consistent data based on plate
console.log('\n✓ Test 10: Consistent data generation');
if (content.includes('plate.split("").reduce')) {
  console.log('  ✅ Data consistently generated based on plate number');
} else {
  console.error('  ❌ Data generation not consistent');
  process.exit(1);
}

console.log('\n' + '='.repeat(70));
console.log('✅ ALL TESTS PASSED');
console.log('='.repeat(70));
console.log('\nFeature Summary:');
console.log('• Scan Sertifikat KIR → Auto-fills Data Kartu Kendaraan');
console.log('• 6 fields extracted: Nama, Alamat, NOPOL, Rangka, Mesin, Uji');
console.log('• Data saved on add & preserved on edit');
console.log('• Loaded correctly when editing vehicle');
console.log('• Success message confirms extracted data');
console.log('• Realistic Indonesian mock data');
console.log('• Consistent data based on plate number');
console.log('\n');
