"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { courseApi, getToken, paymentApi } from "../../../lib/api";

function formatDuration(seconds) {
  if (!seconds) return "";

  const minutes = Math.floor(seconds / 60);

  return `${minutes} min`;
}

function formatReviewDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function StarRating({ rating, size = "text-lg" }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${safeRating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${size} ${
            star <= Math.round(safeRating)
              ? "text-gold"
              : "text-gray-300 dark:text-gray-600"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function CourseDetailPage() {
  const { slug } = useParams();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    if (!slug) {
      return;
    }

    const token = getToken();

    setLoading(true);
    setError("");

    courseApi
      .getBySlug(slug, token)
      .then(setData)
      .catch((err) => {
        setError(err?.message || "Unable to load this course");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <p className="opacity-60">Loading course...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      </main>
    );
  }

  if (!data?.course) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <p className="opacity-60">Course not found.</p>
      </main>
    );
  }

  const { course, isEnrolled } = data;

  const numericPrice = Number(course.price) || 0;

  const priceLabel =
    course.currency === "USD"
      ? `$${numericPrice.toLocaleString()}`
      : `GHS ${numericPrice.toLocaleString()}`;

  const sections = Array.isArray(course.sections)
    ? course.sections
    : [];

  const reviews = Array.isArray(course.reviews)
    ? course.reviews
    : [];

  const averageRating = Number(course.averageRating) || 0;
  const reviewCount = Number(course.reviewCount) || reviews.length;

  const totalLessons = sections.reduce(
    (sum, section) =>
      sum +
      (Array.isArray(section.lessons)
        ? section.lessons.length
        : 0),
    0
  );

  const reviewCountLabel =
    reviewCount === 1
      ? "1 review"
      : `${reviewCount.toLocaleString()} reviews`;

  async function handleEnroll() {
    const token = getToken();

    if (!token) {
      window.location.href = `/login?next=/courses/${course.slug}`;
      return;
    }

    setCheckoutError("");
    setEnrolling(true);

    try {
      const { authorizationUrl, reference } =
        await paymentApi.initialize(course.id, token);

      sessionStorage.setItem(
        `pwa_pending_${reference}`,
        course.slug
      );

      window.location.href = authorizationUrl;
    } catch (err) {
      setCheckoutError(
        err?.message || "Unable to begin checkout"
      );

      setEnrolling(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <section className="mb-12">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold">
          {course.category}
          {course.subcategory
            ? ` · ${course.subcategory}`
            : ""}
        </p>

        <h1 className="mb-4 font-display text-4xl">
          {course.title}
        </h1>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <StarRating rating={averageRating} />

          {reviewCount > 0 ? (
            <>
              <span className="font-semibold">
                {averageRating.toFixed(1)}
              </span>

              <a
                href="#student-reviews"
                className="text-sm opacity-65 transition hover:text-gold hover:opacity-100"
              >
                Based on {reviewCountLabel}
              </a>
            </>
          ) : (
            <span className="text-sm opacity-60">
              No reviews yet
            </span>
          )}
        </div>

        <p className="mb-7 max-w-2xl leading-7 opacity-70">
          {course.description}
        </p>

        <div className="flex flex-col gap-4 rounded-2xl border border-gold/20 bg-white/50 p-5 sm:flex-row sm:items-center dark:bg-deep/40">
          <div>
            <p className="text-2xl font-semibold">
              {priceLabel}
            </p>

            <p className="mt-1 text-sm opacity-60">
              {sections.length}{" "}
              {sections.length === 1 ? "section" : "sections"} ·{" "}
              {totalLessons}{" "}
              {totalLessons === 1 ? "lesson" : "lessons"}
            </p>
          </div>

          {isEnrolled ? (
            <a
              href={`/learn/${course.slug}`}
              className="rounded-lg bg-gold px-6 py-2.5 text-center font-semibold text-ink transition hover:opacity-90 sm:ml-auto"
            >
              Go to lessons
            </a>
          ) : (
            <button
              type="button"
              onClick={handleEnroll}
              disabled={enrolling}
              className="rounded-lg bg-gold px-6 py-2.5 font-semibold text-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto"
            >
              {enrolling
                ? "Redirecting to checkout..."
                : "Enroll now"}
            </button>
          )}
        </div>

        {checkoutError && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            {checkoutError}
          </p>
        )}
      </section>

      <section className="mb-14">
        <h2 className="mb-4 font-display text-2xl">
          Curriculum
        </h2>

        {sections.length === 0 ? (
          <div className="rounded-xl border border-gold/20 px-4 py-6 text-sm opacity-60">
            Curriculum will be available soon.
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => {
              const lessons = Array.isArray(section.lessons)
                ? section.lessons
                : [];

              return (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-xl border border-gold/20"
                >
                  <div className="bg-gold/10 px-4 py-3 font-medium">
                    {section.title}
                  </div>

                  {lessons.length === 0 ? (
                    <p className="px-4 py-4 text-sm opacity-60">
                      No lessons have been added yet.
                    </p>
                  ) : (
                    <ul className="divide-y divide-gold/10">
                      {lessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            {lesson.locked ? (
                              <span
                                title="Enroll to unlock"
                                aria-label="Locked lesson"
                              >
                                🔒
                              </span>
                            ) : (
                              <span
                                title="Available"
                                aria-label="Available lesson"
                              >
                                ▶️
                              </span>
                            )}

                            <span className="truncate">
                              {lesson.title}
                            </span>

                            {lesson.isPreview && (
                              <span className="shrink-0 rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold">
                                Preview
                              </span>
                            )}
                          </span>

                          <span className="shrink-0 opacity-50">
                            {formatDuration(
                              lesson.durationSec
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section
        id="student-reviews"
        className="scroll-mt-24 border-t border-gold/20 pt-10"
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gold">
              Student feedback
            </p>

            <h2 className="font-display text-3xl">
              Course Reviews
            </h2>
          </div>

          {reviewCount > 0 && (
            <div className="rounded-xl border border-gold/20 bg-gold/5 px-5 py-4 sm:text-right">
              <div className="flex items-center gap-3 sm:justify-end">
                <span className="font-display text-3xl">
                  {averageRating.toFixed(1)}
                </span>

                <div>
                  <StarRating rating={averageRating} />
                  <p className="mt-1 text-xs opacity-60">
                    {reviewCountLabel}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-gold/20 bg-white/40 px-6 py-10 text-center dark:bg-deep/30">
            <div className="mb-3 flex justify-center">
              <StarRating rating={0} size="text-2xl" />
            </div>

            <h3 className="mb-2 font-display text-xl">
              No reviews yet
            </h3>

            <p className="mx-auto max-w-md text-sm leading-6 opacity-65">
              Be the first enrolled student to complete this
              course and share your experience.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {reviews.map((review) => {
              const reviewerName =
                review.user?.name?.trim() ||
                "Verified Student";

              return (
                <article
                  key={review.id}
                  className="rounded-2xl border border-gold/20 bg-white/50 p-6 dark:bg-deep/40"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">
                        {reviewerName}
                      </h3>

                      <p className="mt-1 text-xs opacity-55">
                        Verified student
                        {review.createdAt
                          ? ` · ${formatReviewDate(
                              review.createdAt
                            )}`
                          : ""}
                      </p>
                    </div>

                    <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                      {Number(review.rating) || 0}.0
                    </span>
                  </div>

                  <StarRating
                    rating={review.rating}
                    size="text-base"
                  />

                  <p className="mt-4 whitespace-pre-line text-sm leading-7 opacity-75">
                    “{review.comment}”
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
