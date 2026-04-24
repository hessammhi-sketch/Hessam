"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { MealType } from "@/lib/types";

const mealTypes: MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snacks",
  "pre-workout",
  "post-workout"
];

export function NutritionForm() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState([
    {
      mealType: "breakfast",
      foodDescription: "Eggs, toast, yogurt",
      calories: "550",
      protein: "38",
      carbs: "45",
      fats: "22"
    }
  ]);

  function updateEntry(index: number, name: string, value: string) {
    setEntries((current) =>
      current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, [name]: value } : entry))
    );
  }

  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + Number(entry.calories || 0),
      protein: acc.protein + Number(entry.protein || 0),
      carbs: acc.carbs + Number(entry.carbs || 0),
      fats: acc.fats + Number(entry.fats || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    startTransition(async () => {
      const response = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: entries.map((entry) => ({
            date,
            mealType: entry.mealType,
            foodDescription: entry.foodDescription,
            calories: Number(entry.calories),
            protein: Number(entry.protein),
            carbs: Number(entry.carbs),
            fats: Number(entry.fats)
          }))
        })
      });

      setStatus(response.ok ? "Nutrition saved." : "Could not save nutrition.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label>
        <span className="mb-2 block text-sm text-muted">Date</span>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="rounded-[24px] border border-line bg-background/50 p-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <label>
                <span className="mb-2 block text-sm text-muted">Meal type</span>
                <select value={entry.mealType} onChange={(event) => updateEntry(index, "mealType", event.target.value)}>
                  {mealTypes.map((mealType) => (
                    <option key={mealType} value={mealType}>
                      {mealType}
                    </option>
                  ))}
                </select>
              </label>
              <label className="xl:col-span-2">
                <span className="mb-2 block text-sm text-muted">Food description</span>
                <input value={entry.foodDescription} onChange={(event) => updateEntry(index, "foodDescription", event.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm text-muted">Calories</span>
                <input type="number" value={entry.calories} onChange={(event) => updateEntry(index, "calories", event.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm text-muted">Protein</span>
                <input type="number" value={entry.protein} onChange={(event) => updateEntry(index, "protein", event.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm text-muted">Carbs</span>
                <input type="number" value={entry.carbs} onChange={(event) => updateEntry(index, "carbs", event.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm text-muted">Fats</span>
                <input type="number" value={entry.fats} onChange={(event) => updateEntry(index, "fats", event.target.value)} />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[24px] border border-accent/20 bg-accent/10 p-4">
        <div className="text-sm text-muted">Daily summary</div>
        <div className="mt-2 text-sm font-medium text-text">
          {totals.calories} kcal • Protein {totals.protein} g • Carbs {totals.carbs} g • Fats {totals.fats} g
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-full border border-line px-4 py-2 text-sm text-text hover:border-accent"
          onClick={() =>
            setEntries((current) => [
              ...current,
              {
                mealType: "snacks",
                foodDescription: "",
                calories: "0",
                protein: "0",
                carbs: "0",
                fats: "0"
              }
            ])
          }
        >
          Add meal
        </button>
        <p className="text-sm text-muted">{status ?? "Track meals and macro estimates quickly."}</p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save nutrition"}
        </button>
      </div>
    </form>
  );
}
