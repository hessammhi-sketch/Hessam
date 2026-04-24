import { DailyCheckIn, NutritionEntry, WorkoutEntry } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function calculateRecoveryScore(checkIn?: DailyCheckIn) {
  if (!checkIn) return 0;

  const sleepScore = Math.min(checkIn.sleepHours / 8, 1) * 35;
  const energyScore = (checkIn.energyLevel / 10) * 25;
  const sorenessScore = ((10 - checkIn.muscleSoreness) / 10) * 20;
  const stressScore = ((10 - checkIn.stressLevel) / 10) * 20;

  return Math.round(sleepScore + energyScore + sorenessScore + stressScore);
}

export function calculateProteinAverage(entries: NutritionEntry[]) {
  if (!entries.length) return 0;

  const dailyProteinMap = new Map<string, number>();

  for (const entry of entries) {
    dailyProteinMap.set(
      entry.date,
      (dailyProteinMap.get(entry.date) ?? 0) + entry.protein
    );
  }

  const totals = [...dailyProteinMap.values()];
  return Math.round(totals.reduce((sum, total) => sum + total, 0) / totals.length);
}

export function summarizeWeeklyProgress(
  checkIns: DailyCheckIn[],
  workouts: WorkoutEntry[],
  nutrition: NutritionEntry[]
) {
  const latestCheckIn = checkIns[0];
  const completedWorkouts = workouts.filter((workout) => workout.trainingDayType !== "Rest").length;
  const averageProtein = calculateProteinAverage(nutrition);
  const recoveryScore = calculateRecoveryScore(latestCheckIn);

  return `This week you logged ${completedWorkouts} training sessions, averaged ${averageProtein}g of protein, and your current recovery score is ${recoveryScore}/100.`;
}

export function buildMetrics(
  checkIns: DailyCheckIn[],
  workouts: WorkoutEntry[],
  nutrition: NutritionEntry[]
) {
  const weightTrend = [...checkIns]
    .slice(0, 7)
    .reverse()
    .map((entry) => ({ date: entry.date.slice(5), weight: entry.morningWeight }));

  const workoutCounts = workouts.reduce<Record<string, number>>((acc, workout) => {
    acc[workout.trainingDayType] = (acc[workout.trainingDayType] ?? 0) + 1;
    return acc;
  }, {});

  return {
    weightTrend,
    workoutFrequency: Object.entries(workoutCounts).map(([label, count]) => ({
      label,
      count
    })),
    proteinAverage: calculateProteinAverage(nutrition),
    recoveryScore: calculateRecoveryScore(checkIns[0]),
    weeklySummary: summarizeWeeklyProgress(checkIns, workouts, nutrition)
  };
}

export function inferProgressiveOverload(previousWeight: number | null, reps: number) {
  if (!previousWeight) return null;
  if (reps >= 10) return Number((previousWeight * 1.025).toFixed(1));
  if (reps >= 8) return Number((previousWeight * 1.015).toFixed(1));
  return previousWeight;
}
