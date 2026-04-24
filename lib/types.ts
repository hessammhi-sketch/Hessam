export type TrainingDayType =
  | "Pull"
  | "Push"
  | "Legs"
  | "Active Recovery"
  | "Volleyball"
  | "Rest";

export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snacks"
  | "pre-workout"
  | "post-workout";

export interface DailyCheckIn {
  id: string;
  date: string;
  morningWeight: number;
  sleepHours: number;
  energyLevel: number;
  muscleSoreness: number;
  stressLevel: number;
  notes: string;
}

export interface ExerciseSet {
  sets: number;
  reps: number;
  weight: number;
}

export interface ExerciseLog {
  id: string;
  name: string;
  notes: string;
  previousWeight: number | null;
  suggestedWeight: number | null;
  performance: ExerciseSet;
}

export interface WorkoutEntry {
  id: string;
  date: string;
  trainingDayType: TrainingDayType;
  notes: string;
  exercises: ExerciseLog[];
}

export interface NutritionEntry {
  id: string;
  date: string;
  mealType: MealType;
  foodDescription: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DashboardMetrics {
  weightTrend: Array<{ date: string; weight: number }>;
  workoutFrequency: Array<{ label: string; count: number }>;
  proteinAverage: number;
  recoveryScore: number;
  weeklySummary: string;
}

export interface DashboardPayload {
  checkIns: DailyCheckIn[];
  workouts: WorkoutEntry[];
  nutrition: NutritionEntry[];
  metrics: DashboardMetrics;
}

export interface CoachResponse {
  trainingFeedback: string;
  nutritionFeedback: string;
  recoveryAdvice: string;
  tomorrowRecommendation: string;
  persianMotivation: string;
}
