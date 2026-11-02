/*
# Site analytics, poll responses, and admin session tables

1. New Tables
- `visitors`: one row per anonymous visitor ID (generated in the visitor's browser and stored in localStorage). Holds first and last seen times only.
- `visitor_sessions`: one row per browser tab session. Stores start time, last activity (heartbeat), approximate end time, and coarse device info (category, OS, browser, screen size). No IP addresses or hardware identifiers.
- `site_visits`: one row per page load of the homepage, used for total visits.
- `poll_responses`: append-only history of confirmed poll choices. A change is a new row, never an overwrite. Stores the previous choice, selection time, confirmation time, and a device snapshot.
- `poll_events`: timeline of poll activity (viewed, option selected, confirmation submitted, response changed).
- `important_events`: timeline of the Important section (opened, password success or failure, personal page viewed, poll viewed, poll submitted). The password itself is never stored.
- `admin_sessions`: hashed admin session tokens with expiry. The raw token is never stored.
- `admin_login_attempts`: timestamps of admin login attempts, used to slow down password guessing.

2. Security
- RLS is enabled on every table and no policies are created, so anonymous and signed-in browser clients can read or write nothing.
- No grants to anon or authenticated. Only the server role (used by the tracking and admin edge functions) receives privileges.
- Writes from visitors go through the `track` edge function, which validates input before inserting.
- Admin reads go through the `admin` edge function, which requires a valid, unexpired admin session token.

3. Indexes
- Indexes on the columns used for filtering, sorting, and visitor lookups (visitor ID, timestamps, event types).

4. Important Notes
- Foreign keys cascade from visitors to their sessions and visits so deleting a visitor removes their tracking rows.
- Timestamps use timestamptz with default now().
*/

CREATE TABLE IF NOT EXISTS public.visitors (
  anon_id uuid PRIMARY KEY,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.visitor_sessions (
  id uuid PRIMARY KEY,
  anon_id uuid NOT NULL REFERENCES public.visitors(anon_id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  device_category text NOT NULL DEFAULT 'unknown' CHECK (device_category IN ('mobile', 'tablet', 'desktop', 'unknown')),
  os text NOT NULL DEFAULT 'Unknown' CHECK (char_length(os) <= 40),
  browser text NOT NULL DEFAULT 'Unknown' CHECK (char_length(browser) <= 40),
  screen_width integer CHECK (screen_width IS NULL OR screen_width BETWEEN 0 AND 20000),
  screen_height integer CHECK (screen_height IS NULL OR screen_height BETWEEN 0 AND 20000)
);

CREATE TABLE IF NOT EXISTS public.site_visits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  anon_id uuid NOT NULL REFERENCES public.visitors(anon_id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.poll_responses (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  anon_id uuid NOT NULL REFERENCES public.visitors(anon_id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
  option text NOT NULL CHECK (option IN ('keep', 'let_go')),
  previous_option text CHECK (previous_option IS NULL OR previous_option IN ('keep', 'let_go')),
  is_change boolean NOT NULL DEFAULT false,
  selected_at timestamptz,
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  device_category text NOT NULL DEFAULT 'unknown',
  os text NOT NULL DEFAULT 'Unknown',
  browser text NOT NULL DEFAULT 'Unknown',
  screen_width integer,
  screen_height integer
);

CREATE TABLE IF NOT EXISTS public.poll_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  anon_id uuid NOT NULL REFERENCES public.visitors(anon_id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('viewed', 'option_selected', 'confirmation_submitted', 'response_changed')),
  option text CHECK (option IS NULL OR option IN ('keep', 'let_go')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.important_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  anon_id uuid NOT NULL REFERENCES public.visitors(anon_id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('opened', 'password_success', 'password_failure', 'personal_viewed', 'poll_viewed', 'poll_submitted')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  token_hash text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  succeeded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visitor_sessions_anon_id_idx ON public.visitor_sessions (anon_id);
CREATE INDEX IF NOT EXISTS visitor_sessions_last_active_idx ON public.visitor_sessions (last_active_at DESC);
CREATE INDEX IF NOT EXISTS site_visits_created_idx ON public.site_visits (created_at DESC);
CREATE INDEX IF NOT EXISTS site_visits_anon_id_idx ON public.site_visits (anon_id);
CREATE INDEX IF NOT EXISTS site_visits_session_id_idx ON public.site_visits (session_id);
CREATE INDEX IF NOT EXISTS poll_responses_anon_confirmed_idx ON public.poll_responses (anon_id, confirmed_at DESC);
CREATE INDEX IF NOT EXISTS poll_responses_confirmed_idx ON public.poll_responses (confirmed_at DESC);
CREATE INDEX IF NOT EXISTS poll_responses_session_id_idx ON public.poll_responses (session_id);
CREATE INDEX IF NOT EXISTS poll_events_anon_created_idx ON public.poll_events (anon_id, created_at DESC);
CREATE INDEX IF NOT EXISTS poll_events_created_idx ON public.poll_events (created_at DESC);
CREATE INDEX IF NOT EXISTS important_events_type_created_idx ON public.important_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS important_events_anon_id_idx ON public.important_events (anon_id);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx ON public.admin_sessions (expires_at);
CREATE INDEX IF NOT EXISTS admin_login_attempts_created_idx ON public.admin_login_attempts (created_at DESC);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.important_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.visitors, public.visitor_sessions, public.site_visits, public.poll_responses, public.poll_events, public.important_events, public.admin_sessions, public.admin_login_attempts FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitors, public.visitor_sessions, public.site_visits, public.poll_responses, public.poll_events, public.important_events, public.admin_sessions, public.admin_login_attempts TO service_role;
