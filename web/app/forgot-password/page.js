"use client";

import { useState } from "react";
import { authApi } from "../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/60 dark:bg-deep/60 backdrop-blur rounded-2xl shadow-xl p-8 border border-gold/20">
        <h1 className="font-display text-3xl mb-1">Reset your password</h1>
        <p className="text-sm opacity-70 mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {message && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {message}
          </div>
        )}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-gold text-ink font-semibold rounded-lg py-2.5 hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </main>
  );
}
