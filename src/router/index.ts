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
    path: "/disc-list",
    name: "DiscList",
    component: () => import("/src/views/discsList/DiscList.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: () => import("/src/views/discsCalendar/DiscCalendar.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/import",
    name: "Import",
    component: () => import("/src/views/importPage/ImportPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/recap",
    name: "Recap",
    component: () => import("/src/views/weekRecap/WeekRecap.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/articles",
    name: "Articles",
    component: () => import("/src/views/articles/ArticlesList.vue"),
  },  
  {
    path: "/list",
    name: "List",
    component: () => import("/src/layouts/list/ListLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "", // Ruta por defecto
        name: "ListDefault", // Añadir nombre a la ruta por defecto
        redirect: "/list/lists", // Redirige explícitamente
      },
      {
        path: "lists",
        name: "ListsList",
        component: () => import("/src/views/list/ListsList.vue"),
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "edit/:id",
        name: "EditList",
        component: () => import("/src/views/list/EditList.vue"),
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "create",
        name: "CreateList",
        component: () => import("/src/views/list/CreateList.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/reunions",
    name: "Reunions",
    component: () => import("/src/layouts/reunions/ReunionLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "", // Ruta por defecto
        name: "ReunionsDefault", // Añadir nombre a la ruta por defecto
        redirect: "/reunions/list", // Redirige explícitamente
      },
      {
        path: "list",
        name: "ReunionsList",
        component: () => import("/src/views/reunions/ListReunion.vue"),
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: ":id",
        name: "EditReunion",
        component: () => import("/src/views/reunions/EditReunion.vue"),
        meta: { requiresAuth: true },
        props: true,
      },
    ],
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
