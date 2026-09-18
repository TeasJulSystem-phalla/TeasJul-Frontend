// src/api/feedback.api.js
import api from "./axios";

/**
 * Public read-only feedback: only PUBLISHED testimonials are returned.
 */
export const publicFeedbackApi = {
  listTestimonials: () => api.get("/public/feedback").then((res) => res.data),
};

/**
 * Owner feedback about the TeasJul system (current authenticated owner only).
 */
export const ownerFeedbackApi = {
  listMyFeedback: (params = {}) =>
    api.get("/owner/feedback", { params }).then((res) => res.data),
  submitFeedback: (data) =>
    api.post("/owner/feedback", data).then((res) => res.data),
};

/**
 * SUPER_ADMIN feedback review (publish / unpublish).
 */
export const feedbackAdminApi = {
  listFeedback: ({ status, page = 0, size = 10 } = {}) =>
    api
      .get("/admin/feedback", {
        params: { ...(status ? { status } : {}), page, size },
      })
      .then((res) => res.data),
  publishFeedback: (id) =>
    api.post(`/admin/feedback/${id}/publish`).then((res) => res.data),
  unpublishFeedback: (id) =>
    api.post(`/admin/feedback/${id}/unpublish`).then((res) => res.data),
};