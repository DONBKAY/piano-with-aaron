"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  authApi,
  clearToken,
  getToken,
  saveUser,
} from "../../lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();

    if (!token) {
      window.location.href = "/login?next=/profile";
      return;
    }

    authApi
      .me(token)
      .then((currentUser) => {
        saveUser(currentUser);
        setUser(currentUser);
      })
      .catch((err) => {
        if (
          err.message?.toLowerCase().includes("unauthorized") ||
          err.message?.toLowerCase().includes("invalid token")
        ) {
          clearToken();
          window.location.href = "/login?next=/profile";
          return;
        }

        setError(err.message || "Unable to load profile");
      });
  }, []);

  return (
    <main className="mx-auto min-h-[70vh] max-w-4xl px-4 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold text-gold">
          Student Account
        </p>

        <h1 className="mt-2 font-display text-4xl">
          My Profile
        </h1>

        <p className="mt-2 opacity-70">
          View your Piano With Aaron account information.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!user && !error ? (
        <p className="opacity-60">Loading profile...</p>
      ) : user ? (
        <div className="overflow-hidden rounded-2xl border border-gold/20 bg-white/50 shadow-sm dark:bg-deep/40">
          <div className="flex flex-col gap-5 border-b border-gold/10 p-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gold font-display text-3xl font-bold text-ink">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <h2 className="font-display text-3xl">
                {user.name}
              </h2>

              <p className="mt-1 opacity-60">{user.email}</p>

              <span className="mt-3 inline-flex rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                {user.role === "ADMIN" ? "Administrator" : "Student"}
              </span>
            </div>
          </div>

          <div className="divide-y divide-gold/10">
            <ProfileRow label="Full name" value={user.name} />
            <ProfileRow label="Email address" value={user.email} />
            <ProfileRow
              label="Account type"
              value={
                user.role === "ADMIN"
                  ? "Administrator"
                  : "Student"
              }
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-gold/10 p-6 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex justify-center rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-ink"
            >
              My Dashboard
            </Link>

            <Link
              href="/my-courses"
              className="inline-flex justify-center rounded-lg border border-gold/30 px-5 py-2.5 text-sm font-semibold hover:bg-gold/10"
            >
              My Courses
            </Link>

            <Link
              href="/forgot-password"
              className="inline-flex justify-center rounded-lg border border-gold/30 px-5 py-2.5 text-sm font-semibold hover:bg-gold/10"
            >
              Change Password
            </Link>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="grid gap-1 px-6 py-4 sm:grid-cols-[180px_1fr] sm:gap-5">
      <p className="text-sm opacity-60">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
