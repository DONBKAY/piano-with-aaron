"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getToken } from "../../../../lib/api";
import { adminApi } from "../../../../lib/adminApi";

export default function AdminCourseEditorPage() {
  const { id } = useParams();
  const token = getToken();

  const [course, setCourse] = useState(null);
  const [categories, setCategories] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [courseForm, setCourseForm] = useState(null);
  const [savingCourse, setSavingCourse] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  function load() {
    setLoading(true);
    adminApi
      .getCourse(token, id)
      .then((data) => {
        setCourse(data.course);
        setCourseForm({
          title: data.course.title,
          description: data.course.description,
          thumbnailUrl: data.course.thumbnailUrl || "",
          price: data.course.price,
          currency: data.course.currency,
          category: data.course.category,
          subcategory: data.course.subcategory,
          published: data.course.published,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    adminApi.categories(token).then((data) => setCategories(data.categories));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSaveCourse(e) {
    e.preventDefault();
    setSavingCourse(true);
    setError("");
    try {
      await adminApi.updateCourse(token, id, { ...courseForm, price: Number(courseForm.price) });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCourse(false);
    }
  }

  async function handleAddSection(e) {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    try {
      await adminApi.createSection(token, id, {
        title: newSectionTitle,
        order: course.sections.length,
      });
      setNewSectionTitle("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteSection(sectionId) {
    if (!confirm("Delete this section and all its lessons?")) return;
    try {
      await adminApi.deleteSection(token, sectionId);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRenameSection(sectionId, title) {
    try {
      await adminApi.updateSection(token, sectionId, { title });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="opacity-60">Loading...</p>;
  if (!course) return <p className="text-red-600">{error || "Course not found"}</p>;

  const subcategoryOptions = categories[courseForm.category] || [];

  return (
    <div className="max-w-3xl">
      <a href="/admin/courses" className="text-sm opacity-60 hover:opacity-100">
        ← All courses
      </a>
      <h1 className="font-display text-3xl mt-1 mb-6">{course.title}</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* Course details */}
      <section className="border border-gold/20 rounded-xl p-5 mb-8">
        <h2 className="font-display text-xl mb-4">Course Details</h2>
        <form onSubmit={handleSaveCourse} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2"
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2"
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Thumbnail URL</label>
            <input
              className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2"
              value={courseForm.thumbnailUrl}
              onChange={(e) => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2"
                value={courseForm.price}
                onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Currency</label>
              <select
                className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2"
                value={courseForm.currency}
                onChange={(e) => setCourseForm({ ...courseForm, currency: e.target.value })}
              >
                <option value="GHS">GHS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Category</label>
              <select
                className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2"
                value={courseForm.category}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, category: e.target.value, subcategory: "" })
                }
              >
                {Object.keys(categories).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Subcategory</label>
              <select
                className="mt-1 w-full rounded-lg border border-gold/30 bg-transparent px-3 py-2"
                value={courseForm.subcategory}
                onChange={(e) => setCourseForm({ ...courseForm, subcategory: e.target.value })}
              >
                {subcategoryOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={courseForm.published}
              onChange={(e) => setCourseForm({ ...courseForm, published: e.target.checked })}
            />
            Published
          </label>
          <button
            disabled={savingCourse}
            className="px-5 py-2 rounded-lg bg-gold text-ink font-semibold disabled:opacity-50"
          >
            {savingCourse ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>

      {/* Curriculum */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-xl">Curriculum</h2>
          <a
            href={`/admin/courses/${id}/enrollments`}
            className="text-sm text-gold underline"
          >
            View enrollments →
          </a>
        </div>

        <div className="space-y-4 mb-6">
          {course.sections.map((section) => (
            <SectionEditor
              key={section.id}
              section={section}
              token={token}
              onRename={handleRenameSection}
              onDelete={handleDeleteSection}
              onChange={load}
              setError={setError}
            />
          ))}
        </div>

        <form onSubmit={handleAddSection} className="flex gap-2">
          <input
            placeholder="New section title..."
            className="flex-1 rounded-lg border border-gold/30 bg-transparent px-3 py-2 text-sm"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
          />
          <button className="px-4 py-2 rounded-lg border border-gold/40 text-sm">
            + Add Section
          </button>
        </form>
      </section>
    </div>
  );
}

function SectionEditor({ section, token, onRename, onDelete, onChange, setError }) {
  const [title, setTitle] = useState(section.title);
  const [showNewLesson, setShowNewLesson] = useState(false);

  return (
    <div className="border border-gold/20 rounded-xl overflow-hidden">
      <div className="bg-gold/10 px-4 py-3 flex items-center gap-2">
        <input
          className="flex-1 bg-transparent font-medium text-sm focus:outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title !== section.title && onRename(section.id, title)}
        />
        <button
          onClick={() => setShowNewLesson((v) => !v)}
          className="text-xs text-gold underline"
        >
          + Lesson
        </button>
        <button onClick={() => onDelete(section.id)} className="text-xs text-red-600 underline">
          Delete
        </button>
      </div>

      <ul className="divide-y divide-gold/10">
        {section.lessons.map((lesson) => (
          <LessonEditor
            key={lesson.id}
            lesson={lesson}
            token={token}
            onChange={onChange}
            setError={setError}
          />
        ))}
      </ul>

      {showNewLesson && (
        <NewLessonForm
          sectionId={section.id}
          order={section.lessons.length}
          token={token}
          onDone={() => {
            setShowNewLesson(false);
            onChange();
          }}
          setError={setError}
        />
      )}
    </div>
  );
}

function LessonEditor({ lesson, token, onChange, setError }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: lesson.title,
    videoUrl: lesson.videoUrl,
    pdfUrl: lesson.pdfUrl || "",
    isPreview: lesson.isPreview,
    durationSec: lesson.durationSec || "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await adminApi.updateLesson(token, lesson.id, {
        ...form,
        durationSec: form.durationSec ? Number(form.durationSec) : null,
      });
      setEditing(false);
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    try {
      await adminApi.deleteLesson(token, lesson.id);
      onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!editing) {
    return (
      <li className="flex items-center justify-between px-4 py-2.5 text-sm">
        <span className="flex items-center gap-2">
          {lesson.title}
          {lesson.isPreview && (
            <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">Preview</span>
          )}
        </span>
        <span className="space-x-3">
          <button onClick={() => setEditing(true)} className="text-gold underline">
            Edit
          </button>
          <button onClick={handleDelete} className="text-red-600 underline">
            Delete
          </button>
        </span>
      </li>
    );
  }

  return (
    <li className="px-4 py-3 text-sm space-y-2 bg-gold/5">
      <input
        className="w-full rounded border border-gold/30 bg-transparent px-2 py-1"
        placeholder="Lesson title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <input
        className="w-full rounded border border-gold/30 bg-transparent px-2 py-1"
        placeholder="Video URL (Vimeo, YouTube, or S3)"
        value={form.videoUrl}
        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
      />
      <input
        className="w-full rounded border border-gold/30 bg-transparent px-2 py-1"
        placeholder="PDF URL (optional)"
        value={form.pdfUrl}
        onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
      />
      <input
        type="number"
        className="w-full rounded border border-gold/30 bg-transparent px-2 py-1"
        placeholder="Duration (seconds)"
        value={form.durationSec}
        onChange={(e) => setForm({ ...form, durationSec: e.target.value })}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isPreview}
          onChange={(e) => setForm({ ...form, isPreview: e.target.checked })}
        />
        Free preview lesson
      </label>
      <div className="space-x-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 rounded bg-gold text-ink font-semibold text-xs disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={() => setEditing(false)} className="text-xs opacity-60">
          Cancel
        </button>
      </div>
    </li>
  );
}

function NewLessonForm({ sectionId, order, token, onDone, setError }) {
  const [form, setForm] = useState({
    title: "",
    videoUrl: "",
    pdfUrl: "",
    isPreview: false,
    durationSec: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createLesson(token, sectionId, {
        ...form,
        order,
        durationSec: form.durationSec ? Number(form.durationSec) : null,
      });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleAdd} className="px-4 py-3 text-sm space-y-2 bg-gold/5 border-t border-gold/10">
      <input
        required
        className="w-full rounded border border-gold/30 bg-transparent px-2 py-1"
        placeholder="Lesson title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <input
        required
        className="w-full rounded border border-gold/30 bg-transparent px-2 py-1"
        placeholder="Video URL (Vimeo, YouTube, or S3)"
        value={form.videoUrl}
        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
      />
      <input
        className="w-full rounded border border-gold/30 bg-transparent px-2 py-1"
        placeholder="PDF URL (optional)"
        value={form.pdfUrl}
        onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
      />
      <input
        type="number"
        className="w-full rounded border border-gold/30 bg-transparent px-2 py-1"
        placeholder="Duration (seconds)"
        value={form.durationSec}
        onChange={(e) => setForm({ ...form, durationSec: e.target.value })}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isPreview}
          onChange={(e) => setForm({ ...form, isPreview: e.target.checked })}
        />
        Free preview lesson
      </label>
      <button
        disabled={saving}
        className="px-3 py-1.5 rounded bg-gold text-ink font-semibold text-xs disabled:opacity-50"
      >
        {saving ? "Adding..." : "Add lesson"}
      </button>
    </form>
  );
}
