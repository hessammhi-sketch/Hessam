import { DashboardPayload } from "@/lib/types";
import { buildMetrics, inferProgressiveOverload } from "@/lib/utils";

const checkIns = [
  {
    id: "ci-1",
    date: "2026-04-24",
    morningWeight: 84.2,
    sleepHours: 7.5,
    energyLevel: 8,
    muscleSoreness: 4,
    stressLevel: 3,
    notes: "Felt fresh after mobility work and hydration."
  },
  {
    id: "ci-2",
    date: "2026-04-23",
    morningWeight: 84.5,
    sleepHours: 6.8,
    energyLevel: 7,
    muscleSoreness: 6,
    stressLevel: 4,
    notes: "Leg session fatigue, but appetite was good."
  },
  {
    id: "ci-3",
    date: "2026-04-22",
    morningWeight: 84.7,
    sleepHours: 7.1,
    energyLevel: 7,
    muscleSoreness: 5,
    stressLevel: 5,
    notes: "Moderate recovery day."
  }
];

const workouts = [
  {
    id: "wo-1",
    date: "2026-04-24",
    trainingDayType: "Pull" as const,
    notes: "Strong session, grip felt solid.",
    exercises: [
      {
        id: "ex-1",
        name: "Weighted Pull-Up",
        notes: "Controlled eccentric.",
        previousWeight: 20,
        suggestedWeight: inferProgressiveOverload(20, 8),
        performance: { sets: 4, reps: 8, weight: 20 }
      },
      {
        id: "ex-2",
        name: "Barbell Row",
        notes: "Add straps if grip fades.",
        previousWeight: 70,
        suggestedWeight: inferProgressiveOverload(70, 10),
        performance: { sets: 4, reps: 10, weight: 72.5 }
      }
    ]
  },
  {
    id: "wo-2",
    date: "2026-04-23",
    trainingDayType: "Legs" as const,
    notes: "Volume focus.",
    exercises: [
      {
        id: "ex-3",
        name: "Back Squat",
        notes: "Pause first rep each set.",
        previousWeight: 100,
        suggestedWeight: inferProgressiveOverload(100, 6),
        performance: { sets: 5, reps: 6, weight: 100 }
      }
    ]
  },
  {
    id: "wo-3",
    date: "2026-04-21",
    trainingDayType: "Volleyball" as const,
    notes: "High movement load, count as conditioning.",
    exercises: []
  }
];

const nutrition = [
  {
    id: "nu-1",
    date: "2026-04-24",
    mealType: "breakfast" as const,
    foodDescription: "Greek yogurt, honey, berries, whey",
    calories: 420,
    protein: 38,
    carbs: 41,
    fats: 10
  },
  {
    id: "nu-2",
    date: "2026-04-24",
    mealType: "lunch" as const,
    foodDescription: "Chicken rice bowl with avocado",
    calories: 710,
    protein: 52,
    carbs: 68,
    fats: 22
  },
  {
    id: "nu-3",
    date: "2026-04-24",
    mealType: "post-workout" as const,
    foodDescription: "Banana and whey shake",
    calories: 260,
    protein: 28,
    carbs: 31,
    fats: 2
  },
  {
    id: "nu-4",
    date: "2026-04-23",
    mealType: "dinner" as const,
    foodDescription: "Salmon, potato, salad",
    calories: 690,
    protein: 45,
    carbs: 48,
    fats: 28
  }
];

export const sampleDashboardData: DashboardPayload = {
  checkIns,
  workouts,
  nutrition,
  metrics: buildMetrics(checkIns, workouts, nutrition)
};
