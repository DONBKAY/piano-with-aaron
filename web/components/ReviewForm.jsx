"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/$/, "");

const STATUS_LABELS = {
  PENDING: "Waiting for approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default function ReviewForm({ courseId }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState(null);
  const [hasReview, setHasReview] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  }, []);

  const loadReview = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      setError("Course information is missing.");
      return;
    }

    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/reviews/course/${courseId}/my`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("token");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Could not load your review.");
      }

      if (data.review) {
        setRating(data.review.rating);
        setComment(data.review.comment);
        setReviewStatus(data.review.status);
        setHasReview(true);
      } else {
        setRating(0);
        setComment("");
        setReviewStatus(null);
        setHasReview(false);
      }
    } catch (requestError) {
      console.error("Load review error:", requestError);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [courseId, getToken]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const token = getToken();

    if (!token) {
      setError("Please log in before submitting a review.");
      return;
    }

    if (!courseId) {
      setError("Course information is missing.");
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5 stars.");
      return;
    }

    const cleanedComment = comment.trim();

    if (cleanedComment.length < 10) {
      setError("Your review must contain at least 10 characters.");
      return;
    }

    if (cleanedComment.length > 1000) {
      setError("Your review cannot exceed 1,000 characters.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/api/reviews/course/${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            comment: cleanedComment,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Could not submit your review.");
      }

      setRating(data.review?.rating ?? rating);
      setComment(data.review?.comment ?? cleanedComment);
      setReviewStatus(data.review?.status ?? "PENDING");
      setHasReview(true);

      setMessage(
        data.message ||
          "Your review has been submitted and is waiting for approval."
      );
    } catch (requestError) {
      console.error("Submit review error:", requestError);
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    const token = getToken();

    if (!token) {
      setError("Please log in again.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete your review?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/api/reviews/course/${courseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Could not delete your review.");
      }

      setRating(0);
      setHoveredRating(0);
      setComment("");
      setReviewStatus(null);
      setHasReview(false);
      setMessage(data.message || "Your review has been deleted.");
    } catch (requestError) {
      console.error("Delete review error:", requestError);
      setError(requestError.message);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">Loading your review...</p>
      </section>
    );
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    return (
      <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">
          Review this course
        </h2>

        <p className="mt-2 text-gray-600">
          Please log in to submit a review.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {hasReview ? "Your review" : "Review this course"}
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Share your experience with other piano students.
          </p>
        </div>

        {reviewStatus && (
          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
              reviewStatus === "APPROVED"
                ? "bg-green-100 text-green-800"
                : reviewStatus === "REJECTED"
                  ? "bg-red-100 text-red-800"
                  : "bg-amber-100 text-amber-800"
            }`}
          >
            {STATUS_LABELS[reviewStatus] || reviewStatus}
          </span>
        )}
      </div>

      {reviewStatus === "REJECTED" && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Your previous review was not approved. You may edit it and submit it
          again.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset disabled={submitting || deleting}>
          <legend className="mb-2 text-sm font-semibold text-gray-800">
            Your rating
          </legend>

          <div
            className="mb-5 flex items-center gap-1"
            onMouseLeave={() => setHoveredRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const activeRating = hoveredRating || rating;
              const selected = star <= activeRating;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  className={`text-4xl leading-none transition ${
                    selected
                      ? "text-yellow-400"
                      : "text-gray-300 hover:text-yellow-300"
                  }`}
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  aria-pressed={rating === star}
                >
                  ★
                </button>
              );
            })}

            <span className="ml-3 text-sm text-gray-600">
              {rating > 0 ? `${rating} out of 5` : "Select a rating"}
            </span>
          </div>

          <label
            htmlFor="review-comment"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            Your comment
          </label>

          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={6}
            maxLength={1000}
            placeholder="Tell other students how this course helped you..."
            className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
          />

          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>Minimum 10 characters</span>
            <span>{comment.length}/1000</span>
          </div>

          {error && (
            <div
              className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
              role="status"
            >
              {message}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={submitting || deleting}
              className="rounded-xl bg-purple-700 px-6 py-3 font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting..."
                : hasReview
                  ? "Update review"
                  : "Submit review"}
            </button>

            {hasReview && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting || deleting}
                className="rounded-xl border border-red-300 px-6 py-3 font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete review"}
              </button>
            )}
          </div>
        </fieldset>
      </form>

      <p className="mt-4 text-xs leading-5 text-gray-500">
        New and edited reviews are checked by an administrator before appearing
        publicly.
      </p>
    </section>
  );
}
