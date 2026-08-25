import { create } from "zustand";

const STORAGE_KEY = "teasjul_auth";

function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { accessToken: parsed.accessToken, user: parsed.user };
    }
  } catch {
    // corrupted storage, ignore
  }
  return { accessToken: null, user: null };
}

const initial = loadAuth();

export const useAuthStore = create((set) => ({
  accessToken: initial.accessToken,
  user: initial.user,
  initialized: true,

  setAccessToken: (accessToken) => {
    set({ accessToken });
    const { user } = useAuthStore.getState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, user }));
  },
 
  setUser: (user) => { 
    set({ user });
    const { accessToken } = useAuthStore.getState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, user }));
  },

  setAuth: (accessToken, user) => {
    set({ accessToken, user, initialized: true });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, user }));
  },

  setInitialized: (initialized) => {
    set({ initialized });
  },

  logout: () => {
    set({ accessToken: null, user: null, initialized: true });
    localStorage.removeItem(STORAGE_KEY);
  },
}));
