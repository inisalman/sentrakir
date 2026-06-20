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
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const h = getCorsHeaders(req);
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email dan password wajib diisi' }), {
        status: 400,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    // Cek apakah admin ada dan punya is_super = true
    const { data: admin, error: fetchError } = await supabase
      .from('admins')
      .select('*')
      .ilike('email', email.trim())
      .single();

    if (fetchError || !admin) {
      return new Response(JSON.stringify({ error: 'Admin tidak ditemukan' }), {
        status: 401,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    if (!admin.is_super) {
      return new Response(JSON.stringify({ error: 'Akses Super Admin ditolak' }), {
        status: 403,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    // Verifikasi password via RPC
    const { data: valid, error: rpcError } = await supabase.rpc('check_admin_password', {
      p_email: email.trim(),
      p_password: password,
    });

    if (rpcError || !valid) {
      return new Response(JSON.stringify({ error: 'Kredensial tidak valid' }), {
        status: 401,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      admin: { id: admin.id, name: admin.name, email: admin.email, is_super: true },
    }), {
      headers: { ...h, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...h, 'Content-Type': 'application/json' },
    });
  }
});
