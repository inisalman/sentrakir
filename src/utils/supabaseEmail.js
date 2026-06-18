import { supabase } from "./supabaseClient";

// Kirim email via Edge Function (tidak langsung dari browser)
export const sendEmail = async ({ type, email, companyName, companyId }) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { type, email, companyName, companyId },
    });

    if (error) {
      console.error('[sendEmail] error:', error.message);
      return { error: "Gagal mengirim email. Silakan coba lagi." };
    }
    return data;
  } catch (err) {
    console.error("[sendEmail] network error:", err);
    return { error: "Gagal mengirim email. Silakan coba lagi." };
  }
};

// Verify token & optional reset password via Edge Function
export const verifyToken = async ({ token, newPassword }) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-token', {
      body: { token, newPassword },
    });

    if (error) {
      console.error('verifyToken error:', error.message);
      return { error: "Gagal memverifikasi. Silakan coba lagi." };
    }
    return data;
  } catch (err) {
    console.error("verifyToken error:", err);
    return { error: "Gagal memverifikasi. Silakan coba lagi." };
  }
};
