"use client";

import { useEffect, useState } from "react";
import { getToken } from "../../lib/api";
import { adminApi } from "../../lib/adminApi";

function StatCard({ label, value }) {
  return (
    <div className="border border-gold/20 rounded-xl p-5 bg-white/40 dark:bg-deep/40">
      <p className="text-sm opacity-60 mb-1">{label}</p>
      <p className="font-display text-3xl">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const token = getToken();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .dashboard(token)
      .then(setStats)
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Dashboard</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {!stats && !error ? (
        <p className="opacity-60">Loading...</p>
      ) : stats ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Students" value={stats.students} />
          <StatCard label="Courses" value={stats.courses} />
          <StatCard label="Enrollments" value={stats.enrollments} />
          <StatCard label="Revenue (GHS)" value={stats.revenue} />
        </div>
      ) : null}

      <a href="/admin/courses" className="text-gold underline text-sm">
        Manage courses →
      </a>
    </div>
  );
}
