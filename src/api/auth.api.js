import api from "./axios";

export const authApi = {
  login: (usernameOrEmail, password) =>
    api.post("/v1/auth/login", { usernameOrEmail, password }).then((res) => res.data),

  register: (data) =>
    api.post("/v1/auth/register", data).then((res) => res.data),

  refresh: () =>
    api.post("/v1/auth/refresh", {}).then((res) => res.data),
};
