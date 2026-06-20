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

// One-time migration: create auth.users entry for companies with email+password,
// then link auth_user_id. Idempotent — skips companies that already have auth_user_id.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const h = getCorsHeaders(req);
    // 1. Fetch all companies that have a password and no auth_user_id
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('id, email, password, name')
      .not('password', 'is', null)
      .is('auth_user_id', null);

    if (fetchError) {
      console.error('Error fetching companies:', fetchError.message);
      return new Response(JSON.stringify({ error: 'Failed to fetch companies' }), {
        status: 500,
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    if (!companies || companies.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No companies need migration.',
        migrated: 0,
      }), {
        headers: { ...h, 'Content-Type': 'application/json' },
      });
    }

    let migrated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const company of companies) {
      if (!company.email || !company.password) {
        skipped++;
        continue;
      }

      // Check if user already exists in auth.users
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', company.email)
        .limit(1);

      // Use Admin API to create user (bypasses email confirmation for migration)
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: company.email,
        password: company.password,
        email_confirm: true,
        user_metadata: { company_id: company.id, company_name: company.name },
      });

      if (createError) {
        // User might already exist (e.g., Google OAuth user with same email)
        if (createError.message.includes('already been registered')) {
          // Try to find existing user by email
          const { data: authUsers } = await supabase.auth.admin.listUsers();
          const existingAuthUser = authUsers?.users.find(
            u => u.email?.toLowerCase() === company.email.toLowerCase()
          );
          if (existingAuthUser) {
            // Link existing auth user to company
            const { error: linkError } = await supabase
              .from('companies')
              .update({ auth_user_id: existingAuthUser.id })
              .eq('id', company.id);
            if (linkError) {
              errors.push(`Link error for ${company.email}: ${linkError.message}`);
            } else {
              migrated++;
            }
          } else {
            errors.push(`Create error for ${company.email}: ${createError.message}`);
          }
        } else {
          errors.push(`Create error for ${company.email}: ${createError.message}`);
        }
        continue;
      }

      if (newUser.user) {
        // Update company with auth_user_id
        const { error: updateError } = await supabase
          .from('companies')
          .update({ auth_user_id: newUser.user.id })
          .eq('id', company.id);

        if (updateError) {
          errors.push(`Link error for ${company.email}: ${updateError.message}`);
        } else {
          migrated++;
        }
      }
    }

    console.log(`Migration complete: ${migrated} migrated, ${skipped} skipped, ${errors.length} errors`);

    return new Response(JSON.stringify({
      success: true,
      migrated,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...h, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Migration fatal error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...h, 'Content-Type': 'application/json' },
    });
  }
});
