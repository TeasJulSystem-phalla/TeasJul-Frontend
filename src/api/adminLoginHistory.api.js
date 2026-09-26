import api from "./axios";

// SUPER_ADMIN access to any account's sign-in history.
// Backend: AdminLoginHistoryController → GET /api/admin/users/{id}/login-history
export const adminLoginHistoryApi = {
  /**
   * Paginated login history for a specific user.
   * @param {number} userId - target user's ID
   * @param {object} params - { page, size }
   */
  getUserLoginHistory: (userId, { page = 0, size = 10 } = {}) =>
    api
      .get(`/admin/users/${userId}/login-history`, {
        params: { page, size, sort: "occurredAt,desc" },
      })
      .then((res) => res.data),
};
