import { supabase } from './utils/supabaseClient';

// Test script untuk debug vehicle expiry notification
const testVehicleExpiry = async () => {
  console.log('=== Testing Vehicle Expiry Notification ===\n');

  // 1. Check total vehicles
  const { data: vehicles, error: vErr } = await supabase
    .from('vehicles')
    .select('id, plate_number, company_id, meta_data');

  if (vErr) {
    console.error('❌ Error fetching vehicles:', vErr.message);
    return;
  }

  console.log(`✅ Total vehicles: ${vehicles?.length || 0}`);

  if (!vehicles || vehicles.length === 0) {
    console.log('⚠️ No vehicles found in database');
    return;
  }

  // 2. Check expiry dates
  const docTypes = [
    { key: 'kirExpiry', label: 'KIR' },
    { key: 'stnkExpiry', label: 'STNK' },
    { key: 'pajakExpiry', label: 'Pajak' },
  ];

  const THRESHOLDS = [30, 15, 7, 3, 1, 0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let vehiclesWithExpiry = 0;
  let vehiclesWithinThreshold = 0;

  console.log('\n📋 Vehicles with expiry dates:');
  console.log('---');

  for (const vehicle of vehicles) {
    const meta = vehicle.meta_data || {};
    const plate = vehicle.plate_number || 'N/A';
    const hasAnyExpiry = docTypes.some(doc => meta[doc.key]);

    if (!hasAnyExpiry) {
      console.log(`❌ ${plate}: No expiry dates in meta_data`);
      continue;
    }

    vehiclesWithExpiry++;
    console.log(`\n✅ ${plate} (${vehicle.company_id}):`);

    for (const doc of docTypes) {
      const expiryDate = meta[doc.key];
      if (!expiryDate) {
        console.log(`   - ${doc.label}: No date`);
        continue;
      }

      const target = new Date(expiryDate);
      target.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const isWithinThreshold = THRESHOLDS.includes(daysLeft);
      const status = daysLeft <= 0 ? '⚠️ EXPIRED' :
                     isWithinThreshold ? '🔔 Will notify' : '✅ OK';

      if (isWithinThreshold) vehiclesWithinThreshold++;

      console.log(`   - ${doc.label}: ${expiryDate} (${daysLeft} days) ${status}`);
    }
  }

  console.log('\n---');
  console.log(`📊 Summary:`);
  console.log(`   - Total vehicles: ${vehicles.length}`);
  console.log(`   - With expiry dates: ${vehiclesWithExpiry}`);
  console.log(`   - Within threshold (will be notified): ${vehiclesWithinThreshold}`);

  // 3. Check companies
  const { data: companies, error: cErr } = await supabase
    .from('companies')
    .select('id, name, pic_phone, admin_id');

  if (cErr) {
    console.error('\n❌ Error fetching companies:', cErr.message);
  } else {
    console.log(`   - Total companies: ${companies?.length || 0}`);
    console.log(`   - Companies with pic_phone: ${companies?.filter(c => c.pic_phone).length || 0}`);
  }

  // 4. Check admins
  const { data: admins, error: aErr } = await supabase
    .from('admins')
    .select('id, name, phone');

  if (aErr) {
    console.error('\n❌ Error fetching admins:', aErr.message);
  } else {
    console.log(`   - Total admins: ${admins?.length || 0}`);
    console.log(`   - Admins with phone: ${admins?.filter(a => a.phone).length || 0}`);
  }

  console.log('\n✅ Test completed');
};

testVehicleExpiry();
