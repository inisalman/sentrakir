import { createClient } from 'jsr:@supabase/supabase-js@^2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, adminId, companyName, serviceType, fromTier, toTier, referenceId } = body;

    if (!type || !adminId) {
      return new Response(JSON.stringify({ error: 'type and adminId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, notification: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
