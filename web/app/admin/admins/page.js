"use client";

import { useState } from "react";
import { API_URL, getToken } from "../../../lib/api";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AdminManagementPage() {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (successMessage) {
      setSuccessMessage("");
    }

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setErrorMessage("Full name and email address are required.");
      return;
    }

    if (form.password.length < 8) {
      setErrorMessage(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const token = getToken();

    if (!token) {
      setErrorMessage(
        "Your login session has expired. Please log in again."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/auth/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create administrator account."
        );
      }

      setSuccessMessage(
        data.message || "Administrator account created successfully."
      );

      setForm(initialForm);
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to create administrator account."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold">
          User Management
        </p>

        <h1 className="font-display text-3xl font-bold md:text-4xl">
          Administrators
        </h1>

        <p className="mt-3 max-w-2xl opacity-70">
          Create another administrator account. Administrators can
          access the admin portal and manage the learning platform.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-gold/20 bg-white/70 p-6 shadow-sm dark:bg-deep/60 md:p-8">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold">
              Register New Administrator
            </h2>

            <p className="mt-2 text-sm opacity-65">
              Enter the details of the person who should receive
              administrative access.
            </p>
          </div>

          {successMessage ? (
            <div
              role="status"
              className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm"
            >
              {successMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm"
            >
              {errorMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold"
              >
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter administrator's full name"
                autoComplete="name"
                minLength={2}
                maxLength={100}
                required
                disabled={submitting}
                className="w-full rounded-xl border border-gold/25 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-ink"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                autoComplete="email"
                required
                disabled={submitting}
                className="w-full rounded-xl border border-gold/25 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-ink"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  disabled={submitting}
                  className="w-full rounded-xl border border-gold/25 bg-white px-4 py-3 pr-20 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-ink"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  disabled={submitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold opacity-65 hover:opacity-100"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Enter the password again"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  disabled={submitting}
                  className="w-full rounded-xl border border-gold/25 bg-white px-4 py-3 pr-20 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-ink"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  disabled={submitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold opacity-65 hover:opacity-100"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gold px-5 py-3 font-bold text-ink transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Creating Administrator..."
                : "Create Administrator"}
            </button>
          </form>
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-gold/20 bg-gold/10 p-6">
            <div className="mb-3 text-3xl" aria-hidden="true">
              🛡️
            </div>

            <h2 className="font-display text-xl font-bold">
              Administrator Access
            </h2>

            <p className="mt-3 text-sm leading-6 opacity-70">
              Administrators may manage courses, students, payments,
              reviews, categories and other protected parts of the
              platform.
            </p>
          </div>

          <div className="rounded-2xl border border-gold/20 bg-white/60 p-6 dark:bg-deep/50">
            <h2 className="font-semibold">Security reminder</h2>

            <p className="mt-3 text-sm leading-6 opacity-70">
              Only create accounts for trusted people. Ask the new
              administrator to change their password after logging in.
            </p>
          </div>

          <div className="rounded-2xl border border-gold/20 bg-white/60 p-6 dark:bg-deep/50">
            <h2 className="font-semibold">Password requirement</h2>

            <p className="mt-3 text-sm leading-6 opacity-70">
              The password must contain at least eight characters.
              A longer password containing letters, numbers and
              symbols is recommended.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
