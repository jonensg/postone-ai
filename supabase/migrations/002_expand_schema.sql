-- Expand posts table for scheduling, publishing, metrics, platforms
alter table posts add column if not exists platforms text[] default '{}';
alter table posts add column if not exists image_urls text[] default '{}';
alter table posts add column if not exists scheduled_at timestamptz;
alter table posts add column if not exists published_at timestamptz;
alter table posts add column if not exists metrics jsonb default '{}'::jsonb;

-- 素材庫：uploaded product images / creative assets
create table if not exists assets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  name        text not null,
  url         text not null,
  storage_path text not null,
  mime_type   text,
  size_bytes  bigint,
  tags        text[] default '{}',
  created_at  timestamptz default now()
);

alter table assets enable row level security;

drop policy if exists "users_own_assets" on assets;
create policy "users_own_assets"
  on assets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 熱門話題：AI-generated trending topic suggestions
create table if not exists trending_topics (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  topic       text not null,
  angle       text,
  category    text,
  reason      text,
  used        boolean default false,
  created_at  timestamptz default now()
);

alter table trending_topics enable row level security;

drop policy if exists "users_own_topics" on trending_topics;
create policy "users_own_topics"
  on trending_topics for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage bucket for 素材庫 (create manually in Supabase dashboard if not yet created)
-- Bucket name: assets
-- Public: true (so image URLs render in-app)
