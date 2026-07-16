"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  authApi,
  clearToken,
  getToken,
  getUser,
  saveUser,
} from "../lib/api";

const CATEGORIES = [
  "Beginners Corner",
  "Intermediate Pathway",
  "Advanced Techniques",
  "Learning Songs",
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const coursesRef = useRef(null);
  const accountRef = useRef(null);
  const authRef = useRef(null);

  useEffect(() => {
    async function loadUser() {
      const token = getToken();

      if (!token) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      const storedUser = getUser();

      if (storedUser) {
        setUser(storedUser);
        setAuthLoading(false);
        return;
      }

      try {
        const currentUser = await authApi.me(token);
        saveUser(currentUser);
        setUser(currentUser);
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    loadUser();
  }, [pathname]);

  useEffect(() => {
    function handleAuthChange() {
      setUser(getUser());
    }

    window.addEventListener("pwa-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("pwa-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        coursesRef.current &&
        !coursesRef.current.contains(event.target)
      ) {
        setCoursesOpen(false);
      }

      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }

      if (authRef.current && !authRef.current.contains(event.target)) {
        setAuthOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function closeMenus() {
    setCoursesOpen(false);
    setAccountOpen(false);
    setAuthOpen(false);
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    closeMenus();
    router.replace("/");
    router.refresh();
  }

  const dashboardHref =
    user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-gold/20 bg-cream/90 backdrop-blur dark:bg-ink/90">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          onClick={closeMenus}
          className="font-display text-lg tracking-wide sm:text-xl"
        >
          PIANO WITH AARON
        </Link>

        <nav className="flex items-center gap-3 sm:gap-5">
          <div className="relative" ref={coursesRef}>
            <button
              type="button"
              onClick={() => {
                setCoursesOpen((current) => !current);
                setAccountOpen(false);
                setAuthOpen(false);
              }}
              className="flex items-center gap-1 text-sm font-medium transition hover:text-gold"
            >
              Courses

              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                className={`transition-transform ${
                  coursesOpen ? "rotate-180" : ""
                }`}
              >
                <path
                  d="M1 3 L5 7 L9 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </button>

            {coursesOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-gold/20 bg-white shadow-xl dark:bg-deep">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category}
                    href={`/courses?category=${encodeURIComponent(
                      category
                    )}`}
                    onClick={closeMenus}
                    className="block px-4 py-3 text-sm transition hover:bg-gold/10"
                  >
                    {category}
                  </Link>
                ))}

                <Link
                  href="/courses"
                  onClick={closeMenus}
                  className="block border-t border-gold/10 px-4 py-3 text-sm font-medium text-gold transition hover:bg-gold/10"
                >
                  View all courses
                </Link>
              </div>
            )}
          </div>

          {!authLoading && user ? (
            <>
              <Link
                href={dashboardHref}
                onClick={closeMenus}
                className="hidden text-sm font-semibold text-gold hover:underline sm:block"
              >
                {user.role === "ADMIN"
                  ? "Admin Dashboard"
                  : "My Dashboard"}
              </Link>

              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen((current) => !current);
                    setCoursesOpen(false);
                    setAuthOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gold/40 px-3 py-2 text-sm font-semibold transition hover:bg-gold/10"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-ink">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>

                  <span className="hidden max-w-24 truncate md:block">
                    {user.name}
                  </span>
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-gold/20 bg-white shadow-xl dark:bg-deep">
                    <div className="border-b border-gold/10 px-4 py-3">
                      <p className="truncate text-sm font-semibold">
                        {user.name}
                      </p>

                      <p className="truncate text-xs opacity-60">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href={dashboardHref}
                      onClick={closeMenus}
                      className="block px-4 py-3 text-sm transition hover:bg-gold/10"
                    >
                      {user.role === "ADMIN"
                        ? "Admin Dashboard"
                        : "My Dashboard"}
                    </Link>

                    {user.role === "STUDENT" && (
                      <>
                        <Link
                          href="/my-courses"
                          onClick={closeMenus}
                          className="block px-4 py-3 text-sm transition hover:bg-gold/10"
                        >
                          My Courses
                        </Link>

                        <Link
                          href="/profile"
                          onClick={closeMenus}
                          className="block px-4 py-3 text-sm transition hover:bg-gold/10"
                        >
                          My Profile
                        </Link>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full border-t border-gold/10 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : !authLoading ? (
            <div className="relative" ref={authRef}>
              <button
                type="button"
                onClick={() => {
                  setAuthOpen((current) => !current);
                  setCoursesOpen(false);
                  setAccountOpen(false);
                }}
                className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:opacity-90"
              >
                Login
              </button>

              {authOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-gold/20 bg-white shadow-xl dark:bg-deep">
                  <Link
                    href="/login"
                    onClick={closeMenus}
                    className="block px-4 py-3 text-sm font-medium transition hover:bg-gold/10"
                  >
                    Log in
                  </Link>

                  <Link
                    href="/signup"
                    onClick={closeMenus}
                    className="block border-t border-gold/10 px-4 py-3 text-sm text-gold transition hover:bg-gold/10"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
