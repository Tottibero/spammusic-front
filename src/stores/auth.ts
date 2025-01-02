import { defineStore } from 'pinia';
import { login, type LoginPayload } from '../services/auth'; // Nota el uso de `type` para LoginPayload

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') as string | null,
    username: null as string | null,
  }),
  actions: {
    async login(payload: LoginPayload) {
      try {
        const response = await login(payload);
        this.token = response.token;
        this.username = response.username;
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
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
    },
  },
  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },
});
