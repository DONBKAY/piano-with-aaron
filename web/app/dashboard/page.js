"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { courseApi, getToken } from "../../lib/api";
import CourseCard from "../../components/CourseCard";

export default function StudentDashboardPage() {
  const token = getToken();

  const [courses, setCourses] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login?next=/dashboard";
      return;
    }

    courseApi
      .myEnrolled(token)
      .then((data) => setCourses(data.courses || []))
      .catch((err) =>
        setError(err.message || "Unable to load your dashboard")
      );
  }, []);

  const stats = useMemo(() => {
    const courseList = courses || [];

    const totalCourses = courseList.length;

    const completedLessons = courseList.reduce(
      (sum, course) =>
        sum + Number(course.progress?.completed || 0),
      0
    );

    const totalLessons = courseList.reduce(
      (sum, course) =>
        sum + Number(course.progress?.total || 0),
      0
    );

    const overallProgress = totalLessons
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    return {
      totalCourses,
      completedLessons,
      totalLessons,
      overallProgress,
    };
  }, [courses]);

  const continueCourse =
    courses?.find(
      (course) =>
        Number(course.progress?.percent || 0) < 100
    ) || courses?.[0];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="mb-10">
        <p className="text-sm font-medium text-gold">
          Student Dashboard
        </p>

        <h1 className="mt-2 font-display text-4xl">
          Welcome back 👋
        </h1>

        <p className="mt-2 max-w-2xl opacity-70">
          Continue your piano journey and keep building your
          skills one lesson at a time.
        </p>
      </section>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!courses && !error ? (
        <p className="opacity-60">Loading dashboard...</p>
      ) : (
        <div className="space-y-10">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Courses Purchased"
              value={stats.totalCourses}
            />

            <StatCard
              label="Lessons Completed"
              value={stats.completedLessons}
            />

            <StatCard
              label="Total Lessons"
              value={stats.totalLessons}
            />

            <StatCard
              label="Overall Progress"
              value={`${stats.overallProgress}%`}
            />
          </section>

          {continueCourse && (
            <section className="rounded-2xl border border-gold/20 bg-white/50 p-6 shadow-sm dark:bg-deep/40">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-medium text-gold">
                    Continue Learning
                  </p>

                  <h2 className="mt-2 font-display text-3xl">
                    {continueCourse.title}
                  </h2>

                  <p className="mt-2 text-sm opacity-70">
                    {continueCourse.progress?.completed || 0} of{" "}
                    {continueCourse.progress?.total || 0} lessons
                    completed
                  </p>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-gold/10">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{
                        width: `${Math.min(
                          100,
                          Number(
                            continueCourse.progress?.percent || 0
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-sm font-medium">
                    {continueCourse.progress?.percent || 0}% complete
                  </p>
                </div>

                <Link
                  href={`/learn/${continueCourse.slug}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-gold px-6 py-3 font-semibold text-ink"
                >
                  Continue Learning
                </Link>
              </div>
            </section>
          )}

          <section>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-3xl">
                  My Courses
                </h2>

                <p className="mt-1 text-sm opacity-60">
                  Courses you have purchased and enrolled in.
                </p>
              </div>

              <Link
                href="/courses"
                className="text-sm font-semibold text-gold hover:underline"
              >
                Browse more courses
              </Link>
            </div>

            {courses?.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gold/30 px-6 py-14 text-center">
                <h3 className="font-display text-2xl">
                  Start your piano journey
                </h3>

                <p className="mx-auto mt-3 max-w-xl opacity-70">
                  Explore beginner, intermediate and advanced piano
                  courses created to help you improve step by step.
                </p>

                <Link
                  href="/courses"
                  className="mt-6 inline-flex rounded-lg bg-gold px-6 py-3 font-semibold text-ink"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses?.map((course) => (
                  <div key={course.id} className="space-y-3">
                    <Link href={`/learn/${course.slug}`}>
                      <CourseCard course={course} />
                    </Link>

                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="opacity-60">
                          Course progress
                        </span>

                        <span className="font-medium">
                          {course.progress?.percent || 0}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gold/10">
                        <div
                          className="h-full rounded-full bg-gold"
                          style={{
                            width: `${Math.min(
                              100,
                              Number(course.progress?.percent || 0)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gold/20 bg-white/50 p-5 shadow-sm dark:bg-deep/40">
      <p className="text-sm opacity-60">{label}</p>

      <p className="mt-2 font-display text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}
