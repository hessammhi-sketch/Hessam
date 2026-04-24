"use client";

import { useState, useTransition } from "react";
import { CoachResponse, DashboardPayload } from "@/lib/types";

export function CoachPanel({ data }: { data: DashboardPayload }) {
  const [response, setResponse] = useState<CoachResponse | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit() {
    startTransition(async () => {
      const result = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn: data.checkIns[0],
          workout: data.workouts[0],
          nutritionEntries: data.nutrition.filter((entry) => entry.date === data.checkIns[0]?.date)
        })
      });

      if (!result.ok) return;
      setResponse(await result.json());
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-line bg-background/50 p-5">
        <p className="text-sm leading-7 text-muted">
          Submit today&apos;s check-in, workout, and nutrition to get training feedback, recovery guidance,
          nutrition advice, tomorrow&apos;s plan, and one motivational line in Persian.
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="mt-4 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Analyzing..." : "Ask AI coach"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          ["Training Feedback", response?.trainingFeedback],
          ["Nutrition Feedback", response?.nutritionFeedback],
          ["Recovery Advice", response?.recoveryAdvice],
          ["Tomorrow Recommendation", response?.tomorrowRecommendation]
        ].map(([title, body]) => (
          <div key={title} className="rounded-[24px] border border-line bg-background/50 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-muted">{title}</div>
            <p className="mt-3 text-sm leading-7 text-text">
              {body ?? "Run the AI coach to see today’s personalized guidance."}
            </p>
          </div>
        ))}
      </div>

      <div dir="rtl" className="rounded-[24px] border border-accent/20 bg-accent/10 p-5">
        <div className="text-xs uppercase tracking-[0.24em] text-muted">Motivation | فارسي</div>
        <p className="mt-3 text-right text-base leading-8 text-text">
          {response?.persianMotivation ?? "پيام انگيزشي امروز بعد از اجراي تحليل هوش مصنوعي اينجا نمايش داده مي شود."}
        </p>
      </div>
    </div>
  );
}
