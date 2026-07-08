"use client";

import { useEffect, useState } from "react";
import { getToken } from "../../../lib/api";
import { adminApi } from "../../../lib/adminApi";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = getToken();

  function load() {
    setLoading(true);
    adminApi
      .listCourses(token)
      .then((data) => setCourses(data.courses))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function togglePublish(course) {
    try {
      await adminApi.updateCourse(token, course.id, { published: !course.published });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(course) {
    if (!confirm(`Delete "${course.title}"? This removes all its sections and lessons too.`)) {
      return;
    }
    try {
      await adminApi.deleteCourse(token, course.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl">Courses</h1>
        <a href="/admin/new" className="px-4 py-2 rounded-lg bg-gold text-ink font-semibold text-sm">
          + New Course
        </a>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading ? (
        <p className="opacity-60">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-gold/20">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Sections</th>
                <th className="py-2 pr-4">Enrollments</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-gold/10">
                  <td className="py-2 pr-4 font-medium">{c.title}</td>
                  <td className="py-2 pr-4 opacity-70">{c.subcategory}</td>
                  <td className="py-2 pr-4">
                    {c.currency === "USD" ? "$" : "GHS "}
                    {c.price}
                  </td>
                  <td className="py-2 pr-4">{c._count?.sections ?? 0}</td>
                  <td className="py-2 pr-4">
                    <a href={`/admin/courses/${c.id}/enrollments`} className="text-gold underline">
                      {c._count?.enrollments ?? 0}
                    </a>
                  </td>
                  <td className="py-2 pr-4">
                    <button
                      onClick={() => togglePublish(c)}
                      className={`px-2 py-1 rounded-full text-xs ${
                        c.published ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {c.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="py-2 pr-4 space-x-3">
                    <a href={`/admin/courses/${c.id}`} className="text-gold underline">
                      Edit
                    </a>
                    <button onClick={() => handleDelete(c)} className="text-red-600 underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {courses.length === 0 && <p className="opacity-60 mt-4">No courses yet.</p>}
        </div>
      )}
    </div>
  );
}
