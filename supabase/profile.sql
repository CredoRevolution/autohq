create table if not exists profile (
  id integer primary key default 1,
  name text,
  title text,
  location text,
  email text,
  github text,
  linkedin text,
  summary text,
  skills text,
  experience text,
  languages text,
  salary_expectation text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Only one row allowed (personal profile)
create unique index if not exists profile_single on profile(id);

-- Open RLS for personal use
alter table profile enable row level security;
create policy "allow all" on profile for all using (true) with check (true);
