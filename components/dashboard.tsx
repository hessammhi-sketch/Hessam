"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { DashboardPayload } from "@/lib/types";
import { cn } from "@/lib/utils";

function Panel({
  title,
  eyebrow,
  children,
  className
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[28px] border border-line bg-surface/70 p-5 shadow-panel", className)}>
      <p className="text-xs uppercase tracking-[0.3em] text-muted">{eyebrow}</p>
      <h3 className="mt-2 text-lg font-semibold text-text">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Dashboard({ data }: { data: DashboardPayload }) {
  const todayNutrition = useMemo(
    () => data.nutrition.filter((entry) => entry.date === data.checkIns[0]?.date),
    [data.nutrition, data.checkIns]
  );

  const dailyTotals = todayNutrition.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein,
      carbs: totals.carbs + entry.carbs,
      fats: totals.fats + entry.fats
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const weightValues = data.metrics.weightTrend.map((item) => item.weight);
  const minWeight = Math.min(...weightValues);
  const maxWeight = Math.max(...weightValues);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel title={`${data.metrics.recoveryScore}/100`} eyebrow="Recovery" className="bg-accentSoft/80">
          <p className="text-sm text-muted">Sleep, energy, soreness, and stress blended into one daily readiness score.</p>
        </Panel>
        <Panel title={`${data.metrics.proteinAverage} g`} eyebrow="Protein Average">
          <p className="text-sm text-muted">Your rolling daily protein average across the current data set.</p>
        </Panel>
        <Panel title={`${data.workouts.length} sessions`} eyebrow="Workout Frequency">
          <p className="text-sm text-muted">Logged sessions this week including strength and volleyball work.</p>
        </Panel>
        <Panel title={`${dailyTotals.calories} kcal`} eyebrow="Today Nutrition">
          <p className="text-sm text-muted">Current daily meal total with macros captured below.</p>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <Panel title="Weight Trend" eyebrow="Bodyweight">
          <div className="flex h-40 items-end gap-3">
            {data.metrics.weightTrend.map((point) => {
              const range = maxWeight - minWeight || 1;
              const height = 30 + ((point.weight - minWeight) / range) * 100;

              return (
                <div key={point.date} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-accent to-lime-200"
                    style={{ height }}
                  />
                  <div className="text-center text-xs text-muted">
                    <div>{point.date}</div>
                    <div className="mt-1 text-text">{point.weight} kg</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Weekly Snapshot" eyebrow="Summary">
          <p className="text-sm leading-7 text-muted">{data.metrics.weeklySummary}</p>
          <div className="mt-5 space-y-3">
            {data.metrics.workoutFrequency.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="text-muted">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-background/80">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${Math.min(item.count * 28, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Today Meals" eyebrow="Nutrition Summary">
          <div className="grid gap-3 sm:grid-cols-2">
            {todayNutrition.map((meal) => (
              <div key={meal.id} className="rounded-2xl border border-line bg-background/60 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-muted">{meal.mealType}</div>
                <h4 className="mt-2 font-medium">{meal.foodDescription}</h4>
                <p className="mt-2 text-sm text-muted">
                  {meal.calories} kcal • P {meal.protein} • C {meal.carbs} • F {meal.fats}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Latest Workout" eyebrow="Performance">
          <div className="rounded-2xl border border-line bg-background/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-muted">
                  {data.workouts[0]?.trainingDayType ?? "No workout"}
                </div>
                <h4 className="mt-2 text-lg font-semibold">{data.workouts[0]?.date ?? "No date"}</h4>
              </div>
              <div className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">
                {data.workouts[0]?.exercises.length ?? 0} exercises
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {data.workouts[0]?.exercises.map((exercise) => (
                <div key={exercise.id} className="rounded-2xl border border-line px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{exercise.name}</span>
                    <span className="text-sm text-muted">
                      {exercise.performance.sets} x {exercise.performance.reps} @ {exercise.performance.weight} kg
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-muted">
                    Prev {exercise.previousWeight ?? "-"} kg • Suggest {exercise.suggestedWeight ?? "-"} kg
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
