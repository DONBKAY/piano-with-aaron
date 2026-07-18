"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { courseApi, getToken, lessonApi } from "../../../lib/api";
import VideoPlayer from "../../../components/VideoPlayer";
import ReviewForm from "../../../components/ReviewForm";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function LessonPlayerPage() {
  return (
    <Suspense fallback={<main className="p-8">Loading...</main>}>
      <LessonPlayerInner />
    </Suspense>
  );
}

function flattenLessons(course) {
  const flat = [];

  for (const section of course?.sections || []) {
    for (const lesson of section.lessons || []) {
      flat.push({
        ...lesson,
        sectionTitle: section.title,
      });
    }
  }

  return flat;
}

function getDownloadFilename(response, courseTitle) {
  const disposition = response.headers.get("content-disposition");

  const filenameMatch = disposition?.match(
    /filename\*?=(?:UTF-8''|")?([^";]+)"?/i
  );

  if (filenameMatch?.[1]) {
    return decodeURIComponent(filenameMatch[1].replace(/"/g, ""));
  }

  const safeCourseTitle = String(courseTitle || "course")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `${safeCourseTitle || "course"}-certificate.pdf`;
}

async function readApiError(response, fallbackMessage) {
  try {
    const data = await response.json();
    return data.error || data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function LessonPlayerInner() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [enrolled, setEnrolled] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const [activeLessonId, setActiveLessonId] = useState(
    searchParams.get("lesson")
  );

  const [collapsedSections, setCollapsedSections] = useState({});

  const [certificateStatus, setCertificateStatus] = useState(null);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateActionLoading, setCertificateActionLoading] =
    useState(false);
  const [certificateMessage, setCertificateMessage] = useState("");
  const [certificateError, setCertificateError] = useState("");

  const token = getToken();

  async function loadCertificateStatus(courseId, authToken) {
    if (!courseId || !authToken) {
      return;
    }

    setCertificateLoading(true);
    setCertificateError("");

    try {
      const response = await fetch(
        `${API_URL}/certificates/course/${courseId}/status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Unable to load certificate information"
          )
        );
      }

      const data = await response.json();
      setCertificateStatus(data);
    } catch (err) {
      setCertificateError(
        err.message || "Unable to load certificate information"
      );
    } finally {
      setCertificateLoading(false);
    }
  }

  async function loadLearningPage() {
    if (!token) {
      router.push(`/login?next=/learn/${slug}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await courseApi.getForLearning(slug, token);

      setCourse(data.course);
      setEnrolled(data.enrolled);
      setProgress(data.progress || null);

      if (!data.enrolled) {
        return;
      }

      const flat = flattenLessons(data.course);
      const requestedLessonId = searchParams.get("lesson");

      const initialLesson =
        flat.find((lesson) => lesson.id === requestedLessonId) ||
        flat.find((lesson) => !lesson.completed) ||
        flat[0];

      if (initialLesson) {
        setActiveLessonId(initialLesson.id);
      }

      await loadCertificateStatus(data.course.id, token);
    } catch (err) {
      setError(err.message || "Unable to load this course");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLearningPage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const flatLessons = useMemo(() => {
    return course ? flattenLessons(course) : [];
  }, [course]);

  const activeLesson = flatLessons.find(
    (lesson) => lesson.id === activeLessonId
  );

  const activeIndex = flatLessons.findIndex(
    (lesson) => lesson.id === activeLessonId
  );

  const courseCompleted =
    progress &&
    progress.total > 0 &&
    progress.completed === progress.total;

  function selectLesson(lessonId) {
    setActiveLessonId(lessonId);

    router.replace(`/learn/${slug}?lesson=${lessonId}`, {
      scroll: false,
    });
  }

  function toggleSection(sectionId) {
    setCollapsedSections((previous) => ({
      ...previous,
      [sectionId]: !previous[sectionId],
    }));
  }

  async function handleMarkComplete() {
    if (!activeLesson || !token || marking) {
      return;
    }

    setMarking(true);
    setError("");
    setCertificateMessage("");
    setCertificateError("");

    try {
      await lessonApi.complete(activeLesson.id, token);

      const data = await courseApi.getForLearning(slug, token);

      setCourse(data.course);
      setProgress(data.progress || null);

      await loadCertificateStatus(data.course.id, token);
    } catch (err) {
      setError(err.message || "Unable to mark lesson as complete");
    } finally {
      setMarking(false);
    }
  }

  async function handleIssueCertificate() {
    if (!course?.id || !token || certificateActionLoading) {
      return;
    }

    setCertificateActionLoading(true);
    setCertificateMessage("");
    setCertificateError("");

    try {
      const response = await fetch(
        `${API_URL}/certificates/course/${course.id}/issue`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Unable to issue your certificate")
        );
      }

      const data = await response.json();

      setCertificateStatus((previous) => ({
        ...(previous || {}),
        eligible: true,
        certificateIssued: true,
        certificate: data.certificate,
        progress:
          previous?.progress ||
          progress || {
            completed: 0,
            total: 0,
            percent: 0,
          },
      }));

      setCertificateMessage(
        data.message || "Certificate issued successfully"
      );
    } catch (err) {
      setCertificateError(
        err.message || "Unable to issue your certificate"
      );
    } finally {
      setCertificateActionLoading(false);
    }
  }

  async function handleDownloadCertificate() {
    const certificateCode =
      certificateStatus?.certificate?.certificateCode;

    if (!certificateCode || !token || certificateActionLoading) {
      return;
    }

    setCertificateActionLoading(true);
    setCertificateMessage("");
    setCertificateError("");

    try {
      const response = await fetch(
        `${API_URL}/certificates/${encodeURIComponent(
          certificateCode
        )}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Unable to download your certificate"
          )
        );
      }

      const certificateBlob = await response.blob();
      const objectUrl = window.URL.createObjectURL(certificateBlob);

      const downloadLink = document.createElement("a");

      downloadLink.href = objectUrl;
      downloadLink.download = getDownloadFilename(
        response,
        course?.title
      );

      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      window.URL.revokeObjectURL(objectUrl);

      setCertificateMessage("Certificate downloaded successfully.");
    } catch (err) {
      setCertificateError(
        err.message || "Unable to download your certificate"
      );
    } finally {
      setCertificateActionLoading(false);
    }
  }

  function goTo(offset) {
    const targetLesson = flatLessons[activeIndex + offset];

    if (targetLesson) {
      selectLesson(targetLesson.id);
    }
  }

  if (loading) {
    return <main className="p-8">Loading lesson...</main>;
  }

  if (error && !course) {
    return <main className="p-8 text-red-600">{error}</main>;
  }

  if (enrolled === false) {
    return (
      <main className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl mb-3">
          You&apos;re not enrolled in this course yet
        </h1>

        <p className="opacity-70 mb-6">
          Enroll to unlock the full lesson player and track your progress.
        </p>

        <a
          href={`/courses/${slug}`}
          className="inline-flex px-6 py-2.5 rounded-lg bg-gold text-ink font-semibold"
        >
          View course
        </a>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="p-8 text-red-600">
        Course information could not be loaded.
      </main>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="md:w-80 border-b md:border-b-0 md:border-r border-gold/20 bg-white/40 dark:bg-deep/40">
        <div className="p-4 border-b border-gold/10">
          <a
            href={`/courses/${slug}`}
            className="text-sm opacity-60 hover:opacity-100"
          >
            ← Back to course
          </a>

          <h2 className="font-display text-lg mt-1">{course.title}</h2>

          {progress && (
            <div className="mt-3">
              <div className="flex justify-between text-xs opacity-60 mb-1">
                <span>
                  {progress.completed}/{progress.total} lessons
                </span>

                <span>{progress.percent}%</span>
              </div>

              <div className="h-2 rounded-full bg-gold/15 overflow-hidden">
                <div
                  className="h-full bg-gold transition-all"
                  style={{
                    width: `${Math.min(progress.percent, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="max-h-[70vh] md:max-h-[calc(100vh-140px)] overflow-y-auto">
          {course.sections.map((section) => (
            <div
              key={section.id}
              className="border-b border-gold/10"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-sm"
              >
                <span>{section.title}</span>

                <span className="opacity-50">
                  {collapsedSections[section.id] ? "+" : "−"}
                </span>
              </button>

              {!collapsedSections[section.id] && (
                <ul>
                  {section.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        onClick={() => selectLesson(lesson.id)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gold/10 transition ${
                          lesson.id === activeLessonId
                            ? "bg-gold/15 font-medium"
                            : ""
                        }`}
                      >
                        <span>{lesson.completed ? "✅" : "▶️"}</span>
                        <span>{lesson.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main player */}
      <main className="flex-1 p-4 md:p-8">
        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {activeLesson ? (
          <>
            <VideoPlayer
              videoUrl={activeLesson.videoUrl}
              title={activeLesson.title}
            />

            <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-gold font-semibold mb-1">
                  {activeLesson.sectionTitle}
                </p>

                <h1 className="font-display text-2xl">
                  {activeLesson.title}
                </h1>
              </div>

              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={marking || activeLesson.completed}
                className="px-5 py-2.5 rounded-lg bg-gold text-ink font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activeLesson.completed
                  ? "Completed ✅"
                  : marking
                    ? "Saving..."
                    : "Mark as complete"}
              </button>
            </div>

            {activeLesson.pdfUrl && (
              <a
                href={activeLesson.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-sm text-gold underline"
              >
                📄 Download lesson PDF
              </a>
            )}

            <div className="flex justify-between mt-10 pt-6 border-t border-gold/10">
              <button
                type="button"
                onClick={() => goTo(-1)}
                disabled={activeIndex <= 0}
                className="px-4 py-2 rounded-lg border border-gold/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <button
                type="button"
                onClick={() => goTo(1)}
                disabled={activeIndex >= flatLessons.length - 1}
                className="px-4 py-2 rounded-lg border border-gold/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </>
        ) : (
          <p className="opacity-60">Select a lesson to begin.</p>
        )}

        {/* Certificate section */}
        <section className="mt-10 rounded-2xl border border-gold/25 bg-gold/5 p-5 md:p-7">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-2">
                Course certificate
              </p>

              <h2 className="font-display text-2xl mb-2">
                Certificate of Completion
              </h2>

              {certificateLoading ? (
                <p className="text-sm opacity-70">
                  Checking certificate eligibility...
                </p>
              ) : certificateStatus?.certificateIssued ? (
                <>
                  <p className="text-sm opacity-75">
                    Your certificate has been issued and is ready to
                    download.
                  </p>

                  <p className="mt-2 text-xs opacity-60">
                    Certificate ID:{" "}
                    <span className="font-semibold">
                      {
                        certificateStatus.certificate
                          ?.certificateCode
                      }
                    </span>
                  </p>
                </>
              ) : certificateStatus?.eligible || courseCompleted ? (
                <p className="text-sm opacity-75">
                  Congratulations! You completed every lesson. Claim your
                  certificate now.
                </p>
              ) : (
                <p className="text-sm opacity-75">
                  Complete every lesson in this course to unlock your
                  certificate.
                </p>
              )}

              {!certificateStatus?.certificateIssued && progress && (
                <div className="mt-4 max-w-md">
                  <div className="flex justify-between text-xs opacity-60 mb-1">
                    <span>Certificate progress</span>
                    <span>{progress.percent}%</span>
                  </div>

                  <div className="h-2 rounded-full bg-gold/15 overflow-hidden">
                    <div
                      className="h-full bg-gold transition-all"
                      style={{
                        width: `${Math.min(progress.percent, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0">
              {certificateStatus?.certificateIssued ? (
                <button
                  type="button"
                  onClick={handleDownloadCertificate}
                  disabled={certificateActionLoading}
                  className="w-full lg:w-auto px-6 py-3 rounded-lg bg-gold text-ink font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {certificateActionLoading
                    ? "Preparing PDF..."
                    : "Download Certificate"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleIssueCertificate}
                  disabled={
                    certificateActionLoading ||
                    certificateLoading ||
                    !(
                      certificateStatus?.eligible ||
                      courseCompleted
                    )
                  }
                  className="w-full lg:w-auto px-6 py-3 rounded-lg bg-gold text-ink font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {certificateActionLoading
                    ? "Issuing..."
                    : "Claim Certificate"}
                </button>
              )}
            </div>
          </div>

          {certificateMessage && (
            <div className="mt-4 rounded-lg border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm text-green-700 dark:text-green-300">
              {certificateMessage}
            </div>
          )}

          {certificateError && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {certificateError}
            </div>
          )}
        </section>

        <ReviewForm courseId={course.id} />
      </main>
    </div>
  );
}
