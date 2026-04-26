"use client";

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import { buildHealthOsViewModel } from "@/lib/app-shell";
import type { CoachResponse, DashboardPayload, TrainingDayType } from "@/lib/types";
import { calculateRecoveryScore, cn, inferProgressiveOverload } from "@/lib/utils";

type TabKey = "today" | "plan" | "activities" | "education" | "profile";

const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: "today", label: "Today", icon: "Sun" },
  { key: "plan", label: "Plan", icon: "Plan" },
  { key: "activities", label: "Activities", icon: "Bars" },
  { key: "education", label: "Amoozesh", icon: "Learn" },
  { key: "profile", label: "Profile", icon: "Me" }
];

function ShellCard({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[28px] border border-black/5 bg-white/90 p-5 shadow-[0_16px_40px_rgba(30,26,22,0.08)]", className)}>
      {children}
    </section>
  );
}

function StatChip({ label, value, tone = "light" }: { label: string; value: string; tone?: "light" | "accent" }) {
  return (
    <div
      className={cn(
        "rounded-[22px] px-4 py-3",
        tone === "accent" ? "bg-[#1e2a21] text-white" : "bg-[#fff4ec] text-[#1b1a18]"
      )}
    >
      <div className={cn("text-[11px] uppercase tracking-[0.24em]", tone === "accent" ? "text-white/65" : "text-[#8f7f72]")}>
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}

function BottomNav({
  activeTab,
  onChange
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-xl px-4 pb-4">
      <div className="grid grid-cols-5 rounded-[28px] border border-black/5 bg-white/95 p-2 shadow-[0_20px_45px_rgba(31,24,18,0.12)] backdrop-blur">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "rounded-[20px] px-2 py-3 text-center",
              activeTab === tab.key ? "bg-[#1f2d22] text-white" : "text-[#7c6e61]"
            )}
          >
            <div className="text-[11px] font-semibold">{tab.icon}</div>
            <div className="mt-1 text-[11px]">{tab.label}</div>
          </button>
        ))}
      </div>
    </nav>
  );
}

export function HealthOsApp({ data }: { data: DashboardPayload }) {
  const view = buildHealthOsViewModel(data);
  const todayTrainingType: TrainingDayType = data.workouts[0]?.trainingDayType ?? "Active Recovery";
  const [activeTab, setActiveTab] = useState<TabKey>("today");
  const [checkIn, setCheckIn] = useState({
    date: view.todayDate,
    morningWeight: data.checkIns[0]?.morningWeight.toString() ?? "84.2",
    sleepHours: data.checkIns[0]?.sleepHours.toString() ?? "7.5",
    energyLevel: data.checkIns[0]?.energyLevel.toString() ?? "8",
    muscleSoreness: data.checkIns[0]?.muscleSoreness.toString() ?? "4",
    stressLevel: data.checkIns[0]?.stressLevel.toString() ?? "3",
    notes: data.checkIns[0]?.notes ?? ""
  });
  const [workoutLog, setWorkoutLog] = useState(
    view.trainingPlan.map((exercise, index) => ({
      id: `today-ex-${index}`,
      name: exercise.name,
      done: true,
      sets: String(exercise.sets),
      reps: String(exercise.reps),
      weight: String(exercise.targetWeight),
      previousWeight: String(exercise.previousWeight ?? exercise.targetWeight),
      notes: exercise.note
    }))
  );
  const [nutritionLog, setNutritionLog] = useState(
    view.meals.map((meal, index) => ({
      id: `meal-${index}`,
      slot: meal.slot,
      eaten: true,
      title: meal.title,
      calories: String(meal.calories),
      protein: String(meal.protein),
      carbs: String(meal.carbs),
      fats: String(meal.fats)
    }))
  );
  const [weeklyProfile, setWeeklyProfile] = useState({
    currentWeight: data.checkIns[0]?.morningWeight.toString() ?? "84.2",
    waist: "82",
    sleepQuality: "Strong",
    focus: "Stay lean, keep streak, improve back and shoulder detail"
  });
  const [checkInStatus, setCheckInStatus] = useState<string | null>(null);
  const [workoutStatus, setWorkoutStatus] = useState<string | null>(null);
  const [nutritionStatus, setNutritionStatus] = useState<string | null>(null);
  const [coachResponse, setCoachResponse] = useState<CoachResponse | null>(null);
  const [pending, startTransition] = useTransition();

  const recoveryScore = calculateRecoveryScore({
    id: "local",
    date: checkIn.date,
    morningWeight: Number(checkIn.morningWeight),
    sleepHours: Number(checkIn.sleepHours),
    energyLevel: Number(checkIn.energyLevel),
    muscleSoreness: Number(checkIn.muscleSoreness),
    stressLevel: Number(checkIn.stressLevel),
    notes: checkIn.notes
  });

  const readinessMessage =
    recoveryScore >= 80
      ? "Green light. Push intensity, keep form clean, and earn the progression."
      : recoveryScore >= 65
        ? "Solid day. Train hard, but keep one layer of control in reserve."
        : "Recovery is asking for a smarter day. Pull volume down and protect the streak.";

  const loggedMacros = nutritionLog.reduce(
    (acc, meal) => ({
      calories: acc.calories + Number(meal.calories || 0),
      protein: acc.protein + Number(meal.protein || 0),
      carbs: acc.carbs + Number(meal.carbs || 0),
      fats: acc.fats + Number(meal.fats || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  async function saveCheckIn() {
    setCheckInStatus(null);
    const response = await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: checkIn.date,
        morningWeight: Number(checkIn.morningWeight),
        sleepHours: Number(checkIn.sleepHours),
        energyLevel: Number(checkIn.energyLevel),
        muscleSoreness: Number(checkIn.muscleSoreness),
        stressLevel: Number(checkIn.stressLevel),
        notes: checkIn.notes
      })
    });

    setCheckInStatus(response.ok ? "Daily check-in updated." : "Could not update check-in.");
  }

  async function saveWorkout() {
    setWorkoutStatus(null);
    const response = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: checkIn.date,
        trainingDayType: todayTrainingType,
        notes: `Auto-updated from Today tab with readiness score ${recoveryScore}.`,
        exercises: workoutLog
          .filter((exercise) => exercise.done)
          .map((exercise) => {
            const previousWeight = Number(exercise.previousWeight);
            const reps = Number(exercise.reps);

            return {
              id: exercise.id,
              name: exercise.name,
              notes: exercise.notes,
              previousWeight,
              suggestedWeight: inferProgressiveOverload(previousWeight, reps),
              performance: {
                sets: Number(exercise.sets),
                reps,
                weight: Number(exercise.weight)
              }
            };
          })
      })
    });

    setWorkoutStatus(response.ok ? "Workout log saved." : "Could not save workout.");
  }

  async function saveNutrition() {
    setNutritionStatus(null);
    const response = await fetch("/api/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entries: nutritionLog
          .filter((meal) => meal.eaten)
          .map((meal) => ({
            date: checkIn.date,
            mealType: meal.slot.toLowerCase(),
            foodDescription: meal.title,
            calories: Number(meal.calories),
            protein: Number(meal.protein),
            carbs: Number(meal.carbs),
            fats: Number(meal.fats)
          }))
      })
    });

    setNutritionStatus(response.ok ? "Nutrition log saved." : "Could not save nutrition.");
  }

  function requestCoachUpdate() {
    startTransition(async () => {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn: {
            id: "today",
            date: checkIn.date,
            morningWeight: Number(checkIn.morningWeight),
            sleepHours: Number(checkIn.sleepHours),
            energyLevel: Number(checkIn.energyLevel),
            muscleSoreness: Number(checkIn.muscleSoreness),
            stressLevel: Number(checkIn.stressLevel),
            notes: checkIn.notes
          },
          workout: {
            id: "today-workout",
            date: checkIn.date,
            trainingDayType: todayTrainingType,
            notes: readinessMessage,
            exercises: workoutLog.map((exercise) => ({
              id: exercise.id,
              name: exercise.name,
              notes: exercise.notes,
              previousWeight: Number(exercise.previousWeight),
              suggestedWeight: inferProgressiveOverload(
                Number(exercise.previousWeight),
                Number(exercise.reps)
              ),
              performance: {
                sets: Number(exercise.sets),
                reps: Number(exercise.reps),
                weight: Number(exercise.weight)
              }
            }))
          },
          nutritionEntries: nutritionLog.map((meal, index) => ({
            id: `coach-meal-${index}`,
            date: checkIn.date,
            mealType: meal.slot.toLowerCase(),
            foodDescription: meal.title,
            calories: Number(meal.calories),
            protein: Number(meal.protein),
            carbs: Number(meal.carbs),
            fats: Number(meal.fats)
          }))
        })
      });

      if (!response.ok) return;
      setCoachResponse(await response.json());
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 pb-28 pt-6 text-[#171411]">
      <div className="absolute inset-x-0 top-0 -z-10 h-[320px] bg-[radial-gradient(circle_at_top,_rgba(255,129,76,0.24),_transparent_45%),radial-gradient(circle_at_right,_rgba(102,197,154,0.18),_transparent_35%)]" />

      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff7d4d] text-sm font-semibold text-white">
            H
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.26em] text-[#9d8e80]">Hessam Health OS</div>
            <div className="mt-1 text-lg font-semibold">Welcome back, {view.name}</div>
          </div>
        </div>
        <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#574f48] shadow-sm">
          Day {view.streakDays}
        </div>
      </header>

      <ShellCard className="overflow-hidden bg-[linear-gradient(135deg,#1e2a21_0%,#28392d_58%,#31453a_100%)] text-white">
        <div className="text-xs uppercase tracking-[0.28em] text-white/65">Today</div>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.05]">
          Your day is planned. Log the real version and let the app adapt.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-white/74">{view.todaySummary}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatChip label="Focus" value={view.todayFocus} tone="accent" />
          <StatChip label="Recovery" value={`${recoveryScore}/100`} tone="accent" />
        </div>
      </ShellCard>

      <div className="mt-5">
        {activeTab === "today" && (
          <div className="space-y-4">
            <ShellCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-[#9d8e80]">Daily direction</div>
                  <h2 className="mt-2 text-2xl font-semibold">Today plan</h2>
                </div>
                <div className="rounded-full bg-[#e8fff3] px-3 py-2 text-xs font-semibold text-[#18724e]">
                  Streak {view.streakDays}
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[#62584f]">{readinessMessage}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <StatChip label="Macros" value={view.macroTarget} />
                <StatChip label="Hydration" value={view.hydrationTarget} />
              </div>
            </ShellCard>

            <ShellCard>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-[#9d8e80]">Check-in</div>
                  <h2 className="mt-2 text-xl font-semibold">Morning readiness</h2>
                </div>
                <button
                  type="button"
                  onClick={saveCheckIn}
                  className="rounded-full bg-[#ff7d4d] px-4 py-2 text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label>
                  <span className="mb-2 block text-sm text-[#7a6c60]">Weight</span>
                  <input value={checkIn.morningWeight} onChange={(event) => setCheckIn((current) => ({ ...current, morningWeight: event.target.value }))} />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-[#7a6c60]">Sleep</span>
                  <input value={checkIn.sleepHours} onChange={(event) => setCheckIn((current) => ({ ...current, sleepHours: event.target.value }))} />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-[#7a6c60]">Energy</span>
                  <input value={checkIn.energyLevel} onChange={(event) => setCheckIn((current) => ({ ...current, energyLevel: event.target.value }))} />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-[#7a6c60]">Stress</span>
                  <input value={checkIn.stressLevel} onChange={(event) => setCheckIn((current) => ({ ...current, stressLevel: event.target.value }))} />
                </label>
              </div>
              <label className="mt-3 block">
                <span className="mb-2 block text-sm text-[#7a6c60]">Notes</span>
                <textarea rows={3} value={checkIn.notes} onChange={(event) => setCheckIn((current) => ({ ...current, notes: event.target.value }))} />
              </label>
              <p className="mt-3 text-sm text-[#7a6c60]">{checkInStatus ?? "Log your baseline first so today suggestions can react to real recovery."}</p>
            </ShellCard>

            <ShellCard>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-[#9d8e80]">Training</div>
                  <h2 className="mt-2 text-xl font-semibold">Today workout</h2>
                </div>
                <button
                  type="button"
                  onClick={saveWorkout}
                  className="rounded-full bg-[#1f2d22] px-4 py-2 text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {workoutLog.map((exercise, index) => {
                  const suggestion = inferProgressiveOverload(
                    Number(exercise.previousWeight),
                    Number(exercise.reps)
                  );

                  return (
                    <div key={exercise.id} className="rounded-[24px] bg-[#fff6ef] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-lg font-semibold">{exercise.name}</div>
                          <div className="mt-1 text-sm text-[#7a6c60]">Suggested load {suggestion ?? exercise.weight} kg</div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setWorkoutLog((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, done: !item.done } : item
                              )
                            )
                          }
                          className={cn(
                            "rounded-full px-3 py-2 text-xs font-semibold",
                            exercise.done ? "bg-[#1f2d22] text-white" : "bg-white text-[#7a6c60]"
                          )}
                        >
                          {exercise.done ? "Logged" : "Pending"}
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <label>
                          <span className="mb-2 block text-sm text-[#7a6c60]">Sets</span>
                          <input
                            value={exercise.sets}
                            onChange={(event) =>
                              setWorkoutLog((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, sets: event.target.value } : item
                                )
                              )
                            }
                          />
                        </label>
                        <label>
                          <span className="mb-2 block text-sm text-[#7a6c60]">Reps</span>
                          <input
                            value={exercise.reps}
                            onChange={(event) =>
                              setWorkoutLog((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, reps: event.target.value } : item
                                )
                              )
                            }
                          />
                        </label>
                        <label>
                          <span className="mb-2 block text-sm text-[#7a6c60]">Weight</span>
                          <input
                            value={exercise.weight}
                            onChange={(event) =>
                              setWorkoutLog((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, weight: event.target.value } : item
                                )
                              )
                            }
                          />
                        </label>
                      </div>
                      <label className="mt-3 block">
                        <span className="mb-2 block text-sm text-[#7a6c60]">Coach note</span>
                        <textarea
                          rows={2}
                          value={exercise.notes}
                          onChange={(event) =>
                            setWorkoutLog((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, notes: event.target.value } : item
                              )
                            )
                          }
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-sm text-[#7a6c60]">{workoutStatus ?? "The suggested load updates from previous performance and today's readiness."}</p>
            </ShellCard>

            <ShellCard>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-[#9d8e80]">Nutrition</div>
                  <h2 className="mt-2 text-xl font-semibold">Today meals</h2>
                </div>
                <button
                  type="button"
                  onClick={saveNutrition}
                  className="rounded-full bg-[#ff7d4d] px-4 py-2 text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <StatChip label="Logged" value={`${loggedMacros.calories} kcal`} />
                <StatChip label="Protein" value={`${loggedMacros.protein} g`} />
              </div>
              <div className="mt-4 space-y-3">
                {nutritionLog.map((meal, index) => (
                  <div key={meal.id} className="rounded-[24px] bg-[#f4fbf8] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.24em] text-[#6ca588]">{meal.slot}</div>
                        <div className="mt-1 text-lg font-semibold">{meal.title}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setNutritionLog((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, eaten: !item.eaten } : item
                            )
                          )
                        }
                        className={cn(
                          "rounded-full px-3 py-2 text-xs font-semibold",
                          meal.eaten ? "bg-[#1f2d22] text-white" : "bg-white text-[#7a6c60]"
                        )}
                      >
                        {meal.eaten ? "Done" : "Skip"}
                      </button>
                    </div>
                    <label className="mt-3 block">
                      <span className="mb-2 block text-sm text-[#7a6c60]">What you ate</span>
                      <input
                        value={meal.title}
                        onChange={(event) =>
                          setNutritionLog((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, title: event.target.value } : item
                            )
                          )
                        }
                      />
                    </label>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {[
                        ["calories", "Kcal"],
                        ["protein", "P"],
                        ["carbs", "C"],
                        ["fats", "F"]
                      ].map(([field, label]) => (
                        <label key={field}>
                          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-[#7a6c60]">{label}</span>
                          <input
                            value={meal[field as "calories" | "protein" | "carbs" | "fats"]}
                            onChange={(event) =>
                              setNutritionLog((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, [field]: event.target.value } : item
                                )
                              )
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-[#7a6c60]">{nutritionStatus ?? "Start with the suggested plan, then overwrite it with what actually happened."}</p>
            </ShellCard>

            <ShellCard className="bg-[#fff4ec]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-[#9d8e80]">AI coach</div>
                  <h2 className="mt-2 text-xl font-semibold">Update me from today's data</h2>
                </div>
                <button
                  type="button"
                  onClick={requestCoachUpdate}
                  disabled={pending}
                  className="rounded-full bg-[#1f2d22] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {pending ? "Analyzing" : "Refresh coach"}
                </button>
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  ["Training", coachResponse?.trainingFeedback],
                  ["Nutrition", coachResponse?.nutritionFeedback],
                  ["Recovery", coachResponse?.recoveryAdvice],
                  ["Tomorrow", coachResponse?.tomorrowRecommendation]
                ].map(([title, body]) => (
                  <div key={title} className="rounded-[20px] bg-white px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.22em] text-[#9d8e80]">{title}</div>
                    <p className="mt-2 text-sm leading-7 text-[#5f554d]">
                      {body ?? "Use today's real inputs and the coach will tighten the recommendation."}
                    </p>
                  </div>
                ))}
              </div>
              <div dir="rtl" className="mt-4 rounded-[20px] bg-[#1f2d22] px-4 py-4 text-white">
                <div className="text-xs uppercase tracking-[0.22em] text-white/60">Motivation</div>
                <p className="mt-2 text-right text-sm leading-8">
                  {coachResponse?.persianMotivation ?? "امروز لازم نيست کامل باشي؛ لازم است منظم بماني و داده درست به برنامه بدهي."}
                </p>
              </div>
            </ShellCard>
          </div>
        )}

        {activeTab === "plan" && (
          <div className="space-y-4">
            <ShellCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-[#9d8e80]">Roadmap</div>
                  <h2 className="mt-2 text-2xl font-semibold">Your current path</h2>
                </div>
                <div className="rounded-full bg-[#e8fff3] px-3 py-2 text-xs font-semibold text-[#18724e]">
                  Day {view.streakDays}
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[#62584f]">
                Stay on the 52-day momentum, keep four quality strength sessions, and adjust recovery instead of breaking consistency.
              </p>
            </ShellCard>

            <ShellCard className="bg-[#fff4ec]">
              <div className="text-xs uppercase tracking-[0.26em] text-[#9d8e80]">Weekly rhythm</div>
              <div className="mt-4 space-y-3">
                {view.weeklyPlan.map((day) => (
                  <div key={day.day} className="flex items-center gap-4 rounded-[22px] bg-white p-4">
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold",
                        day.status === "done"
                          ? "bg-[#1f2d22] text-white"
                          : day.status === "today"
                            ? "bg-[#ff7d4d] text-white"
                            : "bg-[#f4efe9] text-[#6f6359]"
                      )}
                    >
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{day.focus}</div>
                      <div className="mt-1 text-sm text-[#7a6c60]">
                        {day.status === "done"
                          ? "Completed"
                          : day.status === "today"
                            ? "Live today"
                            : "Upcoming"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ShellCard>

            <ShellCard>
              <div className="text-xs uppercase tracking-[0.26em] text-[#9d8e80]">Milestones</div>
              <div className="mt-4 grid gap-3">
                <StatChip label="Next streak goal" value="60 days" />
                <StatChip label="Body comp target" value="82.5 kg leaner and sharper" />
                <StatChip label="Performance target" value="Pull day loads up by 2 to 4%" />
              </div>
            </ShellCard>
          </div>
        )}

        {activeTab === "activities" && (
          <div className="space-y-4">
            <ShellCard>
              <div className="text-xs uppercase tracking-[0.26em] text-[#9d8e80]">Weekly view</div>
              <h2 className="mt-2 text-2xl font-semibold">Activities</h2>
              <div className="mt-5 grid grid-cols-4 gap-3">
                {view.weeklyActivity.map((item) => (
                  <div key={item.label} className="rounded-[22px] bg-[#fff6ef] p-4 text-center">
                    <div className="text-xl font-semibold">{item.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8f7f72]">{item.label}</div>
                  </div>
                ))}
              </div>
            </ShellCard>

            <ShellCard className="bg-[#f4fbf8]">
              <div className="text-xs uppercase tracking-[0.26em] text-[#79a790]">Weekly bars</div>
              <div className="mt-5 flex h-48 items-end gap-3">
                {view.monthlyActivity.map((item) => (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                    <div
                      className="w-full rounded-t-[18px] bg-[linear-gradient(180deg,#ff8f64_0%,#ff7d4d_100%)]"
                      style={{ height: `${item.value}%` }}
                    />
                    <div className="text-xs text-[#617267]">{item.label}</div>
                  </div>
                ))}
              </div>
            </ShellCard>

            <ShellCard>
              <div className="text-xs uppercase tracking-[0.26em] text-[#9d8e80]">Monthly weight</div>
              <div className="mt-5 flex items-end gap-3">
                {view.monthlyWeights.map((item) => {
                  const min = Math.min(...view.monthlyWeights.map((point) => point.value));
                  const max = Math.max(...view.monthlyWeights.map((point) => point.value));
                  const range = max - min || 1;
                  const height = 50 + ((item.value - min) / range) * 90;

                  return (
                    <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                      <div className="w-full rounded-t-[18px] bg-[#1f2d22]" style={{ height }} />
                      <div className="text-center text-xs text-[#7a6c60]">
                        <div>{item.label}</div>
                        <div className="mt-1 font-semibold text-[#1f1a15]">{item.value} kg</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ShellCard>
          </div>
        )}

        {activeTab === "education" && (
          <div className="space-y-4">
            <ShellCard>
              <div className="text-xs uppercase tracking-[0.26em] text-[#9d8e80]">Amoozesh</div>
              <h2 className="mt-2 text-2xl font-semibold">Training notes that actually matter</h2>
              <p className="mt-4 text-sm leading-7 text-[#62584f]">
                Keep this tab for practical reminders, not noise. Short, useful, and tied to your training week.
              </p>
            </ShellCard>

            {view.educationTips.map((tip) => (
              <ShellCard key={tip.title} className="bg-[#fff6ef]">
                <div className="text-xs uppercase tracking-[0.22em] text-[#ff7d4d]">{tip.category}</div>
                <h3 className="mt-2 text-xl font-semibold">{tip.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f554d]">{tip.body}</p>
              </ShellCard>
            ))}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-4">
            <ShellCard>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff7d4d] text-xl font-semibold text-white">
                  H
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-[#9d8e80]">Profile</div>
                  <h2 className="mt-2 text-2xl font-semibold">{view.name}</h2>
                  <p className="mt-1 text-sm text-[#62584f]">This is where the app keeps the context it needs to design the right plan.</p>
                </div>
              </div>
            </ShellCard>

            <ShellCard className="bg-[#f4fbf8]">
              <div className="text-xs uppercase tracking-[0.26em] text-[#79a790]">Core stats</div>
              <div className="mt-4 grid gap-3">
                {view.profileFields.map((field) => (
                  <div key={field.label} className="flex items-center justify-between rounded-[20px] bg-white px-4 py-4">
                    <span className="text-sm text-[#6e756f]">{field.label}</span>
                    <span className="text-right font-semibold">{field.value}</span>
                  </div>
                ))}
              </div>
            </ShellCard>

            <ShellCard>
              <div className="text-xs uppercase tracking-[0.26em] text-[#9d8e80]">Weekly refresh</div>
              <h3 className="mt-2 text-xl font-semibold">Update these once a week</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label>
                  <span className="mb-2 block text-sm text-[#7a6c60]">Current weight</span>
                  <input value={weeklyProfile.currentWeight} onChange={(event) => setWeeklyProfile((current) => ({ ...current, currentWeight: event.target.value }))} />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-[#7a6c60]">Waist</span>
                  <input value={weeklyProfile.waist} onChange={(event) => setWeeklyProfile((current) => ({ ...current, waist: event.target.value }))} />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-[#7a6c60]">Sleep quality</span>
                  <input value={weeklyProfile.sleepQuality} onChange={(event) => setWeeklyProfile((current) => ({ ...current, sleepQuality: event.target.value }))} />
                </label>
                <label className="col-span-2">
                  <span className="mb-2 block text-sm text-[#7a6c60]">Main focus now</span>
                  <textarea rows={3} value={weeklyProfile.focus} onChange={(event) => setWeeklyProfile((current) => ({ ...current, focus: event.target.value }))} />
                </label>
              </div>
            </ShellCard>

            <ShellCard className="bg-[#fff4ec]">
              <div className="text-xs uppercase tracking-[0.26em] text-[#9d8e80]">Questions to ask weekly</div>
              <div className="mt-4 space-y-3">
                {view.weeklyQuestions.map((question) => (
                  <div key={question} className="rounded-[20px] bg-white px-4 py-4 text-sm leading-7 text-[#5f554d]">
                    {question}
                  </div>
                ))}
              </div>
            </ShellCard>
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </main>
  );
}
