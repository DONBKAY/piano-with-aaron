"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken } from "../../../lib/api";
import { adminApi } from "../../../lib/adminApi";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [publishingId, setPublishingId] = useState("");

  const token = getToken();

  async function loadCourses() {
    setLoading(true);
    setError("");

    try {
      const data = await adminApi.listCourses(token);
      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message || "Unable to load courses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function togglePublish(course) {
    setPublishingId(course.id);
    setError("");

    try {
      await adminApi.updateCourse(token, course.id, {
        published: !course.published,
      });

      setCourses((currentCourses) =>
        currentCourses.map((item) =>
          item.id === course.id
            ? { ...item, published: !item.published }
            : item
        )
      );
    } catch (err) {
      setError(err.message || "Unable to update course status");
    } finally {
      setPublishingId("");
    }
  }

  async function handleDelete(course) {
    const confirmed = window.confirm(
      `Delete "${course.title}"?\n\nThis will also remove its sections, lessons, enrollments, and related progress records.`
    );

    if (!confirmed) return;

    setDeletingId(course.id);
    setError("");

    try {
      await adminApi.deleteCourse(token, course.id);

      setCourses((currentCourses) =>
        currentCourses.filter((item) => item.id !== course.id)
      );
    } catch (err) {
      setError(err.message || "Unable to delete course");
    } finally {
      setDeletingId("");
    }
  }

  function formatPrice(course) {
    const amount = Number(course.price || 0).toFixed(2);

    return course.currency === "USD"
      ? `$${amount}`
      : `GH₵${amount}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Courses</h1>
          <p className="mt-1 text-sm opacity-60">
            Create, publish and manage your piano courses.
          </p>
        </div>

        <Link
          href="/admin/new"
          className="inline-flex items-center justify-center rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink"
        >
          + New Course
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gold/20 bg-white/40 p-6 dark:bg-deep/40">
          <p className="opacity-60">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gold/30 bg-white/40 p-10 text-center dark:bg-deep/40">
          <h2 className="font-display text-xl">No courses yet</h2>

          <p className="mt-2 text-sm opacity-60">
            Create your first piano course to begin adding sections and lessons.
          </p>

          <Link
            href="/admin/new"
            className="mt-5 inline-flex rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink"
          >
            Create First Course
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const sectionCount = course._count?.sections ?? 0;
              const enrollmentCount = course._count?.enrollments ?? 0;
              const isPublishing = publishingId === course.id;
              const isDeleting = deletingId === course.id;

              return (
                <article
                  key={course.id}
                  className="overflow-hidden rounded-xl border border-gold/20 bg-white/40 shadow-sm dark:bg-deep/40"
                >
                  <div className="aspect-video bg-black/10">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm opacity-50">
                        No thumbnail
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display text-xl leading-tight">
                          {course.title}
                        </h2>

                        <p className="mt-1 text-sm opacity-60">
                          {course.category} · {course.subcategory}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => togglePublish(course)}
                        disabled={isPublishing}
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
                          course.published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {isPublishing
                          ? "Saving..."
                          : course.published
                            ? "Published"
                            : "Draft"}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-lg bg-black/5 p-3 dark:bg-white/5">
                        <p className="text-xs opacity-60">Price</p>
                        <p className="mt-1 font-semibold">
                          {formatPrice(course)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-black/5 p-3 dark:bg-white/5">
                        <p className="text-xs opacity-60">Sections</p>
                        <p className="mt-1 font-semibold">{sectionCount}</p>
                      </div>

                      <div className="rounded-lg bg-black/5 p-3 dark:bg-white/5">
                        <p className="text-xs opacity-60">Students</p>
                        <p className="mt-1 font-semibold">
                          {enrollmentCount}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="rounded-lg border border-gold/30 px-3 py-2 text-center text-sm font-medium hover:bg-gold/10"
                      >
                        Manage Course
                      </Link>

                      <Link
                        href={`/admin/courses/${course.id}/enrollments`}
                        className="rounded-lg border border-gold/30 px-3 py-2 text-center text-sm font-medium hover:bg-gold/10"
                      >
                        Enrollments
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(course)}
                      disabled={isDeleting}
                      className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDeleting ? "Deleting..." : "Delete Course"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="text-sm opacity-60">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </p>
        </>
      )}
    </div>
  );
}
