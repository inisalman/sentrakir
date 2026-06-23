import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Environment variables must be set in Supabase Dashboard > Functions > Settings
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SERVICE_ROLE_KEY') ?? '';

// Validate env vars on cold start
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[register-with-auth] FATAL: SUPABASE_URL or SERVICE_ROLE_KEY not set in environment');
  // We throw here so the function fails fast and visibly
  throw new Error('FATAL: Missing SUPABASE_URL or SERVICE_ROLE_KEY environment variables.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ALLOWED_ORIGINS = [
  'https://sentrakir.com',
  'https://sentrakir.web.id',
  'https://www.sentrakir.web.id',
  'https://sentrakirsim.web.id',
  'https://www.sentrakirsim.web.id',
  'http://localhost:5173',
  'http://localhost',
  'capacitor://localhost',
];

// Security: Server-side tier validation (prevent client-side manipulation)
const VALID_TIERS = ['free', 'starter', 'business', 'enterprise'] as const;
const TIER_PRICING: Record<string, number> = {
  free: 0,
  starter: 399000,
  business: 499000,
  enterprise: 0, // custom pricing handled by admin
};

// Security: Determine subscription_status server-side based on tier
function getSubscriptionStatus(tier: string): string {
  if (tier === 'free') return 'active';
  return `pending_payment:${tier}`; // paid tiers always start as pending
}

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

    // Security: Validate membership_tier (prevent client-side manipulation)
    // Frontend sends the actual chosen tier (e.g. 'starter'), we handle the logic here
    const validatedTier = VALID_TIERS.includes(membership_tier as any) ? membership_tier : 'free';
    const validatedPrice = TIER_PRICING[validatedTier] ?? 0;
    const validatedSubscriptionStatus = getSubscriptionStatus(validatedTier);

    // If it's a paid tier, we actually insert them as 'free' first, but set subscription status to pending
    const initialTier = validatedTier === 'free' ? 'free' : 'free'; // They always start as free until approved

    // Security: Validate admin_id exists in database
    if (admin_id) {
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id')
        .eq('id', admin_id)
        .single();

      if (adminError || !adminData) {
        return new Response(JSON.stringify({ error: 'Administrator tidak valid' }), {
          status: 400,
          headers: { ...h, 'Content-Type': 'application/json' },
        });
      }
    }

    // 1. Create auth user (password stays server-side)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // activate immediately, no email confirmation needed
      user_metadata: { company_name: name },
    });

    if (authError) {
      console.error('[register-with-auth] Auth create user error:', authError);
      // Return specific error message instead of generic "Authentication failed"
      return new Response(JSON.stringify({ error: authError.message }), {
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
    const companyPayload = {
      name: name || '',
      pic_name: pic_name || '',
      pic_phone: pic_phone || '',
      email: email.toLowerCase(),
      password: '', // cleared — now in auth.users
      address: address || '',
      membership_tier: initialTier,
      membership_price: validatedPrice,
      subscription_status: validatedSubscriptionStatus,
      status: 'active',
      admin_id: admin_id || null,
      payment_proof_path: payment_proof_path || null,
      auth_user_id: authUser.user.id,
    };

    let { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([companyPayload])
      .select()
      .single();

    // Fallback: If there's an automatic DB trigger that already created the row on auth.users insert,
    // the insert will fail with a unique constraint error (23505). We then UPDATE the existing row.
    if (companyError && companyError.code === '23505') {
      const updateRes = await supabase
        .from('companies')
        .update(companyPayload)
        .eq('email', email.toLowerCase())
        .select()
        .single();

      company = updateRes.data;
      companyError = updateRes.error;
    }

    if (companyError) {
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);

      return new Response(JSON.stringify({ error: `Gagal mendaftar: ${companyError.message}` }), {
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
