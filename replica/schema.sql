-- Postgres (Supabase). Access: row level security on every table; owner = auth.uid().
create extension if not exists pgcrypto;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free' check (plan in ('free','pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null default 'Untitled',
  device text not null default 'mobile' check (device in ('mobile','web')),
  design_md text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on projects (user_id, updated_at desc);

create table generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  idempotency_key text not null,
  mode text not null check (mode in ('standard','thinking','flash','ideate')),
  prompt text not null check (length(prompt) between 1 and 4000),
  image_path text,
  status text not null default 'queued' check (status in ('queued','running','done','failed','cancelled')),
  error text,
  tokens_in int, tokens_out int,
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  unique (user_id, idempotency_key)
);
create index on generations (project_id, created_at desc);
create index on generations (user_id, created_at desc);

create table screens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  position int not null,
  title text not null default 'Screen',
  current_version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, position) deferrable initially deferred
);
create index on screens (user_id);

create table screen_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  screen_id uuid not null references screens(id) on delete cascade,
  generation_id uuid references generations(id) on delete set null,
  version int not null,
  html text not null check (length(html) < 500000),   -- sanitised before insert
  kind text not null default 'generated' check (kind in ('generated','refined','edited','variant')),
  created_at timestamptz not null default now(),
  unique (screen_id, version)
);
create index on screen_versions (generation_id);
create index on screen_versions (user_id);

create table usage_counters (
  user_id uuid not null references profiles(id) on delete cascade,
  month date not null,                                   -- first day of month, UTC
  mode_group text not null check (mode_group in ('standard','experimental')),
  used int not null default 0 check (used >= 0),
  primary key (user_id, month, mode_group)
);

alter table profiles enable row level security;
alter table projects enable row level security;
alter table generations enable row level security;
alter table screens enable row level security;
alter table screen_versions enable row level security;
alter table usage_counters enable row level security;

create policy own_profile on profiles for select using (id = auth.uid());
create policy own_projects on projects for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_generations on generations for select using (user_id = auth.uid());   -- writes via server only
create policy own_screens on screens for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_versions on screen_versions for select using (user_id = auth.uid());   -- writes via server only
create policy own_usage on usage_counters for select using (user_id = auth.uid());       -- writes via server only

-- Atomic quota check + increment: returns false when over limit (no race between two requests).
create or replace function consume_quota(p_user uuid, p_group text, p_limit int)
returns boolean language plpgsql security definer set search_path = public as $$
declare m date := date_trunc('month', now() at time zone 'utc')::date; n int;
begin
  insert into usage_counters(user_id, month, mode_group, used) values (p_user, m, p_group, 0)
    on conflict do nothing;
  update usage_counters set used = used + 1
    where user_id = p_user and month = m and mode_group = p_group and used < p_limit
    returning used into n;
  return n is not null;
end $$;
revoke all on function consume_quota from public, anon, authenticated;
