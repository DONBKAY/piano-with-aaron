"use client";

import { useEffect, useState } from "react";
import { getToken } from "../../../lib/api";
import { adminApi } from "../../../lib/adminApi";

export default function AdminCategoriesPage() {
  const token = getToken();
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .categories(token)
      .then((data) => setCategories(data.categories))
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Categories</h1>
      <p className="text-sm opacity-60 mb-6">
        This is the fixed taxonomy every course must use. It's currently defined
        in the backend code, not editable here — ask your developer to add a
        category by updating <code className="text-xs">VALID_CATEGORIES</code> in
        the backend.
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {!categories && !error ? (
        <p className="opacity-60">Loading...</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {categories &&
            Object.entries(categories).map(([category, subcategories]) => (
              <div
                key={category}
                className="border border-gold/20 rounded-xl p-5 bg-white/40 dark:bg-deep/40"
              >
                <h3 className="font-display text-lg mb-3">{category}</h3>
                <ul className="space-y-1 text-sm opacity-70">
                  {subcategories.map((sub) => (
                    <li key={sub}>• {sub}</li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
