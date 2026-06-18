import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FONNTE_TOKEN = Deno.env.get('FONNTE_TOKEN') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const sendWA = async (phone: string, message: string): Promise<boolean> => {
  if (!phone || !FONNTE_TOKEN) {
    console.log('Skip WA: no phone or token', { phone: !!phone, token: !!FONNTE_TOKEN });
    return false;
  }
  const normalized = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
  try {
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        target: normalized,
        message,
        countryCode: '62',
      }),
    });
    const data = await res.json();
    if (!data.status) {
      console.error('Fonnte error:', data.reason);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error sending WA:', err);
    return false;
  }
};

const normalizePhone = (phone: string): string => {
  return phone.startsWith('0') ? '62' + phone.slice(1) : phone;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, picPhone, adminPhone, companyName, tier, picName, adminChoice } = await req.json();

    if (!type || !picPhone) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ADMINS: Record<string, { name: string; phone: string }> = {
      sentra: { name: 'Sentra', phone: Deno.env.get('ADMIN_SENTRA_PHONE') ?? '' },
      padajaya: { name: 'Padajaya', phone: Deno.env.get('ADMIN_PADAJAYA_PHONE') ?? '' },
    };

    const adminData = adminChoice ? ADMINS[adminChoice] : null;

    switch (type) {
      case 'client_daftar_free': {
        const msg = `Halo! 👋 Pendaftaran *${companyName}* di *Sentra Fleet* berhasil.\n\nAkun Anda sudah aktif dengan paket *Starter*. Silakan login di https://sentrakir.com/fleet/login\n\n_Sentra Fleet - B2B Compliance Portal_`;
        const ok = await sendWA(picPhone, msg);
        return new Response(JSON.stringify({ success: ok }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'client_daftar_paid': {
        const msg = `Halo! 👋 Pendaftaran *${companyName}* di *Sentra Fleet* berhasil.\n\nBukti pembayaran paket *${tier}* Anda sedang dikonfirmasi admin. Akun sementara aktif dengan paket Starter.\n\nKonfirmasi dalam 1x24 jam kerja.\n\n_Sentra Fleet - B2B Compliance Portal_`;
        const ok = await sendWA(picPhone, msg);
        // Notif admin
        if (adminData?.phone) {
          const adminMsg = `📋 *Pendaftaran Baru - Sentra Fleet*\n\nPerusahaan: *${companyName}*\nPIC: ${picName}\nPaket: *${tier}*\n\nSilakan konfirmasi pembayaran di dashboard admin.\nhttps://sentrakir.com/fleet/admin/membership`;
          await sendWA(adminData.phone, adminMsg);
        }
        return new Response(JSON.stringify({ success: ok }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'client_payment_confirmed': {
        const msg = `✅ *Pembayaran Dikonfirmasi!*\n\nHalo *${companyName}*! Pembayaran paket *${tier}* Anda telah dikonfirmasi oleh admin.\n\nAkun Anda sudah diupgrade. Silakan login kembali.\n\n_Sentra Fleet - B2B Compliance Portal_`;
        const ok = await sendWA(picPhone, msg);
        return new Response(JSON.stringify({ success: ok }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'client_payment_rejected': {
        const msg = `❌ *Pembayaran Ditolak*\n\nHalo *${companyName}*, maaf pembayaran Anda tidak dapat dikonfirmasi.\n\nSilakan hubungi admin atau upload ulang bukti pembayaran.\n\n_Sentra Fleet - B2B Compliance Portal_`;
        const ok = await sendWA(picPhone, msg);
        return new Response(JSON.stringify({ success: ok }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'client_upgrade_confirmed': {
        const msg = `🎉 *Upgrade Berhasil!*\n\nHalo *${companyName}*! Paket Anda berhasil diupgrade ke *${tier}*.\n\nSelamat menikmati fitur premium Sentra Fleet!\n\n_Sentra Fleet - B2B Compliance Portal_`;
        const ok = await sendWA(picPhone, msg);
        return new Response(JSON.stringify({ success: ok }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown notification type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (err) {
    console.error('send-wa-notif error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
