create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  morning_weight numeric(5,2) not null,
  sleep_hours numeric(4,1) not null,
  energy_level int not null check (energy_level between 1 and 10),
  muscle_soreness int not null check (muscle_soreness between 1 and 10),
  stress_level int not null check (stress_level between 1 and 10),
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  training_day_type text not null check (
    training_day_type in ('Pull', 'Push', 'Legs', 'Active Recovery', 'Volleyball', 'Rest')
  ),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  name text not null,
  sets int not null,
  reps int not null,
  weight numeric(6,2) not null,
  previous_weight numeric(6,2),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.nutrition_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  meal_type text not null check (
    meal_type in ('breakfast', 'lunch', 'dinner', 'snacks', 'pre-workout', 'post-workout')
  ),
  food_description text not null,
  calories int not null default 0,
  protein int not null default 0,
  carbs int not null default 0,
  fats int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.daily_check_ins enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.nutrition_entries enable row level security;

create policy "profiles are viewable by owner"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles are editable by owner"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "checkins are owned by user"
on public.daily_check_ins for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "workouts are owned by user"
on public.workouts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "nutrition entries are owned by user"
on public.nutrition_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "workout exercises visible through parent workout"
on public.workout_exercises for all
using (
  exists (
    select 1
    from public.workouts
    where workouts.id = workout_exercises.workout_id
      and workouts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workouts
    where workouts.id = workout_exercises.workout_id
      and workouts.user_id = auth.uid()
  )
);
