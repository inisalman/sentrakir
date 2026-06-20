import { createClient } from 'jsr:@supabase/supabase-js@^2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const FONNTE_TOKEN = Deno.env.get('FONNTE_TOKEN') ?? '';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ALLOWED_ORIGINS = ['https://sentrakir.com', 'http://localhost:5173', 'capacitor://localhost', 'http://localhost'];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

const sendWA = async (phone: string, message: string): Promise<boolean> => {
  if (!phone || !FONNTE_TOKEN) return false;
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
    return data.status;
  } catch (err) {
    console.error('Error sending WA:', err);
    return false;
  }
};

// Reminder thresholds in days
const THRESHOLDS = [30, 15, 7, 3, 1, 0];

function getDaysUntil(dateStr: string): number {
  if (!dateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getPriority(days: number): string {
  if (days <= 0) return 'urgent';
  if (days <= 3) return 'high';
  if (days <= 7) return 'normal';
  return 'low';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const h = getCorsHeaders(req);
    // Fetch all vehicles with their company info
    const { data: vehicles, error: vErr } = await supabase
      .from('vehicles')
      .select('id, plate_number, company_id, meta_data');

    if (vErr) throw vErr;

    // Fetch all companies to get admin_id, name, pic_phone
    const { data: companies, error: cErr } = await supabase
      .from('companies')
      .select('id, name, pic_phone, admin_id');

    if (cErr) throw cErr;

    // Fetch all admins to get phone
    const { data: admins, error: aErr } = await supabase
      .from('admins')
      .select('id, name, phone');

    if (aErr) throw aErr;

    const companyMap = new Map(companies.map((c: any) => [c.id, c]));
    const adminMap = new Map(admins.map((a: any) => [a.id, a]));

    const notifications: any[] = [];
    const docTypes = [
      { key: 'kirExpiry', label: 'KIR' },
      { key: 'stnkExpiry', label: 'STNK' },
      { key: 'pajakExpiry', label: 'Pajak' },
    ];

    for (const vehicle of vehicles || []) {
      const company = companyMap.get(vehicle.company_id);
      if (!company || !company.admin_id) continue;

      const meta = vehicle.meta_data || {};
      const plate = vehicle.plate_number || meta.plateNumber || 'N/A';

      for (const doc of docTypes) {
        const expiryDate = meta[doc.key];
        if (!expiryDate) continue;

        const daysLeft = getDaysUntil(expiryDate);

        // Only create notification if days match one of the thresholds
        if (!THRESHOLDS.includes(daysLeft)) continue;

        const label = daysLeft === 0 ? 'HARI INI' : `H-${daysLeft}`;
        notifications.push({
          admin_id: company.admin_id,
          type: 'vehicle_expiry',
          title: `Jatuh Tempo ${doc.label} ${label}`,
          message: `${plate} (${company.name}) — ${doc.label} jatuh tempo ${label}`,
          priority: getPriority(daysLeft),
          reference_id: vehicle.id,
          reference_type: 'vehicle',
          meta_data: {
            vehicleId: vehicle.id,
            plateNumber: plate,
            companyName: company.name,
            docType: doc.key,
            expiryDate,
            daysLeft,
          },
        });
      }
    }

    // Deduplicate: check if similar notification already exists today
    const today = new Date().toISOString().split('T')[0];
    let inserted = 0;

    for (const notif of notifications) {
      const { data: existing } = await supabase
        .from('admin_notifications')
        .select('id')
        .eq('admin_id', notif.admin_id)
        .eq('reference_id', notif.reference_id)
        .eq('type', 'vehicle_expiry')
        .gte('created_at', today + 'T00:00:00Z')
        .limit(1);

      if (existing && existing.length > 0) continue;

      await supabase.from('admin_notifications').insert([notif]);
      inserted++;

      // Send WhatsApp notifications
      const meta = notif.meta_data;
      const company = companyMap.get(notif.admin_id) || Array.from(companyMap.values()).find(c => c.name === meta.companyName);
      const admin = adminMap.get(notif.admin_id);

      const labelWaktu = meta.daysLeft === 0 ? "HARI INI" : `dalam ${meta.daysLeft} hari`;
      const waMessage = `⚠️ *PENGINGAT JATUH TEMPO*\n\nKendaraan dengan plat *${meta.plateNumber}* dari perusahaan *${meta.companyName}* masa berlaku *${meta.docType.replace('Expiry', '').toUpperCase()}* nya akan habis ${labelWaktu} (${meta.expiryDate}).\n\nMohon segera diproses.`;

      if (company?.pic_phone) {
        await sendWA(company.pic_phone, waMessage);
      }

      if (admin?.phone) {
        await sendWA(admin.phone, waMessage);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      checked: vehicles?.length || 0,
      notifications_created: inserted,
    }), {
      headers: { ...h, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...h, 'Content-Type': 'application/json' },
    });
  }
});
