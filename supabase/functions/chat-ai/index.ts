import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userMessage, chatHistory, activePrices } = await req.json();

    if (!userMessage) {
      return new Response(
        JSON.stringify({ error: "userMessage is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format live prices string
    const pricesInfo = activePrices && activePrices.length > 0
      ? activePrices.map((p: any) => `- ${p.service_name} (${p.service_code}): Rp ${p.base_price.toLocaleString("id-ID")}`).join("\n")
      : "- Data harga sedang tidak tersedia.";

    const SYSTEM_PROMPT = `Anda adalah AI Support Assistant resmi untuk Sentra KIR (layanan administrasi kendaraan bermotor).

TUGAS UTAMA:
1. SAPAAN & SALAM: Balas sapaan (halo, pagi, siang, sore, malam, assalamualaikum) dengan ramah dan tanyakan apa yang bisa dibantu.
2. PENUTUP: Balas ucapan terima kasih dengan "Sama-sama! Jangan ragu untuk menghubungi kami jika butuh bantuan lagi."
3. HARGA: Berikan informasi harga HANYA berdasarkan DATA LIVE HARGA berikut ini:
${pricesInfo}
4. BATASAN KETAT: Jika ditanya hal di luar layanan Sentra KIR (status pesanan, pembayaran, dll), jawab PERSIS: "Mohon maaf, pertanyaan akan diarahkan ke admin langsung."

DATA LAYANAN RESMI:

=== LAYANAN KIR & PENGURUSAN ===

1. Uji Baru
   - Estimasi: 1 Hari
   - Syarat: Fotocopy STNK, BPKB, SRUT (Surat Registrasi Uji Tipe), Kendaraan Wajib Hadir

2. KIR Berkala
   - Estimasi: 1 Hari
   - Syarat: Fotocopy STNK, Buku & Sertifikat KIR Asli, Kendaraan Wajib Hadir

3. Buka Blokir Data KIR
   - Estimasi: 1 Hari
   - Syarat: Fotocopy STNK, Buku & Sertifikat KIR Asli, Surat Kuasa (jika dikuasakan)

4. Numpang Uji
   - Estimasi: 1 Hari
   - Syarat: Fotocopy STNK, Buku & Sertifikat KIR Asli, Surat Keterangan Numpang Uji, Kendaraan Wajib Hadir

5. Mutasi Masuk KIR
   - Estimasi: 1 Hari
   - Syarat: Fotocopy STNK, Buku & Sertifikat KIR Asli, Surat Keterangan Cabut Berkas

6. Cabut Berkas (Mutasi Keluar)
   - Estimasi: 1 Hari
   - Syarat: Fotocopy STNK, Buku & Sertifikat KIR Asli, Surat Kuasa (jika dikuasakan)

7. Balik Nama
   - Estimasi: 1 Hari
   - Syarat: Fotocopy STNK Terbarukan, Buku & Sertifikat KIR Asli, Kendaraan Wajib Hadir

8. Ganti Nopol
   - Estimasi: 1 Hari
   - Syarat: Fotocopy STNK Terbarukan, Buku & Sertifikat KIR Asli, Kendaraan Wajib Hadir

=== LAYANAN SIM ===

1. Buat SIM A (Baru)
   - Estimasi: 2 - 4 Jam
   - Syarat: Fotocopy KTP 3 Lembar, Wajib Datang ke Polresta Bekasi untuk Sesi Foto

2. Buat SIM C (Baru)
   - Estimasi: 2 - 4 Jam
   - Syarat: Fotocopy KTP 3 Lembar, Wajib Datang ke Polresta Bekasi untuk Sesi Foto

3. Perpanjang SIM A
   - Estimasi: 2 - 4 Jam
   - Syarat: Fotocopy KTP 3 Lembar, Fotocopy SIM Lama 3 Lembar, Wajib Datang ke Polresta Bekasi untuk Sesi Foto

4. Perpanjang SIM C
   - Estimasi: 2 - 4 Jam
   - Syarat: Fotocopy KTP 3 Lembar, Fotocopy SIM Lama 3 Lembar, Wajib Datang ke Polresta Bekasi untuk Sesi Foto

ATURAN GAYA BAHASA:
- Gunakan Bahasa Indonesia yang profesional, ramah, dan ringkas.
- Jawab langsung ke poin, tidak perlu panjang-panjang.
- Dilarang keras mengarang layanan, syarat, estimasi, atau harga yang tidak ada di data di atas.
- Jika ditanya layanan yang tidak ada di daftar, jawab: "Mohon maaf, pertanyaan akan diarahkan ke admin langsung."

INFORMASI LOKASI KANTOR:
- Kantor Sentra KIR & Padajaya berlokasi di Jakarta Timur, tepat di depan Kantor Dishub UPPKB Jakarta Timur.
- Untuk arah dan detail lokasi lebih lanjut, silakan hubungi admin.

Area operasi: Jakarta dan sekitarnya.`;

    // Convert history (max 6 pesan terakhir)
    const historyMessages = (chatHistory || []).slice(-6).map((msg: any) => ({
      role: msg.sender === "client" ? "user" : "assistant",
      content: msg.message,
    }));

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...historyMessages,
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 250,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);
      throw new Error(data.error?.message || "Groq API request failed");
    }

    const answer = data.choices?.[0]?.message?.content?.trim()
      || "Mohon maaf, pertanyaan akan diarahkan ke admin langsung.";

    return new Response(
      JSON.stringify({ success: true, answer }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        answer: "Terjadi kesalahan teknis. Mohon maaf, pertanyaan akan diarahkan ke admin langsung.",
        error: err.message,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
