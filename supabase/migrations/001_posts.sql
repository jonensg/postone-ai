create table posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  brief       text not null,
  title       text,
  body        text,
  hashtags    text[],
  tone        text default '輕鬆',
  status      text default 'draft',
  created_at  timestamptz default now()
);

alter table posts enable row level security;

create policy "users_own_posts"
  on posts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
