-- Cleanup script for old incomplete sessions
-- This can be run as a Supabase Edge Function on a cron schedule (0 0 * * * - once a day at midnight)

-- Delete chat sessions that are incomplete and older than 24 hours
DELETE FROM public.chat_sessions 
WHERE is_complete = false 
AND updated_at < now() - interval '24 hours';

-- Return the count of deleted sessions
SELECT count(*) as deleted_sessions FROM (
  DELETE FROM public.chat_sessions 
  WHERE is_complete = false 
  AND updated_at < now() - interval '24 hours'
  RETURNING id
) deleted; 