import OpenAI from "openai";
import { env, isOpenAiConfigured } from "@/lib/env";
import { sampleDashboardData } from "@/lib/sample-data";
import { CoachResponse, DailyCheckIn, NutritionEntry, WorkoutEntry } from "@/lib/types";
import { calculateRecoveryScore } from "@/lib/utils";

function buildFallbackCoachResponse(
  checkIn?: DailyCheckIn,
  workout?: WorkoutEntry,
  nutritionEntries: NutritionEntry[] = sampleDashboardData.nutrition
): CoachResponse {
  const recovery = calculateRecoveryScore(checkIn ?? sampleDashboardData.checkIns[0]);
  const protein = nutritionEntries.reduce((sum, entry) => sum + entry.protein, 0);
  const workoutType = workout?.trainingDayType ?? sampleDashboardData.workouts[0].trainingDayType;

  return {
    trainingFeedback: `Your ${workoutType} session load looks solid. Keep one top set challenging, then preserve clean form on the remaining work sets.`,
    nutritionFeedback: `You are on track with roughly ${protein}g of protein logged today. Add fruit or rice around training if performance feels flat.`,
    recoveryAdvice: `Recovery score is ${recovery}/100. Prioritize hydration, 10 minutes of mobility, and a consistent sleep window tonight.`,
    tomorrowRecommendation: recovery >= 75
      ? "You can push intensity tomorrow, but keep total volume moderate."
      : "Choose a lighter session tomorrow or switch to active recovery to protect performance.",
    persianMotivation: "تو در حال ساختن نسخه قوي تر و منظم تر خودت هستي. امروز را با قدرت تمام کن."
  };
}

export async function generateCoachResponse(input: {
  checkIn?: DailyCheckIn;
  workout?: WorkoutEntry;
  nutritionEntries?: NutritionEntry[];
}) {
  if (!isOpenAiConfigured()) {
    return buildFallbackCoachResponse(
      input.checkIn,
      input.workout,
      input.nutritionEntries
    );
  }

  const client = new OpenAI({ apiKey: env.openAiApiKey });
  const prompt = [
    "You are an elite but practical fitness coach helping a private user.",
    "Return strict JSON with keys: trainingFeedback, nutritionFeedback, recoveryAdvice, tomorrowRecommendation, persianMotivation.",
    "Keep each field concise, useful, and grounded in the provided data.",
    "The persianMotivation value must be in Persian.",
    JSON.stringify(input)
  ].join("\n");

  const completion = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt
  });

  const text = completion.output_text;

  try {
    return JSON.parse(text) as CoachResponse;
  } catch {
    return buildFallbackCoachResponse(
      input.checkIn,
      input.workout,
      input.nutritionEntries
    );
  }
}
