import { request } from "./client";

export const lessonApi = {
  get: (lessonId) => request(`/lessons/${lessonId}`),
  complete: (lessonId) => request(`/lessons/${lessonId}/complete`, { method: "POST" }),
};

export const paymentApi = {
  initialize: (courseId) =>
    request("/payments/initialize", { method: "POST", body: JSON.stringify({ courseId }) }),
  verify: (reference) => request(`/payments/verify/${reference}`),
};
