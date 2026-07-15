"use client";

import { useEffect, useState } from "react";
import { getToken } from "../../../lib/api";
import { adminApi } from "../../../lib/adminApi";

export default function AdminAnalyticsPage() {
  const token = getToken();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .analytics(token)
      .then(setData)
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p className="text-red-600 text-sm">{error}</p>;
  if (!data) return <p className="opacity-60">Loading...</p>;

  const maxRevenue = Math.max(1, ...data.revenueByMonth.map((m) => m.revenue));
  const maxEnrollments = Math.max(1, ...data.topCourses.map((c) => c.enrollments));

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Analytics</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-gold/20 rounded-xl p-6 bg-white/40 dark:bg-deep/40">
          <h2 className="font-display text-xl mb-4">Revenue (last 6 months)</h2>
          {data.revenueByMonth.length === 0 ? (
            <p className="opacity-60 text-sm">No successful payments yet.</p>
          ) : (
            <div className="space-y-3">
              {data.revenueByMonth.map((m) => (
                <div key={m.month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="opacity-70">{m.month}</span>
                    <span className="font-medium">GHS {m.revenue}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gold/10">
                    <div
                      className="h-2 rounded-full bg-gold"
                      style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-gold/20 rounded-xl p-6 bg-white/40 dark:bg-deep/40">
          <h2 className="font-display text-xl mb-4">Top Courses by Enrollment</h2>
          {data.topCourses.length === 0 ? (
            <p className="opacity-60 text-sm">No courses yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topCourses.map((c) => (
                <div key={c.title}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="opacity-70">{c.title}</span>
                    <span className="font-medium">{c.enrollments}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gold/10">
                    <div
                      className="h-2 rounded-full bg-gold"
                      style={{ width: `${(c.enrollments / maxEnrollments) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
