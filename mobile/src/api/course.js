import { request } from "./client";

export const courseApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/courses${qs ? `?${qs}` : ""}`);
  },
  categories: () => request("/courses/categories"),
  getBySlug: (slug) => request(`/courses/${slug}`),
  getForLearning: (slug) => request(`/courses/${slug}/learn`),
  myEnrolled: () => request("/courses/me/enrolled"),
};
