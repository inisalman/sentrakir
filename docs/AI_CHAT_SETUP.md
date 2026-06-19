# AI Support Chat Integration Guide

## Overview
Fitur chat support yang memungkinkan client bertanya kepada AI assistant. Jika AI tidak bisa handle, admin bisa override dengan jawaban manual.

## Architecture

```
┌─────────────────────────┐
│   Client Dashboard      │
│   (ChatWidget)          │
└────────────┬────────────┘
             │
             ▼
     ┌──────────────────┐
     │  Frontend Logic  │
     │  (aiChat.js)     │
     └────────┬─────────┘
              │
       ┌──────┴──────────┐
       ▼                 ▼
   ┌────────┐      ┌──────────────┐
   │ FAQ DB │      │ Hugging Face │
   │ (Fast) │      │ (AI Response)│
   └────────┘      └──────┬───────┘
       │                   │
       └───────┬───────────┘
               ▼
       ┌──────────────┐
       │  Supabase    │
       │  DB Storage  │
       └──────┬───────┘
              │
              ▼
       ┌──────────────────┐
       │ Admin Dashboard  │
       │ (AdminChatPanel) │
       └──────────────────┘
```

## Setup Steps

### 1. Get Hugging Face API Token

1. Go to https://huggingface.co/settings/tokens
2. Create new token (read permission is enough)
3. Copy token

### 2. Configure Environment Variables

Add to `.env` file:
```
VITE_HUGGINGFACE_TOKEN=your_token_here
VITE_CHAT_ENABLED=true
VITE_CHAT_AUTO_CLEANUP_DAYS=30
```

### 3. Run Supabase Migration

Execute SQL dalam `migrations/003_create_chat_messages.sql` di Supabase:
1. Go to Supabase Dashboard
2. SQL Editor
3. Copy-paste content dari migration file
4. Run

### 4. Import Components

Di `ClientDashboard.jsx`:
```javascript
import ChatWidget from '../../components/Chat/ChatWidget';
```

Di `AdminDashboard.jsx`:
```javascript
import AdminChatPanel from '../../components/Chat/AdminChatPanel';
```

## How It Works

### Client Side

1. **ChatWidget** appears di bottom-right dashboard
2. Client ketik pertanyaan
3. Message di-send ke backend
4. System check:
   - **FAQ match?** → Instant response (no API call)
   - **No match?** → Call Hugging Face API
5. Response disimpan ke Supabase
6. Client lihat jawaban

### AI Response Process

**Priority:**
1. FAQ Database (instant, 100% accurate untuk common questions)
2. Hugging Face Mistral 7B (fallback untuk complex questions)

**Confidence Levels:**
- High: FAQ match
- Medium: AI response
- Low: Error (admin override needed)

### Admin Override

Admin bisa:
1. View all unresolved chats
2. Read original question + AI response
3. Write better/more accurate response
4. Mark as resolved

Unresolved chats trigger notification ke admin.

## File Structure

```
src/
├── components/Chat/
│   ├── ChatWidget.jsx           # Client chat UI
│   └── AdminChatPanel.jsx       # Admin management interface
├── utils/
│   ├── faqDatabase.js           # FAQ template + search logic
│   ├── aiChat.js                # AI integration + processing
│   └── supabaseChat.js          # Database operations
└── ...

migrations/
└── 003_create_chat_messages.sql # Database schema
```

## API Usage & Costs

### Hugging Face Free Tier
- **Limit:** ~100-200 API calls per day (depends on model load)
- **Cost:** Free
- **Latency:** 2-10 seconds per request

### Fallback Strategy
Jika HF rate-limited:
1. Queue chat di Supabase (is_resolved = false)
2. Admin override manual
3. Or wait 24h untuk reset limit

## FAQ Database

Located in `faqDatabase.js`:
- **30+ pre-built FAQ** covering pricing, services, requirements, account, billing, technical
- **Search function** dengan keyword matching
- **Priority scoring** untuk relevant results

### Add New FAQ

Edit `faqDatabase.js`:
```javascript
export const FAQ_DATABASE = {
  category_name: [
    {
      id: 'unique_id',
      category: 'Category Name',
      question: 'Your question?',
      keywords: ['keyword1', 'keyword2'],
      answer: 'Your answer here',
      priority: 10  // 1-10, higher = more important
    },
    // ... more FAQs
  ]
}
```

Then run `searchFAQ()` test untuk verify.

## Monitoring & Maintenance

### Daily Tasks
- Check `AdminChatPanel` untuk unresolved chats
- Override jika diperlukan
- Monitor response quality

### Weekly Tasks
- Review common questions
- Update FAQ jika ada pattern
- Check Hugging Face rate limits

### Monthly Tasks
- Analyze chat trends
- Update system prompt di `aiChat.js` jika needed
- Archive resolved chats (auto-delete after 30 days)

## System Prompt

Location: `src/utils/aiChat.js` (SYSTEM_PROMPT variable)

Current prompt optimize untuk:
- Support general questions
- Indonesian language
- Accurate info about services
- Professional yet friendly tone
- Flag questions outside scope untuk admin override

Customize sesuai business needs.

## Troubleshooting

### Issue: "API token not configured"
**Solution:** Add `VITE_HUGGINGFACE_TOKEN` ke `.env` file

### Issue: Rate limit (429 error)
**Solution:** 
- Wait 24 hours untuk reset
- Or admin manually respond via AdminChatPanel

### Issue: Slow responses (>10 seconds)
**Solution:**
- Normal di free tier Hugging Face
- Consider upgrade jika frequently slow

### Issue: AI response tidak akurat
**Solution:**
- Admin override via AdminChatPanel
- Review system prompt
- Add more FAQ untuk that topic

## Future Improvements

1. **Model Upgrade** → Switch to larger model (Mixtral 8x7B) jika budget available
2. **Analytics Dashboard** → Track chat metrics, resolution time, common issues
3. **Context Awareness** → Include customer history dalam AI context
4. **Multi-language** → Support English, Mandarin, etc.
5. **Voice Chat** → Add voice input/output capability
6. **Sentiment Analysis** → Auto-escalate to admin jika frustrated client

## Support

For questions/issues:
- Check FAQ database first
- Review admin chat logs
- Contact development team

---

**Last Updated:** June 2026
**Status:** ✅ Production Ready
