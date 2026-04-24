import { sampleDashboardData } from "@/lib/sample-data";
import { getSupabaseServerClient } from "@/lib/supabase";
import { DashboardPayload, DailyCheckIn, NutritionEntry, WorkoutEntry } from "@/lib/types";
import { buildMetrics, inferProgressiveOverload } from "@/lib/utils";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getDashboardData(): Promise<DashboardPayload> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return sampleDashboardData;
  }

  const [checkInsResult, workoutsResult, nutritionResult] = await Promise.all([
    supabase
      .from("daily_check_ins")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .order("date", { ascending: false })
      .limit(10),
    supabase
      .from("workouts")
      .select("*, workout_exercises(*)")
      .eq("user_id", DEMO_USER_ID)
      .order("date", { ascending: false })
      .limit(10),
    supabase
      .from("nutrition_entries")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .order("date", { ascending: false })
      .limit(30)
  ]);

  if (checkInsResult.error || workoutsResult.error || nutritionResult.error) {
    return sampleDashboardData;
  }

  const checkIns: DailyCheckIn[] = checkInsResult.data.map((row) => ({
    id: row.id,
    date: row.date,
    morningWeight: row.morning_weight,
    sleepHours: row.sleep_hours,
    energyLevel: row.energy_level,
    muscleSoreness: row.muscle_soreness,
    stressLevel: row.stress_level,
    notes: row.notes ?? ""
  }));

  const workouts: WorkoutEntry[] = workoutsResult.data.map((row) => ({
    id: row.id,
    date: row.date,
    trainingDayType: row.training_day_type,
    notes: row.notes ?? "",
    exercises: (row.workout_exercises ?? []).map((exercise: Record<string, unknown>) => {
      const previousWeight =
        typeof exercise.previous_weight === "number" ? exercise.previous_weight : null;
      const reps = Number(exercise.reps ?? 0);

      return {
        id: String(exercise.id),
        name: String(exercise.name),
        notes: String(exercise.notes ?? ""),
        previousWeight,
        suggestedWeight: inferProgressiveOverload(previousWeight, reps),
        performance: {
          sets: Number(exercise.sets ?? 0),
          reps,
          weight: Number(exercise.weight ?? 0)
        }
      };
    })
  }));

  const nutrition: NutritionEntry[] = nutritionResult.data.map((row) => ({
    id: row.id,
    date: row.date,
    mealType: row.meal_type,
    foodDescription: row.food_description,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fats: row.fats
  }));

  return {
    checkIns,
    workouts,
    nutrition,
    metrics: buildMetrics(checkIns, workouts, nutrition)
  };
}

export async function createCheckIn(checkIn: Omit<DailyCheckIn, "id">) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { ok: true, mode: "sample" as const };

  const { error } = await supabase.from("daily_check_ins").insert({
    user_id: DEMO_USER_ID,
    date: checkIn.date,
    morning_weight: checkIn.morningWeight,
    sleep_hours: checkIn.sleepHours,
    energy_level: checkIn.energyLevel,
    muscle_soreness: checkIn.muscleSoreness,
    stress_level: checkIn.stressLevel,
    notes: checkIn.notes
  });

  if (error) throw new Error(error.message);
  return { ok: true, mode: "supabase" as const };
}

export async function createWorkout(workout: Omit<WorkoutEntry, "id">) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { ok: true, mode: "sample" as const };

  const { data: workoutRow, error: workoutError } = await supabase
    .from("workouts")
    .insert({
      user_id: DEMO_USER_ID,
      date: workout.date,
      training_day_type: workout.trainingDayType,
      notes: workout.notes
    })
    .select("id")
    .single();

  if (workoutError) throw new Error(workoutError.message);

  if (workout.exercises.length) {
    const { error: exercisesError } = await supabase.from("workout_exercises").insert(
      workout.exercises.map((exercise) => ({
        workout_id: workoutRow.id,
        name: exercise.name,
        sets: exercise.performance.sets,
        reps: exercise.performance.reps,
        weight: exercise.performance.weight,
        previous_weight: exercise.previousWeight,
        notes: exercise.notes
      }))
    );

    if (exercisesError) throw new Error(exercisesError.message);
  }

  return { ok: true, mode: "supabase" as const };
}

export async function createNutritionEntries(entries: Array<Omit<NutritionEntry, "id">>) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { ok: true, mode: "sample" as const };

  const { error } = await supabase.from("nutrition_entries").insert(
    entries.map((entry) => ({
      user_id: DEMO_USER_ID,
      date: entry.date,
      meal_type: entry.mealType,
      food_description: entry.foodDescription,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fats: entry.fats
    }))
  );

  if (error) throw new Error(error.message);
  return { ok: true, mode: "supabase" as const };
}
