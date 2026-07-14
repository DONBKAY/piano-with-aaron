const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function request(path, token, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export const adminApi = {
  categories: (token) => request("/admin/categories", token),
  dashboard: (token) => request("/admin/dashboard", token),

  listCourses: (token) => request("/admin/courses", token),
  getCourse: (token, id) => request(`/admin/courses/${id}`, token),
  createCourse: (token, payload) =>
    request("/admin/courses", token, { method: "POST", body: JSON.stringify(payload) }),
  updateCourse: (token, id, payload) =>
    request(`/admin/courses/${id}`, token, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCourse: (token, id) => request(`/admin/courses/${id}`, token, { method: "DELETE" }),

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
