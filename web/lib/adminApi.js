const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function request(path, token, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export const adminApi = {
  categories: (token) => request("/admin/categories", token),

  // Courses
  listCourses: (token) => request("/admin/courses", token),
  getCourse: (token, id) => request(`/admin/courses/${id}`, token),
  createCourse: (token, payload) =>
    request("/admin/courses", token, { method: "POST", body: JSON.stringify(payload) }),
  updateCourse: (token, id, payload) =>
    request(`/admin/courses/${id}`, token, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCourse: (token, id) => request(`/admin/courses/${id}`, token, { method: "DELETE" }),

  // Sections
  createSection: (token, courseId, payload) =>
    request(`/admin/courses/${courseId}/sections`, token, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateSection: (token, sectionId, payload) =>
    request(`/admin/sections/${sectionId}`, token, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteSection: (token, sectionId) =>
    request(`/admin/sections/${sectionId}`, token, { method: "DELETE" }),

  // Lessons
  createLesson: (token, sectionId, payload) =>
    request(`/admin/sections/${sectionId}/lessons`, token, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateLesson: (token, lessonId, payload) =>
    request(`/admin/lessons/${lessonId}`, token, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteLesson: (token, lessonId) =>
    request(`/admin/lessons/${lessonId}`, token, { method: "DELETE" }),

  // Enrollments
  getEnrollments: (token, courseId) => request(`/admin/courses/${courseId}/enrollments`, token),
};

// Decodes a JWT payload WITHOUT verifying the signature — fine for
// client-side UI branching (e.g. "show the admin nav link"), since the
// backend independently re-checks the role on every protected request.
export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}
