import api from "./axios";

export const authApi = {
  login: (usernameOrEmail, password) =>
    api.post("/auth/login", { usernameOrEmail, password }).then((res) => res.data),

  register: (data) =>
    api.post("/auth/register", data).then((res) => res.data),

  refresh: () =>
    api.post("/auth/refresh", {}).then((res) => res.data),
};
