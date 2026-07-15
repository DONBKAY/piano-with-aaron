"use client";

import { useEffect, useState } from "react";
import { getToken } from "../../../lib/api";
import { adminApi } from "../../../lib/adminApi";

const STATUS_STYLES = {
  SUCCESS: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function AdminPaymentsPage() {
  const token = getToken();
  const [payments, setPayments] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .payments(token)
      .then((data) => setPayments(data.payments))
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Payments</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {!payments && !error ? (
        <p className="opacity-60">Loading...</p>
      ) : payments && payments.length === 0 ? (
        <p className="opacity-60">No payments yet.</p>
      ) : (
        <div className="overflow-x-auto border border-gold/20 rounded-xl bg-white/40 dark:bg-deep/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gold/20">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments?.map((p) => (
                <tr key={p.id} className="border-b border-gold/10 last:border-0">
                  <td className="px-4 py-3 opacity-70">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.user?.name}</div>
                    <div className="opacity-60 text-xs">{p.user?.email}</div>
                  </td>
                  <td className="px-4 py-3">{p.course?.title}</td>
                  <td className="px-4 py-3">
                    {p.currency} {p.amount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        STATUS_STYLES[p.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 opacity-50 text-xs font-mono">{p.paystackRef}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
