"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../../lib/api";
import { adminApi } from "../../../lib/adminApi";

export default function NewCoursePage() {
  const router = useRouter();
  const token = getToken();
  const [categories, setCategories] = useState({});
  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    price: "",
    currency: "GHS",
    category: "",
    subcategory: "",
    published: false,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.categories(token).then((data) => setCategories(data.categories));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { course } = await adminApi.createCourse(token, {
        ...form,
        price: Number(form.price),
      });
      router.push(`/admin/courses/${course.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const subcategoryOptions = categories[form.category] || [];

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-6">New Course</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            required
            className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            required
            rows={3}
            className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Thumbnail URL (optional)</label>
          <input
            className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2"
            value={form.thumbnailUrl}
            onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Price</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Currency</label>
            <select
              className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="GHS">GHS</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Category</label>
            <select
              required
              className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })}
            >
              <option value="">Select...</option>
              {Object.keys(categories).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Subcategory</label>
            <select
              required
              disabled={!form.category}
              className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2 disabled:opacity-50"
              value={form.subcategory}
              onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
            >
              <option value="">Select...</option>
              {subcategoryOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Publish immediately
        </label>

        <button
          disabled={saving}
          className="px-6 py-2.5 rounded-lg bg-gold text-ink font-semibold disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create course"}
        </button>
      </form>
    </div>
  );
}
