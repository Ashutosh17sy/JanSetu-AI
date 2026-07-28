/*
# Enable Realtime

Adds `notifications`, `complaints`, and `complaint_timeline` to the Supabase
realtime publication so the frontend can subscribe to live updates via
`supabase.channel(...).on('postgres_changes', ...)`.
*/
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE complaint_timeline;
