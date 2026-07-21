"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_URL, authApi, saveSession } from "../../lib/api";

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

  useEffect(() => {
    const googleError = searchParams.get("google_error");

    if (!googleError) return;

    const errorMessages = {
      authentication_failed:
        "Google sign-in was not completed. Please try again.",
      callback_failed:
        "Google sign-in could not be completed. Please try again.",
    };

    setError(
      errorMessages[googleError] ||
        "Google sign-in failed. Please try again."
    );
  }, [searchParams]);

  function getSafeNextUrl() {
    const next = searchParams.get("next");

    if (!next) return null;

    if (!next.startsWith("/") || next.startsWith("//")) {
      return null;
    }

    return next;
  }

  function handleGoogleLogin() {
    setError("");

    const nextUrl = getSafeNextUrl();

    if (nextUrl) {
      sessionStorage.setItem("pwa_google_next", nextUrl);
    } else {
      sessionStorage.removeItem("pwa_google_next");
    }

    window.location.href = `${API_URL}/auth/google`;
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

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-black/15 bg-white px-4 py-2.5 font-medium text-black transition hover:bg-black/5"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
          >
            <path
              fill="#4285F4"
              d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.39a4.61 4.61 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.97-4.33 2.97-7.4Z"
            />
            <path
              fill="#34A853"
              d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.24-2.52c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.12H3.04v2.6A10 10 0 0 0 12 22Z"
            />
            <path
              fill="#FBBC05"
              d="M6.39 13.88A6 6 0 0 1 6.08 12c0-.65.11-1.29.31-1.88v-2.6H3.04A10 10 0 0 0 2 12c0 1.61.38 3.13 1.04 4.48l3.35-2.6Z"
            />
            <path
              fill="#EA4335"
              d="M12 6c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.6C7.18 7.76 9.39 6 12 6Z"
            />
          </svg>

          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          <span className="text-xs uppercase tracking-wider opacity-50">
            or
          </span>
          <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </div>

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
