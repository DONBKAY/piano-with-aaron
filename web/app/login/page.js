"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi, saveSession } from "../../lib/api";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getSafeNextUrl() {
    const next = searchParams.get("next");

    if (!next) return null;

    if (!next.startsWith("/") || next.startsWith("//")) {
      return null;
    }

    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await authApi.login(form);

      saveSession(data.token, data.user);

      const nextUrl = getSafeNextUrl();

      if (nextUrl) {
        window.location.href = nextUrl;
        return;
      }

      if (data.user.role === "ADMIN") {
        window.location.href = "/admin";
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message || "Unable to log in");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gold/20 bg-white/60 p-8 shadow-xl backdrop-blur dark:bg-deep/60">
        <h1 className="font-display text-3xl">Welcome back</h1>

        <p className="mb-6 mt-1 text-sm opacity-70">
          Log in to continue your piano lessons.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>

            <input
              id="email"
              required
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value,
                })
              }
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-xs text-gold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              required
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
              value={form.password}
              onChange={(event) =>
                setForm({
                  ...form,
                  password: event.target.value,
                })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gold py-2.5 font-semibold text-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm opacity-70">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-gold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
