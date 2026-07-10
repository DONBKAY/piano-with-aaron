"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, clearToken } from "../lib/api";

const CATEGORIES = [
  "Beginners Corner",
  "Intermediate Pathway",
  "Advanced Techniques",
  "Learning Songs",
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const coursesRef = useRef(null);
  const authRef = useRef(null);

  useEffect(() => {
    setLoggedIn(Boolean(getToken()));
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (coursesRef.current && !coursesRef.current.contains(e.target)) {
        setCoursesOpen(false);
      }
      if (authRef.current && !authRef.current.contains(e.target)) {
        setAuthOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    clearToken();
    setLoggedIn(false);
    setAuthOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-cream/90 dark:bg-ink/90 backdrop-blur border-b border-gold/20">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="font-display text-xl tracking-wide">PIANO WITH AARON</a>

        <nav className="flex items-center gap-6">
          <div className="relative" ref={coursesRef}>
            <button onClick={() => setCoursesOpen((v) => !v)} className="flex items-center gap-1 text-sm font-medium hover:text-gold transition">
              Courses
              <svg width="10" height="10" viewBox="0 0 10 10" className={`transition-transform ${coursesOpen ? "rotate-180" : ""}`}>
                <path d="M1 3 L5 7 L9 3" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </button>
            {coursesOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-deep border border-gold/20 rounded-xl shadow-xl overflow-hidden">
                {CATEGORIES.map((cat) => (
                  <a key={cat} href={`/courses?category=${encodeURIComponent(cat)}`} onClick={() => setCoursesOpen(false)}
                    className="block px-4 py-3 text-sm hover:bg-gold/10 transition">
                    {cat}
                  </a>
                ))}
                <a href="/courses" onClick={() => setCoursesOpen(false)}
                  className="block px-4 py-3 text-sm border-t border-gold/10 text-gold font-medium hover:bg-gold/10 transition">
                  View all courses
                </a>
              </div>
            )}
          </div>

          {loggedIn ? (
            <button onClick={handleLogout} className="px-4 py-2 rounded-lg border border-gold/40 text-sm font-semibold hover:bg-gold/10 transition">
              Log out
            </button>
          ) : (
            <div className="relative" ref={authRef}>
              <button onClick={() => setAuthOpen((v) => !v)} className="px-4 py-2 rounded-lg bg-gold text-ink text-sm font-semibold hover:opacity-90 transition">
                Login
              </button>
              {authOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-deep border border-gold/20 rounded-xl shadow-xl overflow-hidden">
                  <a href="/login" onClick={() => setAuthOpen(false)} className="block px-4 py-3 text-sm hover:bg-gold/10 transition font-medium">
                    Log in
                  </a>
                  <a href="/signup" onClick={() => setAuthOpen(false)} className="block px-4 py-3 text-sm border-t border-gold/10 text-gold hover:bg-gold/10 transition">
                    Sign up
                  </a>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
