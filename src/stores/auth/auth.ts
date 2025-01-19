import { defineStore } from 'pinia';
import { login, type LoginPayload } from '../../services/auth/auth'; 
import api from '../../services/api/api'; 

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') as string | null,
    username: localStorage.getItem('username') as string | null,
  }),
  actions: {
    async login(payload: LoginPayload) {
      try {
        const response = await login(payload);
        this.token = response.token;
        this.username = response.username;
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);

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
      localStorage.removeItem('token');
      localStorage.removeItem('username');

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
  },
});
