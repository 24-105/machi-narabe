create table if not exists public.machi_scores (
  id bigint generated always as identity primary key,
  random_name text not null,
  score integer not null,
  max_level integer not null,
  max_chain integer not null default 0,
  turns integer not null default 0,
  created_at timestamptz not null default now(),

  constraint machi_scores_random_name_length check (
    char_length(random_name) between 2 and 16
  ),
  constraint machi_scores_score_range check (
    score between 0 and 999999999
  ),
  constraint machi_scores_max_level_range check (
    max_level between 1 and 9
  ),
  constraint machi_scores_max_chain_range check (
    max_chain between 0 and 99
  ),
  constraint machi_scores_turns_range check (
    turns between 0 and 999
  )
);

comment on table public.machi_scores is
  'Machi Narabe overall ranking scores. Does not store user ids, IP addresses, User-Agent values, device ids, browser fingerprints, or contact information.';

create index if not exists machi_scores_score_created_idx
  on public.machi_scores (score desc, created_at asc);

create index if not exists machi_scores_created_at_idx
  on public.machi_scores (created_at desc);

alter table public.machi_scores enable row level security;

revoke all on table public.machi_scores from anon, authenticated;

do $$
begin
  if exists (
    select 1
    from pg_class
    where relkind = 'S'
      and relnamespace = 'public'::regnamespace
      and relname = 'machi_scores_id_seq'
  ) then
    revoke all on sequence public.machi_scores_id_seq from anon, authenticated;
  end if;
end
$$;
