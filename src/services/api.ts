import axios, { AxiosInstance } from "axios";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const api: AxiosInstance = axios.create({
  baseURL: "https://your-api-url.com", // Cambia esto por tu URL base
  headers: {
    "Content-Type": "application/json",
  },
});

const router = useRouter();

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
      router.push({ name: "Login" }); // Cambia "Login" por el nombre de tu ruta de login
    }
    return Promise.reject(error);
  }
);



export default api;
