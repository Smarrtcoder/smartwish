/*
# Aggregate helper functions for the admin dashboard

1. New Functions
- `admin_visit_counts()`: returns total page visits per anonymous visitor. Needed because the data API caps unbounded reads at 1000 rows.
- `admin_important_summary()`: returns counts for each Important section event and the number of unique visitors who opened the section.

2. Security
- Both functions are read-only, use the caller's privileges (not SECURITY DEFINER), and are executable only by the server role. EXECUTE is revoked from PUBLIC, anon, and authenticated.

3. Important Notes
- Results are computed on demand from the analytics tables, so no stored totals can drift.
*/

CREATE OR REPLACE FUNCTION public.admin_visit_counts()
RETURNS TABLE (anon_id uuid, visits bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT sv.anon_id, count(*)::bigint AS visits
  FROM public.site_visits sv
  GROUP BY sv.anon_id;
$$;

CREATE OR REPLACE FUNCTION public.admin_important_summary()
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'opened', (SELECT count(*) FROM public.important_events WHERE event_type = 'opened'),
    'unique_openers', (SELECT count(DISTINCT anon_id) FROM public.important_events WHERE event_type = 'opened'),
    'password_success', (SELECT count(*) FROM public.important_events WHERE event_type = 'password_success'),
    'password_failure', (SELECT count(*) FROM public.important_events WHERE event_type = 'password_failure'),
    'personal_viewed', (SELECT count(*) FROM public.important_events WHERE event_type = 'personal_viewed'),
    'poll_viewed', (SELECT count(*) FROM public.important_events WHERE event_type = 'poll_viewed'),
    'poll_submitted', (SELECT count(*) FROM public.important_events WHERE event_type = 'poll_submitted')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.admin_visit_counts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_visit_counts() TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_important_summary() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_important_summary() TO service_role;
