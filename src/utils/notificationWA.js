import { supabase } from './supabaseClient';

// Kirim notifikasi WA via Edge Function (server-side, API key tidak di browser)
const invokeWANotification = async (type, params = {}) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-wa-notif', {
      body: { type, ...params },
    });
    if (error) {
      console.warn('WA notification failed:', error.message);
      return false;
    }
    return data?.success ?? false;
  } catch (err) {
    console.error('Unexpected error sending WA:', err);
    return false;
  }
};

// -------------------------------------------------------
// TEMPLATE NOTIFIKASI (via Edge Function)
// -------------------------------------------------------

// Notif ke CLIENT: pendaftaran berhasil (free)
export const notifClientDaftarFree = (picPhone, companyName) =>
  invokeWANotification('client_daftar_free', { picPhone, companyName });

// Notif ke CLIENT: pendaftaran paid, menunggu konfirmasi
export const notifClientDaftarPaid = (picPhone, companyName, tier, adminChoice) =>
  invokeWANotification('client_daftar_paid', { picPhone, companyName, tier, adminChoice });

// Notif ke ADMIN: ada pendaftaran berbayar baru
export const notifAdminPendaftaranBaru = (_adminPhone, _companyName, _tier, _picName) =>
  // Admin notif sekarang ditangani di Edge Function dari notifClientDaftarPaid
  Promise.resolve(true);

// Notif ke CLIENT: pembayaran dikonfirmasi
export const notifClientPembayaranDikonfirmasi = (picPhone, companyName, tier) =>
  invokeWANotification('client_payment_confirmed', { picPhone, companyName, tier });

// Notif ke CLIENT: pembayaran ditolak
export const notifClientPembayaranDitolak = (picPhone, companyName) =>
  invokeWANotification('client_payment_rejected', { picPhone, companyName });

// Notif ke CLIENT: upgrade dikonfirmasi
export const notifClientUpgradeDikonfirmasi = (picPhone, companyName, tier) =>
  invokeWANotification('client_upgrade_confirmed', { picPhone, companyName, tier });
