import { isFAQQuestion, getBestFAQMatch } from './faqDatabase';
import { getAllServicePrices } from './supabasePricing';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/chat-ai`;

// Call Edge Function (Groq key aman di backend)
export const getAIResponse = async (userMessage, chatHistory = [], activePrices = []) => {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ userMessage, chatHistory, activePrices }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Edge Function error:', data);
      throw new Error(data.error || 'Edge function request failed');
    }

    return {
      type: 'ai',
      answer: data.answer || 'Mohon maaf, pertanyaan akan diarahkan ke admin langsung.',
      confidence: 'high',
    };

  } catch (err) {
    console.error('Chat AI Error:', err);
    return {
      type: 'error',
      answer: 'Terjadi kesalahan teknis. Mohon maaf, pertanyaan akan diarahkan ke admin langsung.',
      error: err.message,
    };
  }
};

// Main function: process user message dan return response
export const processUserMessage = async (userMessage, chatHistory = []) => {
  // Step 1: Ambil data harga live dari database
  let activePrices = [];
  try {
    activePrices = await getAllServicePrices();
  } catch (e) {
    console.warn("Failed to fetch live prices for chat context", e);
  }

  // Step 2: Check apakah FAQ bisa handle
  if (isFAQQuestion(userMessage)) {
    const faqResponse = getBestFAQMatch(userMessage);
    if (faqResponse) {
      // Kalau soal harga, biar AI jawab supaya harganya live
      if (faqResponse.category === 'Pricing') {
        // Skip FAQ, let AI answer with live prices
      } else {
        return {
          success: true,
          source: 'faq',
          ...faqResponse,
        };
      }
    }
  }

  // Step 3: Gunakan AI via Edge Function (Groq di backend)
  const aiResponse = await getAIResponse(userMessage, chatHistory, activePrices);

  return {
    success: aiResponse.type !== 'error',
    source: 'ai',
    ...aiResponse,
  };
};
