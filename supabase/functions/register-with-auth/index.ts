import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const {
      name, pic_name, pic_phone, email, password, address,
      membership_tier, membership_price, subscription_status, status,
      admin_id, payment_proof_path,
    } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!authUser.user) {
      return new Response(JSON.stringify({ error: 'Failed to create user' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      return new Response(JSON.stringify({ error: 'Failed to create company: ' + companyError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      company,
      user: { id: authUser.user.id, email: authUser.user.email },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('register-with-auth error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
