-- Run this in the Supabase SQL Editor

-- Users table (extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  stripe_customer_id text,
  subscription_status text default 'inactive',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Brand Settings
create table public.brand_settings (
  user_id uuid references auth.users not null primary key,
  company_name text default 'My Company',
  logo_url text,
  primary_color text default '#6366f1',
  secondary_color text default '#8b5cf6',
  accent_color text default '#f59e0b',
  hr_email text
);

-- Courses (Stores the massive JSON payload for now to speed up migration)
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text default 'draft', -- draft, published, archived
  formats jsonb default '["slideshow"]'::jsonb,
  lessons jsonb default '[]'::jsonb,
  total_estimated_minutes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Analytics
create table public.analytics (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  lesson_id text not null,
  learner_email text,
  score integer default 0,
  total integer default 0,
  passed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.brand_settings enable row level security;
alter table public.courses enable row level security;
alter table public.analytics enable row level security;

-- Policies for Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Policies for Brand Settings
create policy "Users can view own brand settings" on public.brand_settings for select using (auth.uid() = user_id);
create policy "Users can update own brand settings" on public.brand_settings for update using (auth.uid() = user_id);
create policy "Users can insert own brand settings" on public.brand_settings for insert with check (auth.uid() = user_id);

-- Policies for Courses
create policy "Users can view own courses" on public.courses for select using (auth.uid() = user_id);
create policy "Users can insert own courses" on public.courses for insert with check (auth.uid() = user_id);
create policy "Users can update own courses" on public.courses for update using (auth.uid() = user_id);
create policy "Users can delete own courses" on public.courses for delete using (auth.uid() = user_id);
-- Public policy for viewing published courses
create policy "Anyone can view published courses" on public.courses for select using (status = 'published');

-- Policies for Analytics
create policy "Users can view analytics for their courses" on public.analytics for select using (
  exists (select 1 from public.courses where courses.id = analytics.course_id and courses.user_id = auth.uid())
);
create policy "Anyone can insert analytics (webhooks)" on public.analytics for insert with check (true);
