"use client";

import { useEffect, useState } from "react";
import { authApi, saveSession } from "../../../../lib/api";

export default function GoogleCallbackPage() {
  const [message, setMessage] = useState(
    "Completing your Google sign-in..."
  );

  useEffect(() => {
    async function completeGoogleLogin() {
      try {
        const hash = window.location.hash.replace(/^#/, "");
        const hashParams = new URLSearchParams(hash);
        const token = hashParams.get("token");

        if (!token) {
          throw new Error("Google login token was not received.");
        }

        // Remove the JWT from the visible browser address immediately.
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        const user = await authApi.me(token);

        saveSession(token, user);

        const nextUrl = sessionStorage.getItem("pwa_google_next");
        sessionStorage.removeItem("pwa_google_next");

        if (
          nextUrl &&
          nextUrl.startsWith("/") &&
          !nextUrl.startsWith("//")
        ) {
          window.location.replace(nextUrl);
          return;
        }

        if (user.role === "ADMIN") {
          window.location.replace("/admin");
          return;
        }

        window.location.replace("/dashboard");
      } catch (error) {
        console.error("Google callback error:", error);

        setMessage(
          error.message ||
            "Unable to complete Google sign-in. Redirecting..."
        );

        window.setTimeout(() => {
          window.location.replace(
            "/login?google_error=callback_failed"
          );
        }, 1800);
      }
    }

    completeGoogleLogin();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gold/30 border-t-gold" />

        <h1 className="font-display text-2xl">Signing you in</h1>

        <p className="mt-2 text-sm opacity-70">{message}</p>
      </div>
    </main>
  );
}
