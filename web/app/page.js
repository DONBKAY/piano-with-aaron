"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { courseApi } from "../lib/api";
import CourseCard from "../components/CourseCard";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

const statistics = [
  {
    value: "300+",
    title: "Students Taught",
    description: "And growing every day",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    value: "2016",
    title: "Teaching Since",
    description: "Years of practical experience",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="m2 10 10-5 10 5-10 5-10-5ZM6 12.5V17l6 3 6-3v-4.5M22 10v6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    value: "2007",
    title: "Playing Since",
    description: "A journey built on passion",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 18V5l11-2v13M9 9l11-2M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm11-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    value: "Gospel",
    title: "Piano Focus",
    description: "Chords, progressions and playing by ear",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 5h16v14H4V5Zm4 0v14m4-14v14m4-14v14M4 13h16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const learningBenefits = [
  {
    title: "Understand Chords",
    description:
      "Learn how major, minor and extended chords are formed and used.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 5h16v14H4V5Zm4 0v14m4-14v14m4-14v14M4 13h16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Play by Ear",
    description:
      "Train your ears to identify chords, progressions and musical patterns.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 18c0 2-1.5 3-3 3-2.5 0-4-1.7-4-4 0-2 1.1-3.2 2.5-4.5C9 11.1 10 9.8 10 7.5A5.5 5.5 0 0 1 20.5 5M15 18c0-2 2-2.4 2-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Gospel Piano Focus",
    description:
      "Master practical gospel progressions used in worship and church music.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 18V5l11-2v13M9 9l11-2M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm11-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function StarRating({ rating, align = "center" }) {
  const safeRating = Math.max(
    0,
    Math.min(5, Math.round(Number(rating) || 0))
  );

  const alignment =
    align === "left" ? "justify-start" : "justify-center";

  return (
    <div
      className={`flex items-center ${alignment} gap-1`}
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
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

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
        console.error("Homepage courses error:", error);
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

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error || "Could not load reviews."
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
        console.error("Homepage reviews error:", error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    }

    loadReviews();
  }, []);

  return (
    <main className="overflow-hidden">
      <section className="relative border-b border-gold/20 bg-ink text-cream">
        <div
          className="absolute inset-0 opacity-[0.07]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(212,175,55,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.35) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div
          className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-gold/20 blur-[130px]"
          aria-hidden="true"
        />

        <div
          className="absolute right-0 top-0 h-96 w-96 rounded-full bg-gold/10 blur-[150px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:py-20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-gold/30 bg-gold/10 px-4 py-2">
              <span
                className="h-2 w-2 rounded-full bg-gold"
                aria-hidden="true"
              />

              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
                Gospel Piano Lessons
              </p>
            </div>

            <h1 className="mt-7 max-w-3xl font-display text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              Master Gospel Piano{" "}
              <span className="text-gold">
                with Confidence
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-cream/70 sm:text-lg">
              Learn chords, progressions and how to play by ear
              through structured lessons created for beginners,
              intermediate and advanced pianists.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-gold px-7 py-4 font-bold text-ink shadow-lg shadow-gold/10 transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Start Learning
                <span aria-hidden="true">→</span>
              </Link>

              <a
                href="https://www.youtube.com/@PIANOTUTORIALS-GH"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-cream/25 px-7 py-4 font-semibold text-cream transition hover:-translate-y-0.5 hover:border-gold hover:text-gold"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs text-ink"
                  aria-hidden="true"
                >
                  ▶
                </span>

                Watch on YouTube
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-3">
                {["A", "B", "D", "E"].map((initial) => (
                  <span
                    key={initial}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-deep text-sm font-bold text-gold"
                  >
                    {initial}
                  </span>
                ))}
              </div>

              <div>
                <div className="flex gap-1 text-gold">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>

                <p className="mt-1 text-sm text-cream/60">
                  Trusted by 300+ students
                </p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div
              className="absolute inset-10 rounded-full bg-gold/20 blur-[90px]"
              aria-hidden="true"
            />

            <div className="relative mx-auto max-w-lg">
              <div className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-deep shadow-2xl shadow-black/50">
                <div className="relative aspect-[4/5]">
                  <Image
                    src="/images/aaron-piano-about.jpeg"
                    alt="Aaron teaching and playing gospel piano"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover object-center"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/10" />

                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
                      Meet Your Instructor
                    </p>

                    <h2 className="mt-2 font-display text-3xl font-bold text-white">
                      Aaron
                    </h2>

                    <p className="mt-1 text-sm text-cream/70">
                      Gospel Piano Instructor and Educator
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-3 top-12 rounded-2xl border border-gold/25 bg-black/85 p-4 shadow-xl backdrop-blur sm:-left-10">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <div>
                    <p className="text-xl font-bold text-white">
                      300+
                    </p>

                    <p className="text-xs text-cream/60">
                      Students taught
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-3 top-1/2 rounded-2xl border border-gold/25 bg-black/85 p-4 shadow-xl backdrop-blur sm:-right-10">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="m2 10 10-5 10 5-10 5-10-5ZM6 12.5V17l6 3 6-3v-4.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <div>
                    <p className="text-xl font-bold text-white">
                      2016
                    </p>

                    <p className="text-xs text-cream/60">
                      Teaching since
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 left-8 rounded-2xl border border-gold/25 bg-black/85 p-4 shadow-xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M9 18V5l11-2v13M9 9l11-2M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <div>
                    <p className="text-xl font-bold text-white">
                      2007
                    </p>

                    <p className="text-xs text-cream/60">
                      Piano journey
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gold/20 bg-deep text-cream">
        <div className="mx-auto grid max-w-7xl sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map((stat, index) => (
            <article
              key={stat.title}
              className={`flex items-center gap-4 px-6 py-8 ${
                index !== statistics.length - 1
                  ? "border-b border-gold/15 sm:border-r lg:border-b-0"
                  : ""
              }`}
            >
              <div className="shrink-0 text-gold">
                {stat.icon}
              </div>

              <div>
                <p className="font-display text-3xl font-bold text-gold">
                  {stat.value}
                </p>

                <h2 className="mt-1 font-semibold">
                  {stat.title}
                </h2>

                <p className="mt-1 text-xs leading-5 text-cream/55">
                  {stat.description}
                </p>
              </div>
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
              Follow structured lessons that help you develop
              practical piano skills one step at a time.
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
                  Featured courses will appear here once they
                  are published.
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

      <section className="border-y border-gold/15 bg-white px-4 py-20 text-ink dark:bg-deep dark:text-cream sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">
              Practical Learning
            </p>

            <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
              Why Learn With Aaron?
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {learningBenefits.map((benefit) => (
              <article
                key={benefit.title}
                className="group text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-ink text-gold shadow-lg transition group-hover:-translate-y-1 group-hover:bg-gold group-hover:text-ink dark:bg-black">
                  {benefit.icon}
                </div>

                <h3 className="mt-6 font-display text-2xl font-bold">
                  {benefit.title}
                </h3>

                <p className="mx-auto mt-4 max-w-sm leading-7 opacity-65">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-7 py-4 font-bold text-gold transition hover:-translate-y-0.5 dark:bg-gold dark:text-ink"
            >
              Browse All Courses
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-cream px-4 py-20 text-ink dark:bg-ink dark:text-cream sm:px-6 lg:px-8">
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
              <div className="rounded-2xl border border-gold/20 bg-white/60 p-10 text-center dark:bg-deep/60">
                <p className="opacity-65">
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
                    studentName.trim().charAt(0).toUpperCase() ||
                    "S";

                  return (
                    <article
                      key={review.id}
                      className="relative flex h-full flex-col rounded-2xl border border-gold/20 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:bg-deep"
                    >
                      <span
                        className="absolute right-6 top-4 font-display text-6xl leading-none text-gold/15"
                        aria-hidden="true"
                      >
                        “
                      </span>

                      <StarRating
                        rating={review.rating}
                        align="left"
                      />

                      <blockquote className="relative mt-5 flex-1 leading-8 opacity-75">
                        “{review.comment}”
                      </blockquote>

                      <div className="mt-7 flex items-center gap-4 border-t border-gold/10 pt-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold font-bold text-ink">
                          {studentInitial}
                        </div>

                        <div>
                          <h3 className="font-semibold">
                            {studentName}
                          </h3>

                          <p className="mt-1 text-sm opacity-55">
                            {courseTitle}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-gold/15 bg-white px-4 py-20 text-ink dark:bg-deep dark:text-cream sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[2rem] bg-gold/10 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative overflow-hidden rounded-[2rem] border border-gold/30 shadow-2xl">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/images/aaron-piano-about.jpeg"
                  alt="Aaron playing gospel piano"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">
              Meet Your Instructor
            </p>

            <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
              Hi, I&apos;m Aaron
            </h2>

            <p className="mt-6 leading-8 opacity-70">
              I began learning piano in 2007 and started
              teaching in 2016 after recognizing that many
              students needed a simpler and more practical way
              to learn.
            </p>

            <p className="mt-4 leading-8 opacity-70">
              My mission is to help students understand chords,
              play by ear and become confident independent
              pianists.
            </p>

            <div className="mt-7 space-y-4">
              {[
                "Gospel piano instructor and educator",
                "300+ students taught",
                "Simple and practical teaching approach",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3"
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-ink"
                    aria-hidden="true"
                  >
                    ✓
                  </span>

                  <p className="font-medium opacity-80">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-4 font-bold text-ink transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Read My Story
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-ink text-cream">
        <div className="mx-auto grid max-w-7xl items-stretch lg:grid-cols-2">
          <div className="relative min-h-[420px] overflow-hidden">
            <Image
              src="/images/aaron-piano-about.jpeg"
              alt="Watch piano lessons with Aaron on YouTube"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-black/55" />

            <a
              href="https://www.youtube.com/@PIANOTUTORIALS-GH"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Piano With Aaron on YouTube"
              className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl transition hover:scale-110"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-9 w-9"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7L8 5Z" />
              </svg>
            </a>
          </div>

          <div className="flex items-center px-6 py-16 sm:px-10 lg:px-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">
                Free Piano Lessons
              </p>

              <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
                Watch and Learn on YouTube
              </h2>

              <p className="mt-6 max-w-xl leading-8 text-cream/65">
                Join thousands of learners as Aaron breaks down
                chords, progressions and gospel songs into
                simple, practical lessons.
              </p>

              <a
                href="https://www.youtube.com/@PIANOTUTORIALS-GH"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-3 rounded-xl border border-gold px-7 py-4 font-bold text-gold transition hover:bg-gold hover:text-ink"
              >
                Visit YouTube Channel
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gold px-4 py-20 text-ink sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 opacity-15"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8), transparent 25%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.3), transparent 30%)",
          }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.24em]">
            Start Your Journey
          </p>

          <h2 className="mt-4 font-display text-4xl font-bold sm:text-6xl">
            Ready to Become a Better Pianist?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-ink/75 sm:text-lg">
            Begin developing the knowledge, confidence and
            practical skills you need to play gospel piano
            independently.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-8 py-4 font-bold text-gold transition hover:-translate-y-0.5"
            >
              Browse Courses
              <span aria-hidden="true">→</span>
            </Link>

            <a
              href="https://wa.me/233248632153"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink/40 px-8 py-4 font-bold transition hover:bg-ink hover:text-gold"
            >
              Contact Aaron
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
