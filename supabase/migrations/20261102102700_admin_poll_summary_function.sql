/*
# Poll summary function for the admin dashboard

1. New Functions
- `admin_poll_summary()`: returns counts for the poll. Total confirmed responses, changes, unique responders, current Keep and Let It Go totals (each visitor counted once using their latest response), poll views, and option selections.

2. Security
- Callable only by the server role. EXECUTE is revoked from PUBLIC, anon, and authenticated.
- The function is read-only and uses the caller's privileges (not SECURITY DEFINER), so it cannot widen access.

3. Important Notes
- Counts are computed on demand. The table is small, so no materialized summary is needed.
*/

CREATE OR REPLACE FUNCTION public.admin_poll_summary()
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH latest AS (
    SELECT DISTINCT ON (anon_id) anon_id, option
    FROM public.poll_responses
    ORDER BY anon_id, confirmed_at DESC, id DESC
  )
  SELECT jsonb_build_object(
    'total_responses', (SELECT count(*) FROM public.poll_responses),
    'total_changes', (SELECT count(*) FROM public.poll_responses WHERE is_change),
    'responders', (SELECT count(*) FROM latest),
    'current_keep', (SELECT count(*) FROM latest WHERE option = 'keep'),
    'current_let_go', (SELECT count(*) FROM latest WHERE option = 'let_go'),
    'views', (SELECT count(*) FROM public.poll_events WHERE event_type = 'viewed'),
    'selections', (SELECT count(*) FROM public.poll_events WHERE event_type = 'option_selected')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.admin_poll_summary() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_poll_summary() TO service_role;
