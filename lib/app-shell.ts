import { DashboardPayload, NutritionEntry } from "@/lib/types";
import { calculateRecoveryScore } from "@/lib/utils";

export interface TodayExercisePlan {
  name: string;
  sets: number;
  reps: number;
  targetWeight: number;
  previousWeight: number | null;
  note: string;
}

export interface TodayMealPlan {
  slot: string;
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  guidance: string;
}

export interface WeeklyPlanDay {
  day: string;
  focus: string;
  status: "done" | "today" | "upcoming";
}

export interface EducationTip {
  title: string;
  category: string;
  body: string;
}

export interface ProfileField {
  label: string;
  value: string;
}

export interface HealthOsViewModel {
  name: string;
  streakDays: number;
  todayDate: string;
  recoveryScore: number;
  todayFocus: string;
  todaySummary: string;
  macroTarget: string;
  hydrationTarget: string;
  trainingPlan: TodayExercisePlan[];
  meals: TodayMealPlan[];
  weeklyPlan: WeeklyPlanDay[];
  educationTips: EducationTip[];
  profileFields: ProfileField[];
  weeklyQuestions: string[];
  weeklyActivity: Array<{ label: string; value: number }>;
  monthlyActivity: Array<{ label: string; value: number }>;
  monthlyWeights: Array<{ label: string; value: number }>;
  todayNutritionTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

function buildTodayMeals(entries: NutritionEntry[]): TodayMealPlan[] {
  const fallback: TodayMealPlan[] = [
    {
      slot: "Breakfast",
      title: "Protein yogurt bowl",
      calories: 430,
      protein: 38,
      carbs: 42,
      fats: 10,
      guidance: "Keep it light and protein-forward."
    },
    {
      slot: "Lunch",
      title: "Chicken rice performance bowl",
      calories: 720,
      protein: 52,
      carbs: 70,
      fats: 20,
      guidance: "Main fuel meal before the busy part of the day."
    },
    {
      slot: "Post-workout",
      title: "Whey and banana shake",
      calories: 260,
      protein: 28,
      carbs: 31,
      fats: 2,
      guidance: "Use this within 60 minutes after training."
    },
    {
      slot: "Dinner",
      title: "Lean protein and potatoes",
      calories: 650,
      protein: 44,
      carbs: 48,
      fats: 18,
      guidance: "Go for simple recovery food and sleep-friendly digestion."
    }
  ];

  if (!entries.length) return fallback;

  return entries.map((entry) => ({
    slot: entry.mealType,
    title: entry.foodDescription,
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fats: entry.fats,
    guidance: "Adjust based on hunger, training time, and recovery."
  }));
}

export function buildHealthOsViewModel(data: DashboardPayload): HealthOsViewModel {
  const latestCheckIn = data.checkIns[0];
  const latestWorkout = data.workouts[0];
  const todayDate = latestCheckIn?.date ?? new Date().toISOString().slice(0, 10);
  const todayNutrition = data.nutrition.filter((entry) => entry.date === todayDate);
  const todayNutritionTotals = todayNutrition.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fats: acc.fats + entry.fats
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const weeklyPlan: WeeklyPlanDay[] = [
    { day: "Sat", focus: "Push strength + shoulders", status: "done" },
    { day: "Sun", focus: "Volleyball movement", status: "done" },
    { day: "Mon", focus: "Pull power + lats", status: "today" },
    { day: "Tue", focus: "Legs + core stability", status: "upcoming" },
    { day: "Wed", focus: "Active recovery and mobility", status: "upcoming" },
    { day: "Thu", focus: "Push hypertrophy", status: "upcoming" },
    { day: "Fri", focus: "Rest and reset", status: "upcoming" }
  ];

  const monthlyWeights = data.metrics.weightTrend.map((point) => ({
    label: point.date,
    value: point.weight
  }));

  return {
    name: "Hessam",
    streakDays: 52,
    todayDate,
    recoveryScore: calculateRecoveryScore(latestCheckIn),
    todayFocus: latestWorkout?.trainingDayType ?? "Performance day",
    todaySummary:
      "Start the day with a clear plan, log what actually happens, and let the app adapt your training and nutrition direction.",
    macroTarget: "2,250 kcal | 185P | 210C | 65F",
    hydrationTarget: "3.5L water + electrolytes around training",
    trainingPlan:
      latestWorkout?.exercises.map((exercise) => ({
        name: exercise.name,
        sets: exercise.performance.sets,
        reps: exercise.performance.reps,
        targetWeight: exercise.suggestedWeight ?? exercise.performance.weight,
        previousWeight: exercise.previousWeight,
        note: exercise.notes || "Move with control and keep one clean rep in reserve."
      })) ?? [],
    meals: buildTodayMeals(todayNutrition),
    weeklyPlan,
    educationTips: [
      {
        title: "Progressive overload is earned, not forced",
        category: "Training",
        body: "If sleep or recovery drops, keep technique quality high and hold weight steady instead of chasing numbers."
      },
      {
        title: "Protein spread matters",
        category: "Nutrition",
        body: "Aim to split protein across 3 to 5 meals so recovery stays steady instead of back-loading it at night."
      },
      {
        title: "Use stress as a programming input",
        category: "Recovery",
        body: "High stress plus poor sleep is a sign to reduce volume, not motivation. Keep the streak alive with a lighter win."
      }
    ],
    profileFields: [
      { label: "Current weight", value: `${latestCheckIn?.morningWeight ?? 84.2} kg` },
      { label: "Height", value: "180 cm" },
      { label: "Primary goal", value: "Lean athletic muscle with better recovery" },
      { label: "Training style", value: "Bodybuilding + performance + volleyball" },
      { label: "Baseline streak", value: "52 days imported manually from existing ChatGPT tracking" }
    ],
    weeklyQuestions: [
      "How did your average energy feel this week?",
      "Did your appetite match the plan or drift above it?",
      "Which movement felt strongest this week?",
      "What should next week protect: sleep, performance, or body composition?"
    ],
    weeklyActivity: [
      { label: "Workouts", value: 5 },
      { label: "Meals logged", value: 6 },
      { label: "Recovery check-ins", value: 4 },
      { label: "Coach reviews", value: 3 }
    ],
    monthlyActivity: [
      { label: "W1", value: 72 },
      { label: "W2", value: 78 },
      { label: "W3", value: 81 },
      { label: "W4", value: 84 }
    ],
    monthlyWeights,
    todayNutritionTotals
  };
}
