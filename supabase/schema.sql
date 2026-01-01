-- Living Eulogy Database Schema
-- Run this in Supabase SQL Editor (SQL Editor > New Query > paste > Run)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase Auth users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Eulogies table
create table public.eulogies (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  recipient_name text not null,
  recipient_email text,
  content text not null,
  visibility text check (visibility in ('private', 'friends', 'public')) default 'private',
  share_token uuid default uuid_generate_v4() unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.eulogies enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Eulogies policies
create policy "Public eulogies are viewable by everyone"
  on public.eulogies for select
  using (visibility = 'public');

create policy "Users can view their own eulogies"
  on public.eulogies for select
  using (auth.uid() = author_id);

create policy "Users can view eulogies shared with their email"
  on public.eulogies for select
  using (
    recipient_email = (
      select email from auth.users where id = auth.uid()
    )
  );

create policy "Anyone can view eulogy by share token"
  on public.eulogies for select
  using (share_token is not null);

create policy "Authenticated users can create eulogies"
  on public.eulogies for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own eulogies"
  on public.eulogies for update
  using (auth.uid() = author_id);

create policy "Users can delete their own eulogies"
  on public.eulogies for delete
  using (auth.uid() = author_id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call function on new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
