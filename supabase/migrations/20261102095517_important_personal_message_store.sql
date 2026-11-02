/*
# Important Section personal message storage

1. New Tables
- `important_personal_message`: a single row (id = 1) holding the personal message text and when it was last saved. Text is limited to 4000 characters.

2. Security
- Row level security is enabled with no policies and no direct grants, so the table cannot be read or written directly by the public site.
- Two functions are the only way in. Both require the same secret password that the password page checks, using the existing `check_important_password` function.
  - `get_important_personal_message(attempt)` returns the saved text.
  - `save_important_personal_message(attempt, new_body)` replaces the saved text.
- Both functions are executable by the public site (anon and authenticated) but reject any attempt that is not the correct password.

3. Notes
- The row is seeded empty, so no message is ever invented.
*/

CREATE TABLE IF NOT EXISTS public.important_personal_message (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  body text NOT NULL DEFAULT '' CHECK (char_length(body) <= 4000),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.important_personal_message ENABLE ROW LEVEL SECURITY;

INSERT INTO public.important_personal_message (id, body)
VALUES (1, '')
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_important_personal_message(attempt text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.check_important_password(attempt) THEN
    RAISE EXCEPTION 'invalid password' USING ERRCODE = '42501';
  END IF;
  RETURN (SELECT m.body FROM public.important_personal_message AS m WHERE m.id = 1);
END;
$$;

CREATE OR REPLACE FUNCTION public.save_important_personal_message(attempt text, new_body text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.check_important_password(attempt) THEN
    RAISE EXCEPTION 'invalid password' USING ERRCODE = '42501';
  END IF;
  UPDATE public.important_personal_message
    SET body = coalesce(new_body, ''), updated_at = now()
    WHERE id = 1;
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_important_personal_message(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_important_personal_message(text) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.save_important_personal_message(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_important_personal_message(text, text) TO anon, authenticated;
