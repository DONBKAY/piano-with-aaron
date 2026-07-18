"use client";

import { useEffect, useState } from "react";
import { courseApi } from "../lib/api";
import CourseCard from "../components/CourseCard";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

function StarRating({ rating }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div
      className="flex items-center justify-center gap-1"
      aria-label={`${safeRating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-xl ${
            star <= safeRating ? "text-gold" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    courseApi
      .list()
      .then((data) => {
        setFeatured(Array.isArray(data.courses) ? data.courses.slice(0, 3) : []);
      })
      .catch(() => {
        setFeatured([]);
      });
  }, []);

  useEffect(() => {
    async function loadReviews() {
      try {
        setReviewsLoading(true);

        const response = await fetch(`${API_URL}/reviews/public`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || "Could not load reviews.");
        }

        if (Array.isArray(data)) {
          setReviews(data);
          return;
        }

        if (Array.isArray(data.reviews)) {
          setReviews(data.reviews);
          return;
        }

        setReviews([]);
      } catch (error) {
        console.error("Homepage reviews error:", error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    }

    loadReviews();
  }, []);

  return (
    <main>
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/piano-hero.jpg')",
          }}
        />

        <div className="absolute inset-0 bg-ink/70" />

        <div className="relative z-10">
          <p className="text-sm uppercase tracking-widest text-gold font-semibold mb-4">
            Piano with Aaron
          </p>

          <h1 className="font-display text-5xl md:text-6xl max-w-3xl mb-6 text-cream">
            Start Playing Piano Today
          </h1>

          <p className="opacity-80 max-w-xl mb-8 text-cream mx-auto">
            Structured, premium video courses that take you from your first
            note to playing the songs you love.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/courses"
              className="px-6 py-3 rounded-lg bg-gold text-ink font-semibold"
            >
              Browse courses
            </a>

            <a
              href="/signup"
              className="px-6 py-3 rounded-lg border border-cream/40 text-cream"
            >
              Sign up free
            </a>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="font-display text-3xl mb-8 text-center">
            Featured Courses
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-widest text-gold font-semibold mb-3">
            Student Reviews
          </p>

          <h2 className="font-display text-3xl">
            What students are saying
          </h2>
        </div>

        {reviewsLoading ? (
          <div className="rounded-2xl border border-gold/20 bg-white/60 p-8 text-center dark:bg-deep/60">
            <p className="opacity-70">Loading student reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-gold/20 bg-white/60 p-8 text-center dark:bg-deep/60">
            <p className="opacity-70">
              Approved student reviews will appear here.
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

              const studentInitial =
                studentName.trim().charAt(0).toUpperCase() || "S";

              return (
                <article
                  key={review.id}
                  className="flex h-full flex-col rounded-2xl border border-gold/20 bg-white/60 p-6 shadow-sm dark:bg-deep/60"
                >
                  <StarRating rating={review.rating} />

                  <blockquote className="mt-5 flex-1 text-center leading-7 opacity-80">
                    “{review.comment}”
                  </blockquote>

                  <div className="mt-6 border-t border-gold/10 pt-5 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink font-bold">
                      {studentInitial}
                    </div>

                    <h3 className="mt-3 font-semibold">
                      {studentName}
                    </h3>

                    <p className="mt-1 text-sm opacity-60">
                      {courseTitle}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
