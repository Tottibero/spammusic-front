import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores/auth";

import Login from "../views/Login.vue";
import Home from "../views/HomePage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
    meta: { requiresAuth: true }, // Indica que esta ruta requiere autenticación
  },
  {
    path: "/",
    name: "Votes",
    component: () => import("../views/VotesPage.vue"),
    meta: { requiresAuth: true }, // Indica que esta ruta requiere autenticación
  },
  {
    path: "/page1",
    name: "Page1",
    component: () => import("../views/Page1.vue"),
    meta: { requiresAuth: true }, // Indica que esta ruta requiere autenticación
  },
  {
    path: "/page2",
    name: "Page2",
    component: () => import("../views/Page2.vue"),
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
