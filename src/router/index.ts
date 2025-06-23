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
    meta: { requiresAuth: true },
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
    meta: { requiresAuth: true, requiresRole: "user" }, // o sin "requiredRole" si quieres que otros lo vean también
  },
  {
    path: "/calendar-baby",
    name: "CalendarBaby",
    component: () =>
      import("/src/views/discsCalendarBaby/DiscCalendarBaby.vue"),
    meta: { requiresAuth: true, requiresRole: "babyUser" },
  },
  {
    path: "/import",
    name: "Import",
    component: () => import("/src/views/importPage/ImportPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/suggest",
    name: "Suggest",
    component: () => import("/src/views/importPage/SuggestPage.vue"),
    meta: { requiresAuth: true, requiresRole: "babyUser" },
  },
  {
    path: "/petitions",
    name: "Petitions",
    component: () => import("@/views/petitions/PetitionsPage.vue"),
    meta: { requiresAuth: true, requiresRole: "user" },
  },
  {
    path: "/recap",
    name: "Recap",
    component: () => import("/src/views/weekRecap/WeekRecap.vue"),
    meta: { requiresAuth: true, requiresRole: "riffValley" },
  },
  {
    path: "/articles",
    name: "Articles",
    component: () => import("/src/views/articles/ArticlesList.vue"),
    meta: { requiresAuth: true, requiresRole: "riffValley" },
  },
  {
    path: "/password",
    name: "Password",
    component: () => import("/src/views/password/PasswordChange.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/users",
    name: "Users",
    component: () => import("/src/views/users/ManageUsers.vue"),
    meta: { requiresAuth: true, requiresRole: "superUser" },
  },
  {
    path: "/list",
    name: "List",
    component: () => import("/src/layouts/list/ListLayout.vue"),
    meta: { requiresAuth: true, requiresRole: "riffValley" },
    children: [
      {
        path: "",
        name: "ListDefault",
        redirect: "/list/lists",
      },
      {
        path: "lists",
        name: "ListsList",
        component: () => import("/src/views/list/ListsList.vue"),
        meta: { requiresAuth: true, requiresRole: "riffValley" },
        props: true,
      },
      {
        path: "edit/:id",
        name: "EditList",
        component: () => import("/src/views/list/EditList.vue"),
        meta: { requiresAuth: true, requiresRole: "riffValley" },
        props: true,
      },
      {
        path: "create",
        name: "CreateList",
        component: () => import("/src/views/list/CreateList.vue"),
        meta: { requiresAuth: true, requiresRole: "riffValley" },
      },
    ],
  },
  {
    path: "/reunions",
    name: "Reunions",
    component: () => import("/src/layouts/reunions/ReunionLayout.vue"),
    meta: { requiresAuth: true, requiresRole: "riffValley" },
    children: [
      {
        path: "",
        name: "ReunionsDefault",
        redirect: "/reunions/list",
      },
      {
        path: "list",
        name: "ReunionsList",
        component: () => import("/src/views/reunions/ListReunion.vue"),
        meta: { requiresAuth: true, requiresRole: "riffValley" },
        props: true,
      },
      {
        path: ":id",
        name: "EditReunion",
        component: () => import("/src/views/reunions/EditReunion.vue"),
        meta: { requiresAuth: true, requiresRole: "riffValley" },
        props: true,
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
  path: "/how-to-use",
  name: "HowToUse",
  component: () => import("/src/views/help/HowToUse.vue"),
  meta: { requiresAuth: true }
}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "Login" };
  }

  if (to.meta.requiresRole && !authStore.hasRole(to.meta.requiresRole)) {
    return { name: "Home" };
  }

  const restrictedForBabyUser = ["/import"];
  if (
    authStore.hasRole("babyUser") &&
    restrictedForBabyUser.includes(to.path)
  ) {
    return { name: "Home" };
  }

  return true;
});

export default router;
