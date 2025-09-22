<template>
  <aside
    :class="[
      'w-64 bg-gradient-to-l from-gray-900 to-gray-950 text-white fixed left-0 top-0 z-30 transform transition-transform duration-300 h-screen',
      menuVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    ]"
  >
    <div class="flex flex-col h-full">
      <div class="flex-1 overflow-y-auto overscroll-contain touch-auto">
        <div class="flex-1 overflow-y-auto">
          <div class="p-4 text-xl font-bold border-b border-gray-700 flex items-center justify-center space-x-3">
            <img src="/LOGO-SPAM-MUSIC.svg" alt="Logo" class="w-8 h-8" />
            <span>Spam Music</span>
          </div>

          <!-- Disc App -->
          <nav class="px-4 py-4 space-y-2">
            <router-link
              v-for="route in filteredDiscAppRoutes"
              :key="route.to"
              :to="route.to"
              class="text-left pl-6 block px-4 py-2 rounded transition-opacity duration-300 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-[#211d1d]"
              :active-class="route.activeClass || 'bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-[#211d1d]'"
              @click="closeMenu"
            >
              <i :class="[route.icon, 'text-md mr-2']"></i>
              {{ route.label }}
            </router-link>
          </nav>

          <!-- Riff Valley -->
          <nav class="px-4 py-4 space-y-2 border-t border-gray-700">
            <div class="font-semibold text-gray-400 uppercase text-sm mb-2">Riff Valley</div>
            <router-link
              v-for="route in filteredRiffValleyRoutes"
              :key="route.to"
              :to="route.to"
              class="text-left pl-6 block px-4 py-2 rounded transition-all duration-300 hover:bg-gradient-to-r hover:from-[#ee6f86]/60 hover:to-[#2759c1]/60 hover:text-white"
              :active-class="route.activeClass || 'bg-gradient-to-r from-[#ee6f86] to-[#2759c1] text-white'"
              @click="closeMenu"
            >
              <i :class="[route.icon, 'text-md mr-2']"></i>
              {{ route.label }}
            </router-link>
          </nav>

          <!-- Bottom -->
          <nav class="px-4 py-4 space-y-2 border-t border-gray-700">
            <router-link
              v-for="route in filteredBottomRoutes"
              :key="route.to"
              :to="route.to"
              class="text-left pl-6 block w-full px-4 py-2 rounded transition-opacity duration-300 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-[#211d1d]"
              :active-class="route.activeClass || 'bg-gray-600 text-white'"
              @click="closeMenu"
            >
              <i :class="[route.icon, 'text-md mr-2']"></i>
              {{ route.label }}
            </router-link>
          </nav>
        </div>

        <!-- Footer -->
        <nav class="p-4 space-y-2 border-t border-gray-700">
          <button
            @click="handleLogout"
            class="pl-6 font-semibold block w-full text-left px-4 py-2 rounded hover:bg-red-600 flex items-center gap-2"
          >
            <i class="fa-solid fa-right-from-bracket"></i>
            {{ logoutLabel }}
          </button>
        </nav>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from 'vue';
import { useAuthStore } from '@stores/auth/auth.ts';
import routes from './routes.json';

type AppRoute = {
  to: string;
  label: string;
  type: 'disc-app' | 'riff-valley' | 'bottom';
  activeClass?: string;
  requiredRole?: string;
  icon?: string; // <- NUEVO
};

export default defineComponent({
  name: 'SidebarMenu',
  props: {
    menuVisible: { type: Boolean, required: true },
  },
  emits: ['close-menu'],
  setup(props, { emit }) {
    const authStore = useAuthStore();

    const handleLogout = () => {
      authStore.logout();
      window.location.href = '/';
    };

    const closeMenu = () => {
      emit('close-menu');
    };

    watch(
      () => props.menuVisible,
      (open) => {
        document.body.style.overflow = open ? 'hidden' : '';
      }
    );

    const filterRoutesByRole = (routesList: AppRoute[], requiredRole: string | null = null) => {
      return routesList.filter((route) => {
        if (route.requiredRole) return authStore.hasRole(route.requiredRole);
        if (requiredRole) return authStore.hasRole(requiredRole);
        return true;
      });
    };

    const filteredDiscAppRoutes = computed(() =>
      filterRoutesByRole((routes as AppRoute[]).filter((r) => r.type === 'disc-app'))
    );
    const filteredRiffValleyRoutes = computed(() =>
      filterRoutesByRole((routes as AppRoute[]).filter((r) => r.type === 'riff-valley'), 'riffValley')
    );
    const filteredBottomRoutes = computed(() =>
      filterRoutesByRole((routes as AppRoute[]).filter((r) => r.type === 'bottom'))
    );

    return {
      handleLogout,
      closeMenu,
      logoutLabel: 'Cerrar sesión',
      filteredDiscAppRoutes,
      filteredRiffValleyRoutes,
      filteredBottomRoutes,
    };
  },
});
</script>
