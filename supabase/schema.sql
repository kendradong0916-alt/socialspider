-- Run this in the Supabase SQL editor

create table if not exists public.tasks (
  id              uuid primary key default gen_random_uuid(),
  skyvern_task_id text unique,
  url             text        not null,
  prompt          text        not null,
  status          text        not null default 'created',
  result          jsonb,
  failure_reason  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Keep updated_at in sync automatically
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

-- Row-level security (open for MVP — tighten for production)
alter table public.tasks enable row level security;

create policy "public_read"   on public.tasks for select using (true);
create policy "public_insert" on public.tasks for insert with check (true);
create policy "public_update" on public.tasks for update using (true);

-- Enable Realtime (lets the frontend subscribe to task status changes)
alter publication supabase_realtime add table public.tasks;
