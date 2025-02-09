<template>
  <aside
    :class="[
      'w-64 bg-gradient-to-l from-[#0f0f0f] to-[#211d1d] text-white flex flex-col justify-between fixed h-screen transform transition-transform duration-300 z-10',
      menuVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    ]"
  >
    <!-- Disc-App -->
    <div>
      <div
        class="p-4 text-xl font-bold border-b border-gray-700 flex items-center justify-center space-x-3"
      >
        <img src="/LOGO-SPAM-MUSIC.svg" alt="Logo" class="w-8 h-8" />
        <span>Spam Music</span>
      </div>
      <nav class="p-4 space-y-2">
        <div class="font-semibold text-gray-400 uppercase text-sm mb-2">
          Disc App
        </div>
        <router-link
          v-for="route in filteredDiscAppRoutes"
          :key="route.to"
          :to="route.to"
          class="block px-4 py-2 rounded transition-all duration-300 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-[#211d1d]"
          :active-class="'bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-[#211d1d]'"
        >
          {{ route.label }}
        </router-link>
      </nav>
    </div>

    <!-- Riff-Valley -->
    <div>
      <nav class="p-4 space-y-2 border-t border-gray-700">
        <div class="font-semibold text-gray-400 uppercase text-sm mb-2">
          Riff Valley
        </div>
        <router-link
          v-for="route in filteredRiffValleyRoutes"
          :key="route.to"
          :to="route.to"
          class="block px-4 py-2 rounded transition-all duration-300 hover:bg-gradient-to-r hover:from-[#ee6f86]/50 hover:to-[#2759c1]/50 hover:text-white"
          :active-class="'bg-gradient-to-r from-[#ee6f86] to-[#2759c1] text-[#FFFFFF]'"
        >
          {{ route.label }}
        </router-link>
      </nav>
    </div>

    <!-- Bottom -->
    <nav class="p-4 space-y-2 border-t border-gray-700">
      <router-link
        v-for="route in filteredBottomRoutes"
        :key="route.to"
        :to="route.to"
        class="block px-4 py-2 rounded transition-all duration-300 hover:bg-red-600"
        :active-class="'bg-red-600 text-white'"
      >
        {{ route.label }}
      </router-link>
    </nav>

    <nav class="p-4 space-y-2 border-t border-gray-700">
      <button
        @click="handleLogout"
        class="block w-full text-left px-4 py-2 rounded hover:bg-red-600"
      >
        {{ logoutLabel }}
      </button>
    </nav>
  </aside>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
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
  setup() {
    const authStore = useAuthStore();

    const handleLogout = () => {
      authStore.logout();
      window.location.href = "/"; // Redirige al usuario al inicio tras el logout
    };

    // Función para filtrar rutas según roles
    const filterRoutesByRole = (routesList) => {
      return routesList.filter((route) => {
        if (route.requiredRole) {
          return authStore.hasRole(route.requiredRole);
        }
        return true;
      });
    };

    // Filtrar rutas según tipo y permisos
    const filteredDiscAppRoutes = computed(() =>
      filterRoutesByRole(routes.filter((route) => route.type === "disc-app"))
    );
    const filteredRiffValleyRoutes = computed(() =>
      filterRoutesByRole(routes.filter((route) => route.type === "riff-valley"))
    );
    const filteredBottomRoutes = computed(() =>
      filterRoutesByRole(routes.filter((route) => route.type === "bottom"))
    );

    return {
      handleLogout,
      logoutLabel: "Cerrar sesión",
      filteredDiscAppRoutes,
      filteredRiffValleyRoutes,
      filteredBottomRoutes,
    };
  },
});
</script>

<style scoped>
@media (max-width: 768px) {
  aside {
    width: 100%;
    height: 100%;
  }
}
</style>
