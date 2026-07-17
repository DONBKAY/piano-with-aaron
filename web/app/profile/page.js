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

  const [profileForm, setProfileForm] = useState({
    name: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [pageError, setPageError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const token = getToken();

    if (!token) {
      window.location.href = "/login?next=/profile";
      return;
    }

    async function loadProfile() {
      try {
        const currentUser = await authApi.me(token);

        saveUser(currentUser);
        setUser(currentUser);

        setProfileForm({
          name: currentUser.name || "",
        });
      } catch (err) {
        const message = err.message || "Unable to load profile";
        const lowerMessage = message.toLowerCase();

        if (
          lowerMessage.includes("unauthorized") ||
          lowerMessage.includes("invalid token") ||
          lowerMessage.includes("authentication")
        ) {
          clearToken();
          window.location.href = "/login?next=/profile";
          return;
        }

        setPageError(message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleProfileSubmit(event) {
    event.preventDefault();

    setProfileError("");
    setProfileSuccess("");

    const cleanName = profileForm.name.trim();

    if (!cleanName) {
      setProfileError("Name is required.");
      return;
    }

    if (cleanName.length < 2) {
      setProfileError("Name must be at least 2 characters.");
      return;
    }

    const token = getToken();

    if (!token) {
      clearToken();
      window.location.href = "/login?next=/profile";
      return;
    }

    setSavingProfile(true);

    try {
      const data = await authApi.updateProfile(
        {
          name: cleanName,
        },
        token
      );

      setUser(data.user);
      saveUser(data.user);

      setProfileForm({
        name: data.user.name,
      });

      setProfileSuccess(
        data.message || "Profile updated successfully."
      );
    } catch (err) {
      setProfileError(err.message || "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please complete all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from the current password."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      clearToken();
      window.location.href = "/login?next=/profile";
      return;
    }

    setChangingPassword(true);

    try {
      const data = await authApi.changePassword(
        {
          currentPassword,
          newPassword,
        },
        token
      );

      setPasswordSuccess(
        data.message || "Password changed successfully."
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(
        err.message || "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-12">
        <p className="opacity-60">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold text-gold">
          Student Account
        </p>

        <h1 className="mt-2 font-display text-4xl">
          My Profile
        </h1>

        <p className="mt-2 opacity-70">
          Manage your Piano With Aaron account information and
          password.
        </p>
      </div>

      {pageError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      )}

      {user && (
        <div className="space-y-8">
          <section className="overflow-hidden rounded-2xl border border-gold/20 bg-white/50 shadow-sm dark:bg-deep/40">
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
                  {user.role === "ADMIN"
                    ? "Administrator"
                    : "Student"}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gold/10">
              <ProfileRow
                label="Email address"
                value={user.email}
              />

              <ProfileRow
                label="Account type"
                value={
                  user.role === "ADMIN"
                    ? "Administrator"
                    : "Student"
                }
              />

              <ProfileRow
                label="Member since"
                value={formatDate(user.createdAt)}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-gold/20 bg-white/50 p-6 shadow-sm dark:bg-deep/40">
            <div className="mb-6">
              <h2 className="font-display text-2xl">
                Personal Information
              </h2>

              <p className="mt-1 text-sm opacity-70">
                Update the name displayed on your account.
              </p>
            </div>

            {profileError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {profileSuccess}
              </div>
            )}

            <form
              onSubmit={handleProfileSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  required
                  maxLength={100}
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      name: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="mt-1 w-full cursor-not-allowed rounded-lg border border-gold/20 bg-black/5 px-3 py-2.5 opacity-60 dark:bg-white/5"
                />

                <p className="mt-1 text-xs opacity-60">
                  Email changes are not currently enabled.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProfile
                  ? "Saving..."
                  : "Save Profile Changes"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-gold/20 bg-white/50 p-6 shadow-sm dark:bg-deep/40">
            <div className="mb-6">
              <h2 className="font-display text-2xl">
                Change Password
              </h2>

              <p className="mt-1 text-sm opacity-70">
                Use a strong password containing at least 8
                characters.
              </p>
            </div>

            {passwordError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {passwordSuccess}
              </div>
            )}

            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-5"
            >
              <PasswordField
                id="currentPassword"
                label="Current password"
                value={passwordForm.currentPassword}
                autoComplete="current-password"
                onChange={(value) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: value,
                  })
                }
              />

              <PasswordField
                id="newPassword"
                label="New password"
                value={passwordForm.newPassword}
                autoComplete="new-password"
                onChange={(value) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: value,
                  })
                }
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm new password"
                value={passwordForm.confirmPassword}
                autoComplete="new-password"
                onChange={(value) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: value,
                  })
                }
              />

              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {changingPassword
                  ? "Changing password..."
                  : "Change Password"}
              </button>
            </form>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-gold/20 bg-white/50 p-6 shadow-sm dark:bg-deep/40 sm:flex-row">
            <Link
              href={
                user.role === "ADMIN" ? "/admin" : "/dashboard"
              }
              className="inline-flex justify-center rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-ink"
            >
              {user.role === "ADMIN"
                ? "Admin Dashboard"
                : "My Dashboard"}
            </Link>

            <Link
              href="/my-courses"
              className="inline-flex justify-center rounded-lg border border-gold/30 px-5 py-2.5 text-sm font-semibold hover:bg-gold/10"
            >
              My Courses
            </Link>
          </section>
        </div>
      )}
    </main>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="grid gap-1 px-6 py-4 sm:grid-cols-[180px_1fr] sm:gap-5">
      <p className="text-sm opacity-60">{label}</p>
      <p className="font-medium">{value || "Not available"}</p>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>

      <input
        id={id}
        type="password"
        required
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold"
      />
    </div>
  );
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
