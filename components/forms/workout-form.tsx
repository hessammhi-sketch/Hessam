"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { TrainingDayType } from "@/lib/types";
import { inferProgressiveOverload } from "@/lib/utils";

const dayTypes: TrainingDayType[] = [
  "Pull",
  "Push",
  "Legs",
  "Active Recovery",
  "Volleyball",
  "Rest"
];

export function WorkoutForm() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [trainingDayType, setTrainingDayType] = useState<TrainingDayType>("Pull");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState([
    {
      name: "Barbell Row",
      sets: "4",
      reps: "8",
      weight: "72.5",
      previousWeight: "70",
      notes: ""
    }
  ]);

  function updateExercise(index: number, name: string, value: string) {
    setExercises((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, [name]: value } : exercise
      )
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    startTransition(async () => {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          trainingDayType,
          notes,
          exercises: exercises.map((exercise, index) => {
            const previousWeight = Number(exercise.previousWeight);
            const reps = Number(exercise.reps);

            return {
              id: `draft-${index}`,
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

      setStatus(response.ok ? "Workout saved." : "Could not save workout.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm text-muted">Date</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label>
          <span className="mb-2 block text-sm text-muted">Training day type</span>
          <select value={trainingDayType} onChange={(event) => setTrainingDayType(event.target.value as TrainingDayType)}>
            {dayTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-4">
        {exercises.map((exercise, index) => {
          const suggestion = inferProgressiveOverload(
            Number(exercise.previousWeight),
            Number(exercise.reps)
          );

          return (
            <div key={index} className="rounded-[24px] border border-line bg-background/50 p-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <label className="xl:col-span-2">
                  <span className="mb-2 block text-sm text-muted">Exercise</span>
                  <input value={exercise.name} onChange={(event) => updateExercise(index, "name", event.target.value)} />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-muted">Sets</span>
                  <input type="number" value={exercise.sets} onChange={(event) => updateExercise(index, "sets", event.target.value)} />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-muted">Reps</span>
                  <input type="number" value={exercise.reps} onChange={(event) => updateExercise(index, "reps", event.target.value)} />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-muted">Weight</span>
                  <input type="number" step="0.1" value={exercise.weight} onChange={(event) => updateExercise(index, "weight", event.target.value)} />
                </label>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm text-muted">Previous weight</span>
                  <input type="number" step="0.1" value={exercise.previousWeight} onChange={(event) => updateExercise(index, "previousWeight", event.target.value)} />
                </label>
                <div className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-muted">
                  Progressive overload suggestion: <span className="font-semibold text-text">{suggestion ?? "-"} kg</span>
                </div>
              </div>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm text-muted">Exercise notes</span>
                <textarea rows={3} value={exercise.notes} onChange={(event) => updateExercise(index, "notes", event.target.value)} />
              </label>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-full border border-line px-4 py-2 text-sm text-text hover:border-accent"
          onClick={() =>
            setExercises((current) => [
              ...current,
              { name: "", sets: "3", reps: "10", weight: "0", previousWeight: "0", notes: "" }
            ])
          }
        >
          Add exercise
        </button>
        <p className="text-sm text-muted">{status ?? "Log movements, compare load, and track progress."}</p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save workout"}
        </button>
      </div>

      <label>
        <span className="mb-2 block text-sm text-muted">Workout notes</span>
        <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>
    </form>
  );
}
