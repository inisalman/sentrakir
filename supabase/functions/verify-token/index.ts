import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@^2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { token, newPassword } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: "Token diperlukan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getSupabase();

    // 1. Lookup token
    const { data: resetRecord, error: lookupError } = await supabase
      .from("password_resets")
      .select("*")
      .eq("token", token)
      .single();

    if (lookupError || !resetRecord) {
      return new Response(JSON.stringify({ error: "Token tidak valid atau sudah tidak berlaku" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Check expiry
    if (new Date(resetRecord.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Link sudah kadaluwarsa. Silakan minta reset password lagi." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Check if already used
    if (resetRecord.used_at) {
      return new Response(JSON.stringify({ error: "Link ini sudah pernah digunakan." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Handle based on type
    if (resetRecord.type === "register") {
      // Konfirmasi registrasi: activate the company
      const { error: updateError } = await supabase
        .from("companies")
        .update({ status: "active" })
        .eq("id", resetRecord.company_id)
        .eq("email", resetRecord.email);

      if (updateError) {
        return new Response(JSON.stringify({ error: "Gagal mengaktifkan akun. Hubungi admin." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark token as used
      await supabase
        .from("password_resets")
        .update({ used_at: new Date().toISOString() })
        .eq("id", resetRecord.id);

      return new Response(JSON.stringify({
        success: true,
        message: "Email berhasil dikonfirmasi! Akun Anda sekarang aktif. Silakan login."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (resetRecord.type === "reset") {
      // Password reset
      if (!newPassword) {
        return new Response(JSON.stringify({ needsPassword: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validate password strength
      if (newPassword.length < 8) {
        return new Response(JSON.stringify({ error: "Password minimal 8 karakter." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update password in companies table
      const { error: updateError } = await supabase
        .from("companies")
        .update({ password: newPassword })
        .eq("email", resetRecord.email);

      if (updateError) {
        return new Response(JSON.stringify({ error: "Gagal mengubah password. Silakan coba lagi." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark token as used
      await supabase
        .from("password_resets")
        .update({ used_at: new Date().toISOString() })
        .eq("id", resetRecord.id);

      return new Response(JSON.stringify({
        success: true,
        message: "Password berhasil diubah! Silakan login dengan password baru Anda."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Tipe token tidak dikenal" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("verify-token error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
