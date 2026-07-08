"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { courseApi, getToken, paymentApi } from "../../../lib/api";

function formatDuration(seconds) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

export default function CourseDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    courseApi
      .getBySlug(slug, token)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const [enrolling, setEnrolling] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  if (loading) return <main className="max-w-4xl mx-auto px-4 py-16">Loading...</main>;
  if (error) return <main className="max-w-4xl mx-auto px-4 py-16 text-red-600">{error}</main>;

  const { course, isEnrolled } = data;
  const priceLabel = course.currency === "USD" ? `$${course.price}` : `GHS ${course.price}`;
  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);

  async function handleEnroll() {
    const token = getToken();
    if (!token) {
      window.location.href = `/login?next=/courses/${course.slug}`;
      return;
    }

    setCheckoutError("");
    setEnrolling(true);
    try {
      const { authorizationUrl, reference } = await paymentApi.initialize(course.id, token);
      // Remember which course this reference is for, so the callback page
      // knows where to send the student back to after verifying.
      sessionStorage.setItem(`pwa_pending_${reference}`, course.slug);
      window.location.href = authorizationUrl;
    } catch (err) {
      setCheckoutError(err.message);
      setEnrolling(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <p className="text-xs uppercase tracking-wide text-gold font-semibold mb-2">
        {course.category} · {course.subcategory}
      </p>
      <h1 className="font-display text-4xl mb-4">{course.title}</h1>
      <p className="opacity-70 mb-6 max-w-2xl">{course.description}</p>

      <div className="flex items-center gap-4 mb-10">
        <span className="text-2xl font-semibold">{priceLabel}</span>
        <span className="text-sm opacity-60">
          {course.sections.length} sections · {totalLessons} lessons
        </span>
        {isEnrolled ? (
          <a
            href={`/learn/${course.slug}`}
            className="ml-auto px-6 py-2.5 rounded-lg bg-gold text-ink font-semibold"
          >
            Go to lessons
          </a>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="ml-auto px-6 py-2.5 rounded-lg bg-gold text-ink font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {enrolling ? "Redirecting to checkout..." : "Enroll now"}
          </button>
        )}
      </div>

      {checkoutError && (
        <p className="text-sm text-red-600 mb-6 -mt-6">{checkoutError}</p>
      )}

      <h2 className="font-display text-2xl mb-4">Curriculum</h2>
      <div className="space-y-4">
        {course.sections.map((section) => (
          <div key={section.id} className="border border-gold/20 rounded-xl overflow-hidden">
            <div className="bg-gold/10 px-4 py-3 font-medium">{section.title}</div>
            <ul className="divide-y divide-gold/10">
              {section.lessons.map((lesson) => (
                <li key={lesson.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="flex items-center gap-2">
                    {lesson.locked ? (
                      <span title="Enroll to unlock">🔒</span>
                    ) : (
                      <span title="Available">▶️</span>
                    )}
                    {lesson.title}
                    {lesson.isPreview && (
                      <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                        Preview
                      </span>
                    )}
                  </span>
                  <span className="opacity-50">{formatDuration(lesson.durationSec)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
