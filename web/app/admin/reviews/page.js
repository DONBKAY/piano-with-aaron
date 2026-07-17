"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getToken } from "../../../lib/api";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

const STATUS_STYLES = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  APPROVED: "border-green-200 bg-green-50 text-green-800",
  REJECTED: "border-red-200 bg-red-50 text-red-800",
};

function getReviewsFromResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.reviews)) {
    return data.reviews;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Unknown date";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function StarRating({ rating }) {
  const safeRating = Number(rating) || 0;

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${safeRating} out of 5 stars`}
    >
      <div className="flex text-lg">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= safeRating ? "text-gold" : "text-gray-300"}
          >
            ★
          </span>
        ))}
      </div>

      <span className="text-sm font-semibold opacity-70">
        {safeRating}/5
      </span>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [activeFilter, setActiveFilter] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionReviewId, setActionReviewId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadReviews = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("Your administrator session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/reviews/admin`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not load reviews.");
      }

      setReviews(getReviewsFromResponse(data));
    } catch (requestError) {
      console.error("Load admin reviews error:", requestError);

      setError(
        requestError.message ||
          "Something went wrong while loading the reviews."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const statistics = useMemo(() => {
    return reviews.reduce(
      (totals, review) => {
        totals.ALL += 1;

        if (review.status === "PENDING") {
          totals.PENDING += 1;
        }

        if (review.status === "APPROVED") {
          totals.APPROVED += 1;
        }

        if (review.status === "REJECTED") {
          totals.REJECTED += 1;
        }

        return totals;
      },
      {
        ALL: 0,
        PENDING: 0,
        APPROVED: 0,
        REJECTED: 0,
      }
    );
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesStatus =
        activeFilter === "ALL" || review.status === activeFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const studentName =
        review.user?.name ||
        review.user?.fullName ||
        review.student?.name ||
        "";

      const studentEmail =
        review.user?.email ||
        review.student?.email ||
        "";

      const courseTitle =
        review.course?.title ||
        review.courseTitle ||
        "";

      const comment = review.comment || "";

      const searchableText = [
        studentName,
        studentEmail,
        courseTitle,
        comment,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [reviews, activeFilter, searchTerm]);

  async function updateStatus(reviewId, status) {
    const token = getToken();

    if (!token) {
      setError("Your administrator session has expired. Please log in again.");
      return;
    }

    try {
      setActionReviewId(reviewId);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/reviews/admin/${reviewId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || `Could not mark the review as ${status.toLowerCase()}.`
        );
      }

      setReviews((currentReviews) =>
        currentReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                ...(data.review || {}),
                status,
              }
            : review
        )
      );

      setMessage(
        data.message ||
          `The review has been marked as ${status.toLowerCase()}.`
      );
    } catch (requestError) {
      console.error("Update review status error:", requestError);

      setError(
        requestError.message ||
          "Something went wrong while updating the review."
      );
    } finally {
      setActionReviewId(null);
    }
  }

  async function deleteReview(reviewId) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this review?"
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Your administrator session has expired. Please log in again.");
      return;
    }

    try {
      setActionReviewId(reviewId);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/reviews/admin/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not delete the review.");
      }

      setReviews((currentReviews) =>
        currentReviews.filter((review) => review.id !== reviewId)
      );

      setMessage(data.message || "The review has been deleted.");
    } catch (requestError) {
      console.error("Delete review error:", requestError);

      setError(
        requestError.message ||
          "Something went wrong while deleting the review."
      );
    } finally {
      setActionReviewId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-gold">
            Administration
          </p>

          <h1 className="font-display text-3xl font-bold">
            Review Management
          </h1>

          <p className="mt-2 max-w-2xl opacity-70">
            Approve, reject or delete reviews submitted by enrolled students.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReviews}
          disabled={loading}
          className="w-fit rounded-lg border border-gold/30 px-5 py-2.5 font-semibold transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh reviews"}
        </button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gold/20 bg-white/60 p-5 dark:bg-deep/60">
          <p className="text-sm opacity-60">Total reviews</p>
          <p className="mt-2 text-3xl font-bold">{statistics.ALL}</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <p className="text-sm opacity-70">Pending</p>
          <p className="mt-2 text-3xl font-bold">{statistics.PENDING}</p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900">
          <p className="text-sm opacity-70">Approved</p>
          <p className="mt-2 text-3xl font-bold">
            {statistics.APPROVED}
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
          <p className="text-sm opacity-70">Rejected</p>
          <p className="mt-2 text-3xl font-bold">
            {statistics.REJECTED}
          </p>
        </div>
      </div>

      {error && (
        <div
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700"
          role="status"
        >
          {message}
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-gold/20 bg-white/60 p-4 dark:bg-deep/60">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => {
              const selected = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selected
                      ? "bg-gold text-ink"
                      : "border border-gold/20 hover:bg-gold/10"
                  }`}
                >
                  {filter.charAt(0) + filter.slice(1).toLowerCase()}
                  <span className="ml-2 opacity-70">
                    {statistics[filter]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-full xl:max-w-sm">
            <label htmlFor="review-search" className="sr-only">
              Search reviews
            </label>

            <input
              id="review-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search student, course or comment..."
              className="w-full rounded-lg border border-gold/30 bg-white px-4 py-2.5 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 dark:bg-ink dark:text-cream"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gold/20 bg-white/60 p-10 text-center dark:bg-deep/60">
          <p className="opacity-70">Loading submitted reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-gold/20 bg-white/60 p-10 text-center dark:bg-deep/60">
          <div className="text-4xl">⭐</div>

          <h2 className="mt-4 font-display text-xl font-bold">
            No reviews found
          </h2>

          <p className="mt-2 opacity-60">
            There are no reviews matching the selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredReviews.map((review) => {
            const studentName =
              review.user?.name ||
              review.user?.fullName ||
              review.student?.name ||
              "Unknown student";

            const studentEmail =
              review.user?.email ||
              review.student?.email ||
              "";

            const courseTitle =
              review.course?.title ||
              review.courseTitle ||
              "Unknown course";

            const courseSlug =
              review.course?.slug ||
              review.courseSlug ||
              "";

            const isProcessing = actionReviewId === review.id;

            return (
              <article
                key={review.id}
                className="rounded-2xl border border-gold/20 bg-white/60 p-5 shadow-sm dark:bg-deep/60 md:p-6"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                          STATUS_STYLES[review.status] ||
                          "border-gray-200 bg-gray-50 text-gray-700"
                        }`}
                      >
                        {review.status || "UNKNOWN"}
                      </span>

                      <span className="text-sm opacity-60">
                        Submitted {formatDate(review.createdAt)}
                      </span>

                      {review.updatedAt &&
                        review.updatedAt !== review.createdAt && (
                          <span className="text-sm opacity-60">
                            Updated {formatDate(review.updatedAt)}
                          </span>
                        )}
                    </div>

                    <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="font-display text-xl font-bold">
                          {studentName}
                        </h2>

                        {studentEmail && (
                          <p className="mt-1 text-sm opacity-60">
                            {studentEmail}
                          </p>
                        )}
                      </div>

                      <StarRating rating={review.rating} />
                    </div>

                    <div className="mt-4 rounded-xl border border-gold/10 bg-cream/50 p-4 dark:bg-ink/30">
                      <p className="whitespace-pre-wrap leading-7">
                        {review.comment || "No written comment was provided."}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                      <span className="opacity-60">Course:</span>

                      {courseSlug ? (
                        <Link
                          href={`/courses/${courseSlug}`}
                          className="font-semibold text-gold underline underline-offset-4"
                        >
                          {courseTitle}
                        </Link>
                      ) : (
                        <span className="font-semibold">{courseTitle}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 xl:w-44 xl:flex-col">
                    {review.status !== "APPROVED" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(review.id, "APPROVED")
                        }
                        disabled={isProcessing}
                        className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? "Saving..." : "Approve"}
                      </button>
                    )}

                    {review.status !== "REJECTED" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(review.id, "REJECTED")
                        }
                        disabled={isProcessing}
                        className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? "Saving..." : "Reject"}
                      </button>
                    )}

                    {review.status !== "PENDING" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(review.id, "PENDING")
                        }
                        disabled={isProcessing}
                        className="rounded-lg border border-gold/30 px-4 py-2.5 text-sm font-semibold transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? "Saving..." : "Mark pending"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteReview(review.id)}
                      disabled={isProcessing}
                      className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProcessing ? "Processing..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
