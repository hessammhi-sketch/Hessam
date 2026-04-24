-- Replace this UUID with a real auth.users id after your first magic-link login.
with demo_user as (
  select '00000000-0000-0000-0000-000000000001'::uuid as user_id
)
insert into public.daily_check_ins
  (user_id, date, morning_weight, sleep_hours, energy_level, muscle_soreness, stress_level, notes)
select
  demo_user.user_id,
  v.date::date,
  v.morning_weight,
  v.sleep_hours,
  v.energy_level,
  v.muscle_soreness,
  v.stress_level,
  v.notes
from demo_user,
(
  values
    ('2026-04-24', 84.2, 7.5, 8, 4, 3, 'Felt fresh after mobility work and hydration.'),
    ('2026-04-23', 84.5, 6.8, 7, 6, 4, 'Leg session fatigue, but appetite was good.'),
    ('2026-04-22', 84.7, 7.1, 7, 5, 5, 'Moderate recovery day.')
) as v(date, morning_weight, sleep_hours, energy_level, muscle_soreness, stress_level, notes)
on conflict (user_id, date) do nothing;

with demo_user as (
  select '00000000-0000-0000-0000-000000000001'::uuid as user_id
),
inserted_workout as (
  insert into public.workouts (user_id, date, training_day_type, notes)
  select demo_user.user_id, '2026-04-24', 'Pull', 'Strong session, grip felt solid.'
  from demo_user
  returning id
)
insert into public.workout_exercises (workout_id, name, sets, reps, weight, previous_weight, notes)
select inserted_workout.id, v.name, v.sets, v.reps, v.weight, v.previous_weight, v.notes
from inserted_workout,
(
  values
    ('Weighted Pull-Up', 4, 8, 20.0, 20.0, 'Controlled eccentric.'),
    ('Barbell Row', 4, 10, 72.5, 70.0, 'Add straps if grip fades.')
) as v(name, sets, reps, weight, previous_weight, notes);

with demo_user as (
  select '00000000-0000-0000-0000-000000000001'::uuid as user_id
)
insert into public.nutrition_entries
  (user_id, date, meal_type, food_description, calories, protein, carbs, fats)
select
  demo_user.user_id,
  v.date::date,
  v.meal_type,
  v.food_description,
  v.calories,
  v.protein,
  v.carbs,
  v.fats
from demo_user,
(
  values
    ('2026-04-24', 'breakfast', 'Greek yogurt, honey, berries, whey', 420, 38, 41, 10),
    ('2026-04-24', 'lunch', 'Chicken rice bowl with avocado', 710, 52, 68, 22),
    ('2026-04-24', 'post-workout', 'Banana and whey shake', 260, 28, 31, 2),
    ('2026-04-23', 'dinner', 'Salmon, potato, salad', 690, 45, 48, 28)
) as v(date, meal_type, food_description, calories, protein, carbs, fats);
