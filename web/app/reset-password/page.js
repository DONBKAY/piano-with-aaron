"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "../../lib/api";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="p-8">Loading...</main>}>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <h1 className="font-display text-2xl mb-3">Invalid reset link</h1>
          <p className="opacity-70 mb-6">
            This password reset link is missing or malformed.
          </p>
          <a href="/forgot-password" className="text-gold underline">
            Request a new one
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/60 dark:bg-deep/60 backdrop-blur rounded-2xl shadow-xl p-8 border border-gold/20">
        <h1 className="font-display text-3xl mb-1">Choose a new password</h1>
        <p className="text-sm opacity-70 mb-6">
          Enter and confirm your new password below.
        </p>

        {success ? (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            Password updated. Redirecting you to log in...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="text-sm font-medium">New password</label>
              <input
                required
                type="password"
                minLength={8}
                className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Confirm new password</label>
              <input
                required
                type="password"
                minLength={8}
                className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-gold text-ink font-semibold rounded-lg py-2.5 hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
} 
