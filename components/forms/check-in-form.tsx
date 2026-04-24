"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";

const defaultState = {
  date: new Date().toISOString().slice(0, 10),
  morningWeight: "84.0",
  sleepHours: "7.5",
  energyLevel: "8",
  muscleSoreness: "4",
  stressLevel: "3",
  notes: ""
};

export function CheckInForm() {
  const [form, setForm] = useState(defaultState);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    startTransition(async () => {
      const response = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          morningWeight: Number(form.morningWeight),
          sleepHours: Number(form.sleepHours),
          energyLevel: Number(form.energyLevel),
          muscleSoreness: Number(form.muscleSoreness),
          stressLevel: Number(form.stressLevel)
        })
      });

      setStatus(response.ok ? "Check-in saved." : "Could not save check-in.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm text-muted">Date</span>
          <input type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} />
        </label>
        <label>
          <span className="mb-2 block text-sm text-muted">Morning weight</span>
          <input type="number" step="0.1" value={form.morningWeight} onChange={(event) => updateField("morningWeight", event.target.value)} />
        </label>
        <label>
          <span className="mb-2 block text-sm text-muted">Sleep hours</span>
          <input type="number" step="0.1" value={form.sleepHours} onChange={(event) => updateField("sleepHours", event.target.value)} />
        </label>
        <label>
          <span className="mb-2 block text-sm text-muted">Energy 1-10</span>
          <input type="number" min="1" max="10" value={form.energyLevel} onChange={(event) => updateField("energyLevel", event.target.value)} />
        </label>
        <label>
          <span className="mb-2 block text-sm text-muted">Soreness 1-10</span>
          <input type="number" min="1" max="10" value={form.muscleSoreness} onChange={(event) => updateField("muscleSoreness", event.target.value)} />
        </label>
        <label>
          <span className="mb-2 block text-sm text-muted">Stress 1-10</span>
          <input type="number" min="1" max="10" value={form.stressLevel} onChange={(event) => updateField("stressLevel", event.target.value)} />
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm text-muted">Notes</span>
        <textarea rows={4} value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
      </label>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted">{status ?? "Capture recovery, bodyweight, and readiness."}</p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save check-in"}
        </button>
      </div>
    </form>
  );
}
