import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FONNTE_TOKEN = Deno.env.get('FONNTE_TOKEN') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const REMINDER_DAYS = [30, 14, 7, 1];

const sendWA = async (phone: string, message: string) => {
  if (!phone || !FONNTE_TOKEN) {
    console.log('Skip WA: no phone or token', { phone: !!phone, token: !!FONNTE_TOKEN });
    return;
  }
  const normalized = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
  try {
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        target: normalized,
        message,
        countryCode: '62',
      }),
    });
    const data = await res.json();
    console.log('WA sent to', normalized, ':', JSON.stringify(data));
  } catch (err) {
    console.error('Error sending WA:', err);
  }
};

const daysUntil = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const buildMessage = (plate: string, docType: string, daysLeft: number, name: string): string => {
  const urgency = daysLeft <= 0 ? '🚨 *SUDAH EXPIRED*' : daysLeft <= 7 ? '⚠️ *SEGERA*' : '📅 *REMINDER*';
  const expiredText = daysLeft <= 0
    ? `sudah *expired ${Math.abs(daysLeft)} hari* yang lalu`
    : `akan habis dalam *${daysLeft} hari*`;
  return `${urgency} - Sentra Fleet\n\nHalo *${name}*!\n\nKendaraan *${plate}* — dokumen *${docType}* ${expiredText}.\n\nSegera urus perpanjangan untuk menghindari tilang.\n\n_Sentra Fleet - B2B Compliance Portal_`;
};

Deno.serve(async () => {
  try {
    console.log('notify-expiry started');

    // 1. Fetch admin vehicles + admin phone terpisah
    const { data: adminVehicles, error: avError } = await supabase
      .from('admin_vehicles')
      .select('*');

    if (avError) console.error('Error fetching admin_vehicles:', avError.message);
    console.log('admin_vehicles count:', adminVehicles?.length ?? 0);

    // 2. Fetch admins
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('id, phone, name');

    if (adminsError) console.error('Error fetching admins:', adminsError.message);
    console.log('admins count:', admins?.length ?? 0);

    // 3. Fetch client vehicles
    const { data: vehicles, error: vError } = await supabase
      .from('vehicles')
      .select('*');

    if (vError) console.error('Error fetching vehicles:', vError.message);
    console.log('vehicles count:', vehicles?.length ?? 0);

    // 4. Fetch companies
    const { data: companies, error: cError } = await supabase
      .from('companies')
      .select('id, name, pic_phone, admin_id');

    if (cError) console.error('Error fetching companies:', cError.message);
    console.log('companies count:', companies?.length ?? 0);

    let notifCount = 0;

    // Proses admin_vehicles
    for (const v of adminVehicles ?? []) {
      const admin = admins?.find(a => a.id === v.admin_id);
      if (!admin?.phone) continue;

      const docs = [
        { type: 'KIR', expiry: v.kir_expiry },
        { type: 'STNK 5 Tahunan', expiry: v.stnk_expiry },
        { type: 'Pajak Tahunan', expiry: v.pajak_expiry },
        { type: 'SIM', expiry: v.sim_expiry },
      ];

      for (const doc of docs) {
        if (!doc.expiry) continue;
        const days = daysUntil(doc.expiry);
        console.log(`Admin vehicle ${v.plate_number} ${doc.type}: ${days} days`);
        if (!REMINDER_DAYS.includes(days)) continue;

        const msg = buildMessage(v.plate_number, doc.type, days, 'Admin');
        await sendWA(admin.phone, msg);
        notifCount++;
      }
    }

    // Proses client vehicles (expiry dates stored in meta_data JSONB)
    for (const v of vehicles ?? []) {
      const company = companies?.find(c => c.id === v.company_id);
      if (!company) continue;

      const admin = admins?.find(a => a.id === company.admin_id);
      const meta = v.meta_data || {};
      const plate = v.plate_number || meta.plateNumber || 'N/A';

      const docs = [
        { type: 'KIR', expiry: meta.kirExpiry },
        { type: 'STNK 5 Tahunan', expiry: meta.stnkExpiry },
        { type: 'Pajak Tahunan', expiry: meta.pajakExpiry },
        { type: 'SIM', expiry: meta.simDriverExpiry },
      ];

      for (const doc of docs) {
        if (!doc.expiry) continue;
        const days = daysUntil(doc.expiry);
        if (!REMINDER_DAYS.includes(days)) continue;

        const msg = buildMessage(plate, doc.type, days, company.name);
        if (company.pic_phone) { await sendWA(company.pic_phone, msg); notifCount++; }
        if (admin?.phone) { await sendWA(admin.phone, `[ADMIN] ` + msg); notifCount++; }
      }
    }

    console.log('Total notif sent:', notifCount);
    return new Response(JSON.stringify({ success: true, notifCount }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Fatal error:', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
