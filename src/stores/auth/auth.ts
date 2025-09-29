// @stores/auth/auth.ts
import { defineStore } from "pinia";
import { login, type LoginPayload } from "../../services/auth/auth";
import api from "../../services/api/api";

function loadRoles(): string[] {
  const raw = localStorage.getItem("roles");
  if (!raw) return [];
  try {
    // Caso correcto: guardado como JSON
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Fallback por si quedó un string antiguo tipo "user,admin"
    if (raw.includes("[") || raw.includes("{")) return [];
    return raw.split(",").map(r => r.trim()).filter(Boolean);
  }
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") as string | null,
    username: localStorage.getItem("username") as string | null,
    userId: localStorage.getItem("userId") as string | null,
    image: localStorage.getItem("image") as string | null,
    roles: loadRoles(), // 👈 ahora siempre es string[]
  }),
  actions: {
    async login(payload: LoginPayload) {
      try {
        const response = await login(payload);

        this.token = response.token;
        this.username = response.username;
        this.userId = response.id;
        this.image = response.image || null;
        this.roles = response.roles || []; // array desde backend

        localStorage.setItem("token", response.token);
        localStorage.setItem("username", response.username);
        localStorage.setItem("userId", response.id);
        localStorage.setItem("image", this.image || "");
        localStorage.setItem("roles", JSON.stringify(this.roles)); // ✅ serializado

        api.defaults.headers.common["Authorization"] = `Bearer ${response.token}`;
      } catch (error) {
        console.error("Login failed:", error);
        throw new Error("Invalid credentials");
      }
    },

    setImage(newImage: string) {
      this.image = newImage || null;
      localStorage.setItem("image", this.image || "");
    },

    logout() {
      this.token = null;
      this.username = null;
      this.userId = null;
      this.image = null;
      this.roles = [];

      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("image");
      localStorage.removeItem("roles");

      delete api.defaults.headers.common["Authorization"];
    },

    initializeAuth() {
      if (this.token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
      }
    },
  },
  getters: {
    isAuthenticated: (state): boolean => !!state.token,
    loggedUser: (state) => ({ id: state.userId, username: state.username }),
    userRoles: (state) => state.roles,
    hasRole: (state) => (role: string): boolean =>
      Array.isArray(state.roles) && state.roles.includes(role),
    avatarUrl: (state) => state.image,
  },
});
