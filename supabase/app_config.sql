-- App-wide tunables that n8n / the webhook read at runtime.
-- Single row (id = 1).
create table if not exists app_config (
  id integer primary key default 1,
  keywords text not null default 'vue nuxt typescript frontend',
  telegram_min_score integer not null default 70,
  updated_at timestamptz default now()
);

create unique index if not exists app_config_single on app_config(id);

alter table app_config enable row level security;
create policy "allow all" on app_config for all using (true) with check (true);

insert into app_config (id, keywords, telegram_min_score)
values (1, 'vue nuxt typescript frontend', 70)
on conflict (id) do nothing;

-- Make per-source "last import" trackable: persist the source on each job.
alter table jobs add column if not exists source text;
