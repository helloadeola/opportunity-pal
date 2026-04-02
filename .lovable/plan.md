

## Plan: Google Calendar Integration for Follow Through

### Overview
When a user saves a lead with a follow-up date, the app will create a Google Calendar event on that date with a reminder at their chosen time. This requires OAuth, backend edge functions, and database storage for tokens.

### Prerequisites (user action required)
1. **Enable Lovable Cloud** — needed for database, auth, and edge functions
2. **Google Cloud Console setup** — user must create a project, enable the Google Calendar API, and create OAuth 2.0 credentials (client ID + client secret). These get stored as Lovable secrets.

### Architecture

```text
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Frontend   │────▶│  Edge Functions   │────▶│ Google API   │
│  (React)    │     │                   │     │ Calendar v3  │
└─────────────┘     └──────────────────┘     └──────────────┘
                           │
                    ┌──────┴──────┐
                    │  Supabase   │
                    │  DB: tokens │
                    └─────────────┘
```

### Changes

**1. Database: `google_calendar_tokens` table (migration)**
- Columns: `id`, `user_id`, `access_token`, `refresh_token`, `expires_at`, `created_at`
- RLS: users can only read/write their own row
- Requires Lovable Cloud auth to be enabled first

**2. Edge Function: `google-auth` — OAuth flow**
- `/google-auth?action=auth-url` → returns the Google OAuth consent URL
- `/google-auth?action=callback&code=...` → exchanges code for tokens, stores in DB
- `/google-auth?action=status` → checks if user has a valid token
- Secrets needed: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

**3. Edge Function: `google-calendar` — Create events**
- Accepts: lead name, notes, due date, reminder time
- Refreshes token if expired
- Creates event via Google Calendar API v3 (`POST /calendars/primary/events`)
- Event title: `"[Lead Name] - Follow up"`
- Description: lead notes/context
- Sets reminder at user's chosen time

**4. Frontend: Time picker for calendar reminder**
- Add a time picker (default 9 AM) to both `QuickNote.tsx` and `LeadForm.tsx`
- Only shows when Google Calendar is connected
- Stored alongside lead data

**5. Frontend: Google Calendar connection UI**
- Settings panel: "Connect Google Calendar" button with status indicator
- On first lead save without connection → prompt to connect
- OAuth popup flow → redirect back → confirm connection

**6. Frontend: Lead save flow update**
- After saving lead to local storage, call `google-calendar` edge function
- Show toast: "Calendar event created" or graceful fallback if not connected
- Store `calendarEventId` on the Lead for potential future updates

**7. Keep existing push notifications unchanged**
- `NotificationScheduler` continues working as-is
- Morning briefing at configured time stays independent of calendar events

### What the user needs to do
1. Enable Lovable Cloud (I'll prompt for this)
2. Enable authentication in Lovable Cloud
3. Create a Google Cloud project with Calendar API enabled
4. Create OAuth credentials and add `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` as secrets

### Technical notes
- Lead interface gets two new optional fields: `reminderTime` (number, 0-23) and `calendarEventId` (string)
- The calendar event creation is fire-and-forget — if it fails, the lead is still saved locally
- Token refresh is handled server-side in the edge function automatically

