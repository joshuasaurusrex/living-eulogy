-- Migration: Add likes and comments tables
-- Run this in Supabase SQL Editor if you already have the base schema

-- ============================================
-- LIKES TABLE
-- ============================================

create table if not exists public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  eulogy_id uuid references public.eulogies(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, eulogy_id)
);

alter table public.likes enable row level security;

create policy "Users can view all likes"
  on public.likes for select
  using (true);

create policy "Authenticated users can like"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike their own likes"
  on public.likes for delete
  using (auth.uid() = user_id);

create index if not exists likes_eulogy_id_idx on public.likes(eulogy_id);
create index if not exists likes_user_id_idx on public.likes(user_id);

-- ============================================
-- COMMENTS TABLE
-- ============================================

create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  eulogy_id uuid references public.eulogies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) >= 1 and char_length(content) <= 500),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.comments enable row level security;

create policy "Anyone can view comments on public eulogies"
  on public.comments for select
  using (
    exists (
      select 1 from public.eulogies
      where id = eulogy_id and visibility = 'public'
    )
  );

create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

create index if not exists comments_eulogy_id_idx on public.comments(eulogy_id);
create index if not exists comments_user_id_idx on public.comments(user_id);
