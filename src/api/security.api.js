import api from "./axios";

export const securityApi = {
  getMySecurity: () => api.get("/v1/security").then((res) => res.data),

  addRecoveryEmail: (recoveryEmail) =>
    api.post("/v1/security/recovery-email", { recoveryEmail }).then((res) => res.data),

  verifyRecoveryEmail: (recoveryEmail, otp) =>
    api.post("/v1/security/recovery-email/verify", { recoveryEmail, otp }).then((res) => res.data),

  enableTwoFactor: () =>
    api.post("/v1/security/2fa/enable").then((res) => res.data),

  disableTwoFactor: () =>
    api.post("/v1/security/2fa/disable").then((res) => res.data),

  forgotPassword: (email) =>
    api.post("/v1/auth/forgot-password", { email }).then((res) => res.data),

  verifyPasswordResetOtp: (email, otp) =>
    api.post("/v1/auth/forgot-password/verify-otp", { email, otp }).then((res) => res.data),

  resetPassword: (resetToken, newPassword, confirmPassword) =>
    api.post("/v1/auth/reset-password", { resetToken, newPassword, confirmPassword }).then((res) => res.data),

  verifyTwoFactor: (challengeToken, otp) =>
    api.post("/v1/auth/2fa/verify", { challengeToken, otp }).then((res) => res.data),
};
