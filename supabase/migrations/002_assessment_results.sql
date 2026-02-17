-- Optional history table for assessment snapshots.
create table if not exists public.assessment_results (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category_scores jsonb not null,
  recommended_modules text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists assessment_results_user_id_idx
  on public.assessment_results (user_id);

alter table public.assessment_results enable row level security;

create policy "Users can view own assessment snapshots"
  on public.assessment_results
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own assessment snapshots"
  on public.assessment_results
  for insert
  with check (auth.uid() = user_id);
