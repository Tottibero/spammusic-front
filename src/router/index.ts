import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores/auth/auth";

import Login from "@views/loginPage/LoginPage.vue";
import HomePage from "@views/homePage/HomePage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
    meta: { requiresAuth: true }, // Indica que esta ruta requiere autenticación
  },
  {
    path: "/list",
    name: "List",
    component: () => import("/src/views/discsList/DiscList.vue"),
    meta: { requiresAuth: true }, // Indica que esta ruta requiere autenticación
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: () => import("/src/views/discsCalendar/DiscCalendar.vue"),
    meta: { requiresAuth: true }, // Indica que esta ruta requiere autenticación
  },
  {
    path: "/import",
    name: "Import",
    component: () => import("/src/views/importPage/ImportPage.vue"),
    meta: { requiresAuth: true }, // Indica que esta ruta requiere autenticación
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global before guard
router.beforeEach((to) => {
  const authStore = useAuthStore();

  // Verifica si la ruta requiere autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "Login" }; // Redirige al login si no está autenticado
  }

  // Permite el acceso
  return true;
});

export default router;
