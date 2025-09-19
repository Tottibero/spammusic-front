import axios from "axios";
import router from "/src/router"; // Asegúrate de ajustar la ruta según tu estructura
import { useAuthStore } from "/src/stores/auth/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Cambia esto por tu URL base
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token en cada solicitud
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  const token = authStore.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada o no autorizada, redirigiendo al login...");
      const authStore = useAuthStore();
      authStore.logout(); // Limpia el estado de autenticación
      router.push({ name: "Login" }); // Redirige al login
    }
    return Promise.reject(error);
  }
);

export default api;
