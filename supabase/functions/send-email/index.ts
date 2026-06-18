import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@^2";
import nodemailer from "npm:nodemailer@^6.9.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Environment variables
const SMTP_HOST = Deno.env.get("SMTP_HOST") || "smtp.gmail.com";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "587");
const SMTP_SECURE = Deno.env.get("SMTP_SECURE") === "true";
const SMTP_USER = Deno.env.get("SMTP_USER") || "";
const SMTP_PASS = Deno.env.get("SMTP_PASS") || "";
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:5173";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create Supabase client with service role key
function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// Generate a secure reset token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Create Nodemailer transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

// HTML template for password reset email
function getResetEmailHtml(token: string, companyName: string): string {
  const resetUrl = `${APP_URL}/fleet/reset-password?token=${token}`;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { text-align: center; margin-bottom: 28px; }
    .logo { font-size: 24px; font-weight: bold; color: #1C3967; }
    .title { font-size: 20px; color: #1C3967; margin: 0 0 8px 0; }
    .subtitle { color: #64748b; font-size: 14px; margin: 0; }
    .content { color: #334155; font-size: 15px; line-height: 1.6; }
    .content p { margin: 0 0 16px 0; }
    .btn { display: inline-block; background: #1C3967; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; margin: 16px 0; }
    .btn:hover { background: #162f57; }
    .warning { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400e; margin-top: 16px; }
    .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🚗 Sentra Fleet</div>
    </div>
    <div class="content">
      <h2 class="title">Reset Password</h2>
      <p class="subtitle">Permintaan Ubah Password Akun</p>
      <p>Halo <strong>${companyName || "Pengguna"}</strong>,</p>
      <p>Kami menerima permintaan untuk mengubah password akun Sentra Fleet Anda. Klik tombol di bawah ini untuk mereset password:</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </p>
      <p>atau salin link ini ke browser Anda:</p>
      <p style="word-break: break-all; color: #2563eb; font-size: 13px;">${resetUrl}</p>
      <div class="warning">
        ⚠️ Link ini berlaku selama <strong>1 jam</strong>. Jika Anda tidak merasa meminta reset password, abaikan email ini.
      </div>
    </div>
    <div class="footer">
      Sentra Fleet — B2B Compliance Portal<br>
      Email ini dikirim otomatis, jangan dibalas.
    </div>
  </div>
</body>
</html>`;
}

// HTML template for registration confirmation email
function getRegisterConfirmEmailHtml(token: string, companyName: string, adminName: string): string {
  const confirmUrl = `${APP_URL}/fleet/confirm-register?token=${token}`;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { text-align: center; margin-bottom: 28px; }
    .logo { font-size: 24px; font-weight: bold; color: #1C3967; }
    .title { font-size: 20px; color: #1C3967; margin: 0 0 8px 0; }
    .subtitle { color: #64748b; font-size: 14px; margin: 0; }
    .content { color: #334155; font-size: 15px; line-height: 1.6; }
    .content p { margin: 0 0 16px 0; }
    .success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; font-size: 14px; color: #15803d; margin: 16px 0; }
    .btn { display: inline-block; background: #1C3967; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; margin: 16px 0; }
    .btn:hover { background: #162f57; }
    .warning { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400e; margin-top: 16px; }
    .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🚗 Sentra Fleet</div>
    </div>
    <div class="content">
      <h2 class="title">Konfirmasi Pendaftaran</h2>
      <p class="subtitle">Verifikasi Akun Baru</p>
      <p>Halo,</p>
      <p>Terima kasih telah mendaftar di <strong>Sentra Fleet</strong> untuk perusahaan <strong>${companyName}</strong>.</p>
      <div class="success">
        ✅ Akun Anda hampir aktif! Klik tombol di bawah untuk mengkonfirmasi alamat email dan mengaktifkan akun.
      </div>
      <p style="text-align: center;">
        <a href="${confirmUrl}" class="btn">Konfirmasi Email Saya</a>
      </p>
      <p>atau salin link ini ke browser Anda:</p>
      <p style="word-break: break-all; color: #2563eb; font-size: 13px;">${confirmUrl}</p>
      <div class="warning">
        ⚠️ Link ini berlaku selama <strong>24 jam</strong>. Setelah dikonfirmasi, akun Anda akan langsung aktif dan bisa digunakan login.
      </div>
    </div>
    <div class="footer">
      Sentra Fleet — B2B Compliance Portal<br>
      Email ini dikirim otomatis, jangan dibalas.
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, email, companyName, companyId } = await req.json();

    if (!email || !type) {
      return new Response(JSON.stringify({ error: "Email and type are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!SMTP_USER || !SMTP_PASS) {
      return new Response(JSON.stringify({ error: "SMTP not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getSupabase();

    // Cek apakah email punya password (untuk reset password)
    if (type === "reset") {
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id, password, email")
        .ilike("email", email)
        .single();

      if (companyError || !company) {
        return new Response(JSON.stringify({ error: "Email tidak ditemukan di sistem kami." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!company.password || company.password.trim() === "") {
        return new Response(JSON.stringify({
          error: "Akun ini terdaftar menggunakan Google Sign-In. Silakan login dengan tombol \"Masuk dengan Google\" untuk mengakses akun Anda."
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const token = generateToken();

    // Determine token expiry and DB entry
    let expiresAt: Date;
    let dbType: string;
    if (type === "register") {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      dbType = "register";
    } else {
      expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      dbType = "reset";
    }

    // Insert token into DB
    const { error: dbError } = await supabase
      .from("password_resets")
      .insert({
        email,
        token,
        type: dbType,
        company_id: companyId || null,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to create reset token" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email
    const transporter = createTransporter();

    let subject: string;
    let html: string;

    if (type === "register") {
      subject = "✅ Konfirmasi Pendaftaran Sentra Fleet — " + (companyName || email);
      html = getRegisterConfirmEmailHtml(token, companyName || email, "Admin");
    } else {
      subject = "🔐 Reset Password — Sentra Fleet";
      html = getResetEmailHtml(token, companyName || email);
    }

    await transporter.sendMail({
      from: `"Sentra Fleet" <${SMTP_USER}>`,
      to: email,
      subject,
      html,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
