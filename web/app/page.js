"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { courseApi } from "../lib/api";
import CourseCard from "../components/CourseCard";
import Hero from "../components/home/Hero";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api"
).replace(/\/$/, "");

function StarRating({ rating }) {
  const safeRating = Math.max(
    0,
    Math.min(5, Math.round(Number(rating) || 0))
  );

  return (
    <div
      className="flex items-center justify-center gap-1"
      aria-label={`${safeRating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-xl ${
            star <= safeRating
              ? "text-gold"
              : "text-gray-300 dark:text-cream/20"
          }`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [coursesLoading, setCoursesLoading] =
    useState(true);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        setCoursesLoading(true);

        const data = await courseApi.list();

        setFeatured(
          Array.isArray(data?.courses)
            ? data.courses.slice(0, 3)
            : []
        );
      } catch (error) {
        console.error(
          "Homepage courses error:",
          error
        );

        setFeatured([]);
      } finally {
        setCoursesLoading(false);
      }
    }

    loadCourses();
  }, []);

  useEffect(() => {
    async function loadReviews() {
      try {
        setReviewsLoading(true);

        const response = await fetch(
          `${API_URL}/reviews/public`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Could not load reviews."
          );
        }

        if (Array.isArray(data)) {
          setReviews(data.slice(0, 3));
          return;
        }

        if (Array.isArray(data.reviews)) {
          setReviews(data.reviews.slice(0, 3));
          return;
        }

        setReviews([]);
      } catch (error) {
        console.error(
          "Homepage reviews error:",
          error
        );

        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    }

    loadReviews();
  }, []);

  return (
    <main className="overflow-hidden">
      <Hero />

      <section className="border-b border-gold/20 bg-deep text-cream">
        <div className="mx-auto grid max-w-7xl sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              value: "300+",
              title: "Students Taught",
              text: "And growing every day",
            },
            {
              value: "2016",
              title: "Teaching Since",
              text: "Years of practical experience",
            },
            {
              value: "2007",
              title: "Playing Since",
              text: "A journey built on passion",
            },
            {
              value: "Gospel",
              title: "Piano Focus",
              text: "Chords and progressions",
            },
          ].map((stat, index) => (
            <article
              key={stat.title}
              className={`px-6 py-8 text-center ${
                index !== 3
                  ? "border-b border-gold/15 sm:border-r lg:border-b-0"
                  : ""
              }`}
            >
              <p className="font-display text-3xl font-bold text-gold">
                {stat.value}
              </p>

              <h2 className="mt-2 font-semibold">
                {stat.title}
              </h2>

              <p className="mt-1 text-xs leading-5 text-cream/55">
                {stat.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-cream px-4 py-20 text-ink dark:bg-ink dark:text-cream sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">
              Start Learning
            </p>

            <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
              Featured Courses
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 opacity-65">
              Follow structured lessons that help you
              develop practical piano skills one step at a
              time.
            </p>
          </div>

          <div className="mt-12">
            {coursesLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-[420px] animate-pulse rounded-2xl border border-gold/15 bg-gold/5"
                  />
                ))}
              </div>
            ) : featured.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-gold/20 bg-gold/5 p-10 text-center">
                <p className="opacity-65">
                  Featured courses will appear here once
                  they are published.
                </p>
              </div>
            )}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl border border-gold px-7 py-3.5 font-bold text-gold transition hover:bg-gold hover:text-ink"
            >
              View All Courses
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-gold/15 bg-white px-4 py-20 text-ink dark:bg-deep dark:text-cream sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">
              Student Reviews
            </p>

            <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
              What Students Are Saying
            </h2>
          </div>

          <div className="mt-12">
            {reviewsLoading ? (
              <div className="grid gap-6 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-72 animate-pulse rounded-2xl border border-gold/15 bg-gold/5"
                  />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="rounded-2xl border border-gold/20 bg-white/60 p-10 text-center dark:bg-ink/40">
                <p className="opacity-65">
                  Approved student reviews will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review) => {
                  const studentName =
                    review.user?.name ||
                    review.user?.fullName ||
                    "Piano student";

                  const courseTitle =
                    review.course?.title ||
                    review.courseTitle ||
                    "Piano course";

                  const initial =
                    studentName
                      .trim()
                      .charAt(0)
                      .toUpperCase() || "S";

                  return (
                    <article
                      key={review.id}
                      className="flex h-full flex-col rounded-2xl border border-gold/20 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-ink/55"
                    >
                      <StarRating
                        rating={review.rating}
                      />

                      <blockquote className="mt-5 flex-1 text-center leading-8 opacity-75">
                        “{review.comment}”
                      </blockquote>

                      <div className="mt-7 border-t border-gold/10 pt-5 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold font-bold text-ink">
                          {initial}
                        </div>

                        <h3 className="mt-3 font-semibold">
                          {studentName}
                        </h3>

                        <p className="mt-1 text-sm opacity-55">
                          {courseTitle}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
