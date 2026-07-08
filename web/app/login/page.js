"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, saveToken } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await authApi.login(form);
      saveToken(token);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/60 dark:bg-deep/60 backdrop-blur rounded-2xl shadow-xl p-8 border border-gold/20">
        <h1 className="font-display text-3xl mb-1">Welcome back</h1>
        <p className="text-sm opacity-70 mb-6">Log in to continue your lessons.</p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              required
              type="email"
              className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Password</label>
              <a href="/forgot-password" className="text-xs text-gold">
                Forgot password?
              </a>
            </div>
            <input
              required
              type="password"
              className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-gold text-ink font-semibold rounded-lg py-2.5 hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-sm mt-6 text-center opacity-70">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-gold font-medium">
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}
