const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

export const courseApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/courses${qs ? `?${qs}` : ""}`);
  },
  categories: () => request("/courses/categories"),
  getBySlug: (slug, token) =>
    request(`/courses/${slug}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  getForLearning: (slug, token) =>
    request(`/courses/${slug}/learn`, { headers: { Authorization: `Bearer ${token}` } }),
  myEnrolled: (token) =>
    request("/courses/me/enrolled", { headers: { Authorization: `Bearer ${token}` } }),
};

export const lessonApi = {
  get: (lessonId, token) =>
    request(`/lessons/${lessonId}`, { headers: { Authorization: `Bearer ${token}` } }),
  complete: (lessonId, token) =>
    request(`/lessons/${lessonId}/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export const authApi = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  forgotPassword: (email) =>
    request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token, newPassword) =>
    request("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) }),
  me: (token) => request("/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
};

export const paymentApi = {
  initialize: (courseId, token) =>
    request("/payments/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ courseId }),
    }),
  verify: (reference, token) =>
    request(`/payments/verify/${reference}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export function saveToken(token) {
  localStorage.setItem("pwa_token", token);
}
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pwa_token");
}
export function clearToken() {
  localStorage.removeItem("pwa_token");
}
