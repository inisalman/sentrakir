import { createClient } from 'jsr:@supabase/supabase-js@^2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    const h = getCorsHeaders(req);
    return new Response('ok', { headers: h });
  }

  try {
    const h = getCorsHeaders(req);
    const body = await req.json();
    const { type, adminId, companyName, serviceType, fromTier, toTier, referenceId } = body;

    if (!type || !adminId) {
      return new Response(JSON.stringify({ error: 'type and adminId required' }), {
        status: 400,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    let title = '';
    let message = '';
    let priority = 'normal';
    let referenceType = 'request';

    switch (type) {
      case 'request_new':
        title = 'Request Baru';
        message = `${companyName} mengajukan ${serviceType || 'pengurusan dokumen'}`;
        priority = 'normal';
        referenceType = 'request';
        break;

      case 'membership_request':
        title = 'Request Membership';
        message = `${companyName} minta upgrade dari ${fromTier} ke ${toTier}`;
        priority = 'high';
        referenceType = 'company';
        break;

      case 'ai_chat':
        title = 'Chat Baru';
        message = `${companyName} mengirim pesan chat`;
        priority = 'normal';
        referenceType = 'chat';
        break;

      default:
        title = 'Notifikasi';
        message = body.message || 'Ada aktivitas baru';
    }

    const { data, error } = await supabase
      .from('admin_notifications')
      .insert([{
        admin_id: adminId,
        type,
        title,
        message,
        priority,
        reference_id: referenceId || null,
        reference_type: referenceType,
        meta_data: { companyName, serviceType, fromTier, toTier },
      }])
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to create notification' }), {
        status: 500,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, notification: data }), {
      headers: { ...h, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { ...h, 'Content-Type': 'application/json' },
    });
  }
});
