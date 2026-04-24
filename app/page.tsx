import { CoachPanel } from "@/components/forms/coach-panel";
import { CheckInForm } from "@/components/forms/check-in-form";
import { NutritionForm } from "@/components/forms/nutrition-form";
import { WorkoutForm } from "@/components/forms/workout-form";
import { Dashboard } from "@/components/dashboard";
import { getDashboardData } from "@/lib/data";
import { isOpenAiConfigured, isSupabaseConfigured } from "@/lib/env";
import type { ReactNode } from "react";

function Module({
  title,
  description,
  children,
  rtl = false
}: {
  title: string;
  description: string;
  children: ReactNode;
  rtl?: boolean;
}) {
  return (
    <section
      dir={rtl ? "rtl" : "ltr"}
      className="rounded-[32px] border border-line bg-surface/75 p-5 shadow-panel sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="max-w-2xl text-sm leading-7 text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default async function HomePage() {
  const data = await getDashboardData();
  const supabaseReady = isSupabaseConfigured();
  const openAiReady = isOpenAiConfigured();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-line bg-surface/70 p-6 shadow-panel sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted">Hessam Health OS</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Private health and fitness command center for training, nutrition, recovery, and AI coaching.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-muted sm:text-base">
              Built as a clean MVP with Next.js, TypeScript, Tailwind, Supabase, and OpenAI. The app works in sample mode right away and switches to live mode when your keys are added.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[28px] border border-line bg-background/60 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-muted">Supabase</div>
              <div className="mt-3 text-xl font-semibold">{supabaseReady ? "Connected" : "Sample mode"}</div>
              <p className="mt-2 text-sm text-muted">Database and auth enable once env vars are present.</p>
            </div>
            <div className="rounded-[28px] border border-line bg-background/60 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-muted">OpenAI Coach</div>
              <div className="mt-3 text-xl font-semibold">{openAiReady ? "Live" : "Fallback mode"}</div>
              <p className="mt-2 text-sm text-muted">AI coaching falls back to a smart local response until API keys are added.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6">
        <Module title="Dashboard" description="A compact overview of bodyweight, training frequency, protein intake, and readiness.">
          <Dashboard data={data} />
        </Module>

        <div className="grid gap-6 xl:grid-cols-2">
          <Module title="Daily Check-in" description="Track weight, sleep, energy, soreness, stress, and daily notes.">
            <CheckInForm />
          </Module>

          <Module title="Workout Tracker" description="Log day type, exercise performance, previous weight, and overload suggestions.">
            <WorkoutForm />
          </Module>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Module title="Nutrition Tracker" description="Log meals and estimate calories, protein, carbs, and fats with a live daily summary.">
            <NutritionForm />
          </Module>

          <Module
            title="AI Coach"
            description="Generate training, nutrition, recovery, and tomorrow guidance with one motivational note in Persian."
            rtl
          >
            <CoachPanel data={data} />
          </Module>
        </div>
      </div>
    </main>
  );
}
