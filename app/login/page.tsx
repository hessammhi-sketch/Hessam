"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Use magic link auth when Supabase is connected.");

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setStatus("Supabase is not configured yet. Add environment variables to enable private auth.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    setStatus(error ? error.message : "Magic link sent. Check your email.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[32px] border border-line bg-surface/80 p-6 shadow-panel">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Private Access</p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in to Hessam Health OS</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          This MVP uses Supabase magic links for a private single-user experience.
        </p>

        <form onSubmit={handleSignIn} className="mt-6 space-y-4">
          <label>
            <span className="mb-2 block text-sm text-muted">Email</span>
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <button type="submit" className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black">
            Send magic link
          </button>
        </form>

        <p className="mt-4 text-sm text-muted">{status}</p>
      </div>
    </main>
  );
}
