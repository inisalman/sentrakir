import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ALLOWED_ORIGINS = [
  'https://sentrakir.com',
  'https://sentrakir.web.id',
  'https://www.sentrakir.web.id',
  'http://localhost:5173',
  'http://localhost',
  'capacitor://localhost',
];

// Security: Whitelist valid tiers and pricing (server-side source of truth)
const VALID_TIERS = ['free', 'starter', 'business', 'enterprise'] as const;
const TIER_PRICING: Record<string, number> = {
  'free': 0,
  'starter': 399000,
  'business': 499000,
  'enterprise': 0, // custom pricing
};

type TierKey = typeof VALID_TIERS[number];

function getSubscriptionStatus(tier: string): string {
  return tier === 'free' ? 'active' : `pending_payment:${tier}`;
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

    // Security: Authenticate user via JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized — login terlebih dahulu' }), {
        status: 401,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized — sesi tidak valid' }), {
        status: 401,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    const {
      name, pic_name, pic_phone, email, address,
      membership_tier, admin_id,
    } = await req.json();

    // Validate required fields
    if (!name || !pic_name || !pic_phone) {
      return new Response(JSON.stringify({ error: 'Nama perusahaan, nama PIC, dan nomor telepon wajib diisi.' }), {
        status: 400,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    // Security: Verify the email matches the authenticated Google user
    const emailToUse = authUser.email || email;
    if (authUser.email && email && authUser.email.toLowerCase() !== email.toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Email tidak cocok dengan akun Google yang login.' }), {
        status: 400,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    // Security: Validate membership_tier (prevent client-side manipulation)
    const validatedTier = VALID_TIERS.includes(membership_tier as any) ? membership_tier : 'free';
    const validatedPrice = TIER_PRICING[validatedTier] ?? 0;
    const validatedSubscriptionStatus = getSubscriptionStatus(validatedTier);

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

    // Security: Check if company already exists for this auth user
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (existingCompany) {
      return new Response(JSON.stringify({ error: 'Akun perusahaan sudah terdaftar.' }), {
        status: 409,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    // Security: Check if email is already used by another company
    const { data: existingEmail } = await supabase
      .from('companies')
      .select('id')
      .eq('email', emailToUse.toLowerCase())
      .maybeSingle();

    if (existingEmail) {
      return new Response(JSON.stringify({ error: 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.' }), {
        status: 409,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    // Insert or update company linked to authenticated user
    const companyPayload = {
      name: name || '',
      pic_name: pic_name || '',
      pic_phone: pic_phone || '',
      email: emailToUse.toLowerCase(),
      password: '',
      address: address || '',
      membership_tier: validatedTier,
      membership_price: validatedPrice,
      subscription_status: validatedSubscriptionStatus,
      status: 'active',
      admin_id: admin_id || null,
      payment_proof_path: null,
      auth_user_id: authUser.id,
    };

    let { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([companyPayload])
      .select()
      .single();

    if (companyError && companyError.code === '23505') {
      const updateRes = await supabase
        .from('companies')
        .update(companyPayload)
        .eq('email', emailToUse.toLowerCase())
        .select()
        .single();

      company = updateRes.data;
      companyError = updateRes.error;
    }

    if (companyError) {
      console.error('register-google-with-auth company error:', companyError);
      return new Response(JSON.stringify({ error: 'Gagal membuat akun perusahaan.' }), {
        status: 500,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      company,
      user: { id: authUser.id, email: authUser.email },
    }), {
      headers: { ...h, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('register-google-with-auth error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...h, 'Content-Type': 'application/json' },
    });
  }
});
