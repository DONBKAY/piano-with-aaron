"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { courseApi, getToken, lessonApi } from "../../../lib/api";
import VideoPlayer from "../../../components/VideoPlayer";
import ReviewForm from "../../../components/ReviewForm";

export default function LessonPlayerPage() {
  return (
    <Suspense fallback={<main className="p-8">Loading...</main>}>
      <LessonPlayerInner />
    </Suspense>
  );
}

function flattenLessons(course) {
  const flat = [];

  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      flat.push({
        ...lesson,
        sectionTitle: section.title,
      });
    }
  }

  return flat;
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
  const [activeLessonId, setActiveLessonId] = useState(
    searchParams.get("lesson")
  );
  const [collapsedSections, setCollapsedSections] = useState({});
  const [marking, setMarking] = useState(false);

  const token = getToken();

  useEffect(() => {
    if (!token) {
      router.push(`/login?next=/learn/${slug}`);
      return;
    }

    courseApi
      .getForLearning(slug, token)
      .then((data) => {
        setCourse(data.course);
        setEnrolled(data.enrolled);
        setProgress(data.progress || null);

        if (!data.enrolled) {
          return;
        }

        const flat = flattenLessons(data.course);
        const requested = searchParams.get("lesson");

        const initial =
          flat.find((lesson) => lesson.id === requested) ||
          flat.find((lesson) => !lesson.completed) ||
          flat[0];

        if (initial) {
          setActiveLessonId(initial.id);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });

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
    if (!activeLesson || !token) {
      return;
    }

    setMarking(true);
    setError("");

    try {
      await lessonApi.complete(activeLesson.id, token);

      const data = await courseApi.getForLearning(slug, token);

      setCourse(data.course);
      setProgress(data.progress || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setMarking(false);
    }
  }

  function goTo(offset) {
    const target = flatLessons[activeIndex + offset];

    if (target) {
      selectLesson(target.id);
    }
  }

  if (loading) {
    return <main className="p-8">Loading lesson...</main>;
  }

  if (error) {
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
          className="px-6 py-2.5 rounded-lg bg-gold text-ink font-semibold"
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
                    width: `${progress.percent}%`,
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
                className="px-5 py-2.5 rounded-lg bg-gold text-ink font-semibold disabled:opacity-50"
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
                className="px-4 py-2 rounded-lg border border-gold/30 disabled:opacity-30"
              >
                ← Previous
              </button>

              <button
                type="button"
                onClick={() => goTo(1)}
                disabled={activeIndex >= flatLessons.length - 1}
                className="px-4 py-2 rounded-lg border border-gold/30 disabled:opacity-30"
              >
                Next →
              </button>
            </div>

            <ReviewForm courseId={course.id} />
          </>
        ) : (
          <>
            <p className="opacity-60">Select a lesson to begin.</p>

            <ReviewForm courseId={course.id} />
          </>
        )}
      </main>
    </div>
  );
}
