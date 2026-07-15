"use client";

import { useEffect, useState } from "react";
import { courseApi, getToken } from "../../lib/api";
import CourseCard from "../../components/CourseCard";

export default function MyCoursesPage() {
  const token = getToken();
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login?next=/my-courses";
      return;
    }
    courseApi
      .myEnrolled(token)
      .then((data) => setCourses(data.courses))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl mb-8">My Courses</h1>

      {error && <p className="text-red-600 text-sm mb-6">{error}</p>}

      {!courses && !error ? (
        <p className="opacity-60">Loading...</p>
      ) : courses && courses.length === 0 ? (
        <div className="text-center py-16">
          <p className="opacity-70 mb-4">You haven't enrolled in any courses yet.</p>
          <a href="/courses" className="px-6 py-2.5 rounded-lg bg-gold text-ink font-semibold">
            Browse courses
          </a>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <a key={c.id} href={`/learn/${c.slug}`}>
              <CourseCard course={c} />
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
