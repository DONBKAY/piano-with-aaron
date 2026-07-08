"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getToken } from "../../../../../lib/api";
import { adminApi } from "../../../../../lib/adminApi";

export default function AdminEnrollmentsPage() {
  const { id } = useParams();
  const token = getToken();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getEnrollments(token, id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p className="opacity-60">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <a href={`/admin/courses/${id}`} className="text-sm opacity-60 hover:opacity-100">
        ← Back to course
      </a>
      <h1 className="font-display text-3xl mt-1 mb-6">Enrollments</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-gold/20 rounded-xl p-4">
          <p className="text-xs opacity-60 mb-1">Total enrolled</p>
          <p className="text-2xl font-display">{data.totalEnrolled}</p>
        </div>
        <div className="border border-gold/20 rounded-xl p-4">
          <p className="text-xs opacity-60 mb-1">Total lessons</p>
          <p className="text-2xl font-display">{data.totalLessons}</p>
        </div>
        <div className="border border-gold/20 rounded-xl p-4">
          <p className="text-xs opacity-60 mb-1">Avg. completion</p>
          <p className="text-2xl font-display">{data.averageCompletion}%</p>
        </div>
      </div>

      {data.enrollments.length === 0 ? (
        <p className="opacity-60">No students enrolled yet.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-gold/20">
              <th className="py-2 pr-4">Student</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Enrolled</th>
              <th className="py-2 pr-4">Progress</th>
            </tr>
          </thead>
          <tbody>
            {data.enrollments.map((e) => (
              <tr key={e.id} className="border-b border-gold/10">
                <td className="py-2 pr-4 font-medium">{e.user.name}</td>
                <td className="py-2 pr-4 opacity-70">{e.user.email}</td>
                <td className="py-2 pr-4 opacity-70">
                  {new Date(e.enrolledAt).toLocaleDateString()}
                </td>
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-gold/15 overflow-hidden">
                      <div
                        className="h-full bg-gold"
                        style={{ width: `${e.completionPercent}%` }}
                      />
                    </div>
                    <span className="text-xs opacity-70">
                      {e.completedLessons}/{e.totalLessons} ({e.completionPercent}%)
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
