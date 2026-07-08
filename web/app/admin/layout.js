"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../lib/api";
import { decodeToken } from "../../lib/adminApi";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getToken();
    const payload = token ? decodeToken(token) : null;

    if (!payload || payload.role !== "ADMIN") {
      // Not an admin (or not logged in) — the backend would reject any
      // admin API call anyway; this just avoids showing the UI at all.
      router.push("/login?next=/admin");
      return;
    }
    setAuthorized(true);
    setChecked(true);
  }, [router]);

  if (!checked) {
    return <main className="p-8">Checking access...</main>;
  }
  if (!authorized) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className="md:w-64 border-b md:border-b-0 md:border-r border-gold/20 bg-white/40 dark:bg-deep/40 p-4">
        <h2 className="font-display text-xl mb-6">Admin</h2>
        <nav className="space-y-1 text-sm">
          <a href="/admin/courses" className="block px-3 py-2 rounded-lg hover:bg-gold/10">
            Courses
          </a>
          <a href="/admin/new" className="block px-3 py-2 rounded-lg hover:bg-gold/10">
            + New Course
          </a>
          <a href="/" className="block px-3 py-2 rounded-lg hover:bg-gold/10 opacity-60 mt-6">
            ← Back to site
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
