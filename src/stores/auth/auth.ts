import { defineStore } from "pinia";
import { login, type LoginPayload } from "../../services/auth/auth";
import api from "../../services/api/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") as string | null,
    username: localStorage.getItem("username") as string | null,
    userId: localStorage.getItem("userId") as string | null,
    roles: localStorage.getItem("roles") as string[], // Roles almacenados solo en la store, no en localStorage
  }),
  actions: {
    async login(payload: LoginPayload) {
      try {
        const response = await login(payload);
        this.token = response.token;
        this.username = response.username;
        this.userId = response.id;
        this.roles = response.roles || []; // Asignar los roles obtenidos del backend

        console.log("store userId: " + this.userId);
        console.log("store roles: ", this.roles);

        localStorage.setItem("token", response.token);
        localStorage.setItem("username", response.username);
        localStorage.setItem("userId", response.id);
        localStorage.setItem("roles", JSON.stringify(response.roles));

        // Configura el token en Axios para futuras solicitudes
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.token}`;
      } catch (error) {
        console.error("Login failed:", error);
        throw new Error("Invalid credentials");
      }
    },
    logout() {
      this.token = null;
      this.username = null;
      this.userId = null;
      this.roles = []; // Limpiar los roles al cerrar sesión

      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");

      // Elimina el token de las cabeceras globales
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
    loggedUser: (state) => ({
      id: state.userId,
      username: state.username,
    }),
    userRoles: (state) => state.roles, // Getter para obtener los roles del usuario
    hasRole:
      (state) =>
      (role: string): boolean =>
        state.roles.includes(role), // Verifica si tiene un rol específico
  },
});
