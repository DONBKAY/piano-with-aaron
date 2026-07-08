"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, saveToken } from "../../lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await authApi.signup(form);
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
        <h1 className="font-display text-3xl mb-1">Create your account</h1>
        <p className="text-sm opacity-70 mb-6">Start playing piano today.</p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input
              required
              className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
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
            <label className="text-sm font-medium">Password</label>
            <input
              required
              type="password"
              minLength={8}
              className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-gold text-ink font-semibold rounded-lg py-2.5 hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-sm mt-6 text-center opacity-70">
          Already have an account?{" "}
          <a href="/login" className="text-gold font-medium">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}
