import { createClient } from 'jsr:@supabase/supabase-js@^2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Fetch all vehicles with their company info
    const { data: vehicles, error: vErr } = await supabase
      .from('vehicles')
      .select('id, plate_number, company_id, meta_data');

    if (vErr) throw vErr;

    // Fetch all companies to get admin_id and name
    const { data: companies, error: cErr } = await supabase
      .from('companies')
      .select('id, name, admin_id');

    if (cErr) throw cErr;

    const companyMap = new Map(companies.map((c: any) => [c.id, c]));

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
    }

    return new Response(JSON.stringify({
      success: true,
      checked: vehicles?.length || 0,
      notifications_created: inserted,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
