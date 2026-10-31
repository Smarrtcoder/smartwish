/*
# Important Section password check

1. New Functions
- `check_important_password(attempt text)` returns true only when the attempt matches the secret password. The password itself is not stored; only its SHA-256 fingerprint is compared.

2. Security
- No tables are created or changed.
- The function is callable by the public site (anon and authenticated) so the password page can verify attempts.
- The function returns a single true/false value and never reveals the password or the fingerprint.

3. Notes
- Matching is case-sensitive because the comparison is on the exact UTF-8 bytes of the attempt.
*/

CREATE OR REPLACE FUNCTION public.check_important_password(attempt text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT encode(sha256(convert_to(coalesce(attempt, ''), 'UTF8')), 'hex')
    = 'd53528b9bba81bda3d95546e591d6ad3e1a683fca612e596f459c662afe14a88';
$$;

REVOKE EXECUTE ON FUNCTION public.check_important_password(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_important_password(text) TO anon, authenticated;
