<template>
<aside
  :class="[
    'w-64 h-screen bg-gradient-to-l from-gray-900 to-gray-950 text-white fixed z-30 transform transition-transform duration-300',
    menuVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
  ]"
>
    <!-- Contenedor vertical -->
    <div class="flex flex-col h-full">
      <div class="flex-1 overflow-y-auto">
        <div class="p-4 text-xl font-bold border-b border-gray-700 flex items-center justify-center space-x-3">
          <img src="/LOGO-SPAM-MUSIC.svg" alt="Logo" class="w-8 h-8" />
          <span>Spam Music</span>
        </div>

        <nav class="p-4 space-y-2">
          <router-link
            v-for="route in filteredDiscAppRoutes"
            :key="route.to"
            :to="route.to"
            class="text-left pl-6 block px-4 py-2 rounded transition-opacity duration-300 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-[#211d1d]"
            :active-class="'bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-[#211d1d]'"
            @click="closeMenu"
          >
            <i v-if="route.to === '/'" class="fa-solid fa-house text-md mr-1"></i>
            <i v-if="route.to === '/disc-list'" class="fa-solid fa-compact-disc text-md mr-1"></i>
            <i v-if="['/calendar', '/calendar-baby'].includes(route.to)" class="fa-solid fa-calendar-days text-md mr-1"></i>
            <i v-if="route.to === '/import'" class="fa-solid fa-arrow-up-from-bracket text-md mr-1"></i>
            <i v-if="route.to === '/suggest'" class="fa-solid fa-lightbulb text-md mr-1"></i>
            <i v-if="route.to === '/petitions'" class="fa-solid fa-inbox text-md mr-1"></i>
            {{ route.label }}
          </router-link>
        </nav>

        <nav class="p-4 space-y-2 border-t border-gray-700">
          <div class="font-semibold text-gray-400 uppercase text-sm mb-2">Riff Valley</div>
          <router-link
            v-for="route in filteredRiffValleyRoutes"
            :key="route.to"
            :to="route.to"
            class="text-left pl-6 block px-4 py-2 rounded transition-all duration-300 hover:bg-gradient-to-r hover:from-[#ee6f86]/60 hover:to-[#2759c1]/60 hover:text-white"
            :active-class="'bg-gradient-to-r from-[#ee6f86] to-[#2759c1] text-white'"
            @click="closeMenu"
          >
            <i v-if="route.to === '/list/lists'" class="fa-solid fa-list-check text-md mr-1"></i>
            <i v-if="route.to === '/reunions/list'" class="fa-solid fa-comments text-md mr-1"></i>
            <i v-if="route.to === '/recap'" class="fa-solid fa-calendar-week text-md mr-1"></i>
            {{ route.label }}
          </router-link>
        </nav>

        <nav class="p-4 space-y-2 border-t border-gray-700">
          <router-link
            v-for="route in filteredBottomRoutes"
            :key="route.to"
            :to="route.to"
            class="text-left pl-6 block w-full px-4 py-2 rounded transition-opacity duration-300 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-[#211d1d]"
            :active-class="'bg-gray-600 text-white'"
            @click="closeMenu"
          >
            <i v-if="route.to === '/password'" class="fa-solid fa-user text-sm mr-1"></i>
            <i v-if="route.to === '/users'" class="fa-solid fa-users text-sm mr-1"></i>
            <i v-if="route.to === '/how-to-use'" class="fa-solid fa-circle-question text-md mr-1"></i>
            {{ route.label }}
          </router-link>
        </nav>
      </div>

      <!-- Pie con botón fijo -->
      <nav class="p-4 space-y-2 border-t border-gray-700">
        <button
          @click="handleLogout"
          class="pl-6 font-semibold block w-full text-center px-4 py-2 rounded hover:bg-red-600 flex items-center text-left gap-2"
        >
          <i class="fa-solid fa-right-from-bracket"></i>
          {{ logoutLabel }}
        </button>
      </nav>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from "vue";
import { useAuthStore } from "@stores/auth/auth.ts";
import routes from "./routes.json"; // Archivo JSON con las rutas

export default defineComponent({
  name: "SidebarMenu",
  props: {
    menuVisible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["close-menu"],
  setup(props, { emit }) {
    const authStore = useAuthStore();

    const handleLogout = () => {
      authStore.logout();
      window.location.href = "/"; // Redirige al usuario al inicio tras el logout
    };

    const closeMenu = () => {
      console.log("📌 Emitiendo `close-menu` desde SidebarMenu.vue");
      emit("close-menu");
    };

    watch(
      () => props.menuVisible,
      (newValue) => {
        console.log("🔄 `menuVisible` cambiado en SidebarMenu.vue:", newValue);

        if (newValue) {
          document.body.style.overflow = "hidden"; // 🚫 Bloquea scroll
        } else {
          document.body.style.overflow = ""; // ✅ Restaura scroll
        }
      }
    );

    const filterRoutesByRole = (routesList, requiredRole = null) => {
      return routesList.filter((route) => {
        if (route.requiredRole) {
          return authStore.hasRole(route.requiredRole);
        }
        if (requiredRole) {
          return authStore.hasRole(requiredRole);
        }
        return true;
      });
    };

    const filteredDiscAppRoutes = computed(() =>
      filterRoutesByRole(routes.filter((route) => route.type === "disc-app"))
    );
    const filteredRiffValleyRoutes = computed(() =>
      filterRoutesByRole(
        routes.filter((route) => route.type === "riff-valley"),
        "riffValley"
      )
    );

    const filteredBottomRoutes = computed(() =>
      filterRoutesByRole(routes.filter((route) => route.type === "bottom"))
    );

    return {
      handleLogout,
      closeMenu,
      logoutLabel: "Cerrar sesión",
      filteredDiscAppRoutes,
      filteredRiffValleyRoutes,
      filteredBottomRoutes,
    };
  },
});
</script>
