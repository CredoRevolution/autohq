-- Adds rabota.by as a toggleable source. Safe to run on an existing DB.
-- site_enabled = true  → jobs show up in the dashboard
-- telegram_enabled = false → no Telegram pings until you tune the scoring for BY jobs
insert into source_settings (source_id, label, site_enabled, telegram_enabled)
values ('rabota', 'rabota.by', true, false)
on conflict (source_id) do nothing;
