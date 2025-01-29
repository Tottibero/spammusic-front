import { defineStore } from 'pinia';
import { login, type LoginPayload } from '../../services/auth/auth'; 
import api from '../../services/api/api'; 

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') as string | null,
    username: localStorage.getItem('username') as string | null,
    userId: localStorage.getItem('userId') as string | null, // Almacenar el ID del usuario
  }),
  actions: {
    async login(payload: LoginPayload) {
      try {
        const response = await login(payload);
        this.token = response.token;
        this.username = response.username;
        this.userId = response.id; // Guardar el ID del usuario en el estado
        console.log("store userId: " + this.userId);
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('userId', response.id); // Guardar el ID en localStorage

        // Configura el token en Axios para futuras solicitudes
        api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      } catch (error) {
        console.error('Login failed:', error);
        throw new Error('Invalid credentials');
      }
    },
    logout() {
      this.token = null;
      this.username = null;
      this.userId = null; // Limpiar el ID del estado
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('userId'); // Remover el ID de localStorage

      // Elimina el token de las cabeceras globales
      delete api.defaults.headers.common['Authorization'];
    },
    initializeAuth() {
      if (this.token) {
        // Configura el token en Axios si existe
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    },
  },
  getters: {
    isAuthenticated: (state): boolean => !!state.token,
    loggedUser: (state) => ({ // Nuevo getter para obtener el usuario logueado
      id: state.userId,
      username: state.username,
    }),
  },
});
