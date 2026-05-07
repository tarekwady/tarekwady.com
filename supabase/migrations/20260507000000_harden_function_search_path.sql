-- Pin search_path on all SECURITY DEFINER functions.
-- Without this, a user-controlled search_path could shadow built-in
-- objects (e.g. operators, functions) the function relies on.
ALTER FUNCTION public.delete_note(uuid, uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.select_note(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.select_session_notes(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_note(uuid, uuid, text, text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_note_content(uuid, uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_note_emoji(uuid, uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_note_title(uuid, uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.select_photos() SET search_path = public, pg_temp;
ALTER FUNCTION public.insert_photo(text, text, timestamptz, text[]) SET search_path = public, pg_temp;
