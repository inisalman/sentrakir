import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const {
      name, pic_name, pic_phone, email, password, address,
      membership_tier, membership_price, subscription_status, status,
      admin_id, payment_proof_path,
    } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    if (!email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Email tidak valid' }), {
        status: 400,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password minimal 8 karakter' }), {
        status: 400,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    // 1. Create auth user (password stays server-side)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // require email confirmation
      user_metadata: { company_name: name },
    });

    if (authError) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 400,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    if (!authUser.user) {
      return new Response(JSON.stringify({ error: 'Failed to create user' }), {
        status: 500,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    // 2. Insert company linked to auth user
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([{
        name: name || '',
        pic_name: pic_name || '',
        pic_phone: pic_phone || '',
        email: email.toLowerCase(),
        password: '', // cleared — now in auth.users
        address: address || '',
        membership_tier: membership_tier || 'free',
        membership_price: membership_price || 0,
        subscription_status: subscription_status || 'active',
        status: status || 'active',
        admin_id: admin_id || null,
        payment_proof_path: payment_proof_path || null,
        auth_user_id: authUser.user.id,
      }])
      .select()
      .single();

    if (companyError) {
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return new Response(JSON.stringify({ error: 'Failed to create company' }), {
        status: 500,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      company,
      user: { id: authUser.user.id, email: authUser.user.email },
    }), {
      headers: { ...h, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('register-with-auth error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...h, 'Content-Type': 'application/json' },
    });
  }
});
