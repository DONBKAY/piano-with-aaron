"use client";

import { useEffect, useState } from "react";
import { getToken } from "../../../lib/api";
import { adminApi } from "../../../lib/adminApi";

export default function AdminStudentsPage() {
  const token = getToken();
  const [students, setStudents] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .students(token)
      .then((data) => setStudents(data.students))
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Students</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {!students && !error ? (
        <p className="opacity-60">Loading...</p>
      ) : students && students.length === 0 ? (
        <p className="opacity-60">No students yet.</p>
      ) : (
        <div className="overflow-x-auto border border-gold/20 rounded-xl bg-white/40 dark:bg-deep/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gold/20">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Enrollments</th>
                <th className="px-4 py-3 font-medium">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {students?.map((s) => (
                <tr key={s.id} className="border-b border-gold/10 last:border-0">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 opacity-70">{s.email}</td>
                  <td className="px-4 py-3 opacity-70">
                    {new Date(s.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{s.enrollmentCount}</td>
                  <td className="px-4 py-3">GHS {s.totalSpent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
