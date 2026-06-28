-- Create custom types or domains if needed
-- Enable gen_random_uuid() extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  streak_count integer default 0 not null,
  last_active_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Statistics Table
create table public.statistics (
  user_id uuid references auth.users on delete cascade not null primary key,
  average_wpm numeric(5,2) default 0.00 not null,
  peak_wpm numeric(5,2) default 0.00 not null,
  average_accuracy numeric(5,2) default 0.00 not null,
  total_time_seconds numeric default 0.00 not null,
  total_chars_typed integer default 0 not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Libraries Table
create table public.libraries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  is_favorite boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Documents Table
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  library_id uuid references public.libraries on delete cascade,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  content text not null,
  file_path text,
  status text default 'Uploaded'::text check (status in ('Uploaded', 'Queued', 'Processing', 'Completed', 'Failed')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Chapters Table
create table public.chapters (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  sequence_number integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(document_id, sequence_number)
);

-- 6. Lessons Table
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  chapter_id uuid references public.chapters on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  content text not null,
  difficulty integer not null check (difficulty >= 1 and difficulty <= 5),
  sequence_number integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(chapter_id, sequence_number)
);

-- 7. Lesson Progress Table
create table public.lesson_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  lesson_id uuid references public.lessons on delete cascade not null,
  is_completed boolean default false not null,
  best_wpm numeric(5,2) default 0.00 not null,
  best_accuracy numeric(5,2) default 0.00 not null,
  attempts_count integer default 0 not null,
  last_practiced_at timestamp with time zone,
  unique(user_id, lesson_id)
);

-- 8. Typing Sessions Table
create table public.typing_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  lesson_id uuid references public.lessons on delete cascade not null,
  wpm numeric(5,2) not null,
  accuracy numeric(5,2) not null,
  chars_typed integer not null,
  time_seconds numeric(5,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Achievements Table
create table public.achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  badge_name text not null,
  awarded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, badge_name)
);

-- 10. Bookmarks Table
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  lesson_id uuid references public.lessons on delete cascade,
  document_id uuid references public.documents on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (
    (lesson_id is not null and document_id is null) or
    (lesson_id is null and document_id is not null)
  )
);

-- Enforce Row-Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.statistics enable row level security;
alter table public.libraries enable row level security;
alter table public.documents enable row level security;
alter table public.chapters enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.typing_sessions enable row level security;
alter table public.achievements enable row level security;
alter table public.bookmarks enable row level security;

-- Setup RLS Policies
-- Profiles: Users can view all profiles, but edit only their own
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);
create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Statistics: Users can view all stats, but edit only their own
create policy "Statistics are viewable by everyone." on public.statistics
  for select using (true);
create policy "Users can update their own statistics." on public.statistics
  for update using (auth.uid() = user_id);

-- Libraries: Users can CRUD only their own libraries
create policy "Users can CRUD their own libraries." on public.libraries
  for all using (auth.uid() = user_id);

-- Documents: Users can CRUD only their own documents
create policy "Users can CRUD their own documents." on public.documents
  for all using (auth.uid() = user_id);

-- Chapters: Users can CRUD only their own chapters
create policy "Users can CRUD their own chapters." on public.chapters
  for all using (auth.uid() = user_id);

-- Lessons: Users can CRUD only their own lessons
create policy "Users can CRUD their own lessons." on public.lessons
  for all using (auth.uid() = user_id);

-- Lesson Progress: Users can CRUD only their own progress records
create policy "Users can CRUD their own progress." on public.lesson_progress
  for all using (auth.uid() = user_id);

-- Typing Sessions: Users can CRUD only their own sessions
create policy "Users can CRUD their own typing sessions." on public.typing_sessions
  for all using (auth.uid() = user_id);

-- Achievements: Users can view all achievements, but modify only their own
create policy "Achievements are viewable by everyone." on public.achievements
  for select using (true);
create policy "Users can manage their own achievements." on public.achievements
  for all using (auth.uid() = user_id);

-- Bookmarks: Users can CRUD only their own bookmarks
create policy "Users can CRUD their own bookmarks." on public.bookmarks
  for all using (auth.uid() = user_id);

-- Trigger logic to auto-create profile and statistics upon signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || new.id::text)
  );

  insert into public.statistics (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
