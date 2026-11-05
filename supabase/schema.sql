-- Run in Supabase → SQL Editor (new project). Demo RLS: open read/write for anon key.
-- Tighten policies before production.

create table if not exists gym_cloud_events (
  id text primary key,
  event_type text not null,
  created_at timestamptz not null default now(),
  payload jsonb not null
);

create index if not exists gym_cloud_events_type_idx on gym_cloud_events (event_type);
create index if not exists gym_cloud_events_created_idx on gym_cloud_events (created_at desc);

alter table gym_cloud_events enable row level security;

create policy "gym_cloud_events_anon_insert"
  on gym_cloud_events for insert
  with check (true);

create policy "gym_cloud_events_anon_select"
  on gym_cloud_events for select
  using (true);

-- Optional: workout wizard blob (Phase 5 — wire from custom workout plan when ready)
create table if not exists gym_workout_wizard (
  id text primary key,
  updated_at timestamptz not null default now(),
  payload jsonb not null
);

alter table gym_workout_wizard enable row level security;

create policy "gym_workout_wizard_anon_insert"
  on gym_workout_wizard for insert
  with check (true);

create policy "gym_workout_wizard_anon_select"
  on gym_workout_wizard for select
  using (true);

create policy "gym_workout_wizard_anon_update"
  on gym_workout_wizard for update
  using (true);

create policy "gym_workout_wizard_anon_delete"
  on gym_workout_wizard for delete
  using (true);
