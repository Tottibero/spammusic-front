<template>
  <aside
    :class="[
      'w-72 bg-gradient-to-l from-gray-900 to-gray-950 text-white fixed left-0 top-0 z-30 transform transition-transform duration-300 h-screen flex flex-col',
      menuVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    ]"
  >
    <div class="p-4 text-xl font-bold border-b border-gray-700 flex items-center justify-start space-x-3 shrink-0 pl-6">
      <img src="/LOGO-SPAM-MUSIC.svg" alt="Logo" class="w-8 h-8" />
      <span>Spam Music</span>
    </div>

    <div class="flex-1 overflow-y-auto overscroll-contain py-4">
      <ul class="menu w-full px-2 space-y-1">
        
        <li v-for="route in filteredDiscAppRoutes" :key="route.to">
          <router-link
            :to="route.to"
            class="flex items-center justify-start py-2 px-4 text-sm font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-[#211d1d]"
            :active-class="route.activeClass || 'bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-[#211d1d]'"
            @click="closeMenu"
          >
            <i :class="[route.icon, 'text-base w-5 text-center mr-3']"></i>
            {{ route.label }}
          </router-link>
        </li>

        <li v-if="filteredNewDiscsRoutes.length > 0" class="pt-2">
          <details>
            <summary class="font-bold text-gray-400 uppercase text-xs tracking-wider hover:text-white flex justify-between items-center py-2 px-4">
              <div class="flex items-center justify-start">
                <i class="fa-solid fa-circle-plus text-base w-5 text-center mr-3"></i> 
                Nuevos Discos
              </div>
              <i class="fa-solid fa-chevron-down text-[10px]"></i>
            </summary>
            <ul>
              <li v-for="route in filteredNewDiscsRoutes" :key="route.to" class="mt-1">
                <router-link
                  :to="route.to"
                  class="flex items-center justify-start py-2 pl-8 pr-4 text-sm font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 hover:text-white"
                  :active-class="route.activeClass || 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'"
                  @click="closeMenu"
                >
                  <i :class="[route.icon, 'text-base w-5 text-center mr-3']"></i>
                  {{ route.label }}
                </router-link>
              </li>
            </ul>
          </details>
        </li>

        <li v-if="filteredRiffValleyRoutes.length > 0" class="pt-2">
          <details>
            <summary class="font-bold text-gray-400 uppercase text-xs tracking-wider hover:text-white flex justify-between items-center py-2 px-4">
              <div class="flex items-center justify-start">
                <i class="fa-solid fa-guitar text-base w-5 text-center mr-3"></i> 
                Riff Valley
              </div>
              <i class="fa-solid fa-chevron-down text-[10px]"></i>
            </summary>
            <ul>
              <li v-for="route in filteredRiffValleyRoutes" :key="route.to" class="mt-1">
                <router-link
                  :to="route.to"
                  class="flex items-center justify-start py-2 pl-8 pr-4 text-sm font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-[#ee6f86]/60 hover:to-[#2759c1]/60 hover:text-white"
                  :active-class="route.activeClass || 'bg-gradient-to-r from-[#ee6f86] to-[#2759c1] text-white'"
                  @click="closeMenu"
                >
                  <i :class="[route.icon, 'text-base w-5 text-center mr-3']"></i>
                  {{ route.label }}
                </router-link>
              </li>
            </ul>
          </details>
        </li>

        <li v-if="filteredManagementRoutes.length > 0" class="pt-2">
          <details>
            <summary class="font-bold text-gray-400 uppercase text-xs tracking-wider hover:text-white flex justify-between items-center py-2 px-4">
              <div class="flex items-center justify-start">
                <i class="fa-solid fa-gears text-base w-5 text-center mr-3"></i> 
                Gestión
              </div>
              <i class="fa-solid fa-chevron-down text-[10px]"></i>
            </summary>
            <ul>
              <li v-for="route in filteredManagementRoutes" :key="route.to" class="mt-1">
                <router-link
                  :to="route.to"
                  class="flex items-center justify-start py-2 pl-8 pr-4 text-sm font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-[#211d1d]"
                  :active-class="route.activeClass || 'bg-gray-600 text-white'"
                  @click="closeMenu"
                >
                  <i :class="[route.icon, 'text-base w-5 text-center mr-3']"></i>
                  {{ route.label }}
                </router-link>
              </li>
            </ul>
          </details>
        </li>

        <li v-if="filteredBottomRoutes.length > 0" class="my-2 border-t border-gray-700/50"></li>

        <li v-for="route in filteredBottomRoutes" :key="route.to">
          <router-link
            :to="route.to"
            class="flex items-center justify-start py-2 px-4 text-sm font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-[#211d1d]"
            :active-class="route.activeClass || 'bg-gray-600 text-white'"
            @click="closeMenu"
          >
            <i :class="[route.icon, 'text-base w-5 text-center mr-3']"></i>
            {{ route.label }}
          </router-link>
        </li>

      </ul>
    </div>

    <div class="p-2 border-t border-gray-700 bg-gray-900/50 shrink-0">
      <ul class="menu w-full">
        <li>
          <button
            @click="handleLogout"
            class="flex items-center justify-start py-2 px-4 text-sm font-semibold text-red-400 hover:bg-red-600 hover:text-white transition-colors"
          >
            <i class="fa-solid fa-right-from-bracket text-base w-5 text-center mr-3"></i>
            {{ logoutLabel }}
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from 'vue';
import { useAuthStore } from '@stores/auth/auth.ts';
import routesData from './routes.json';

// Tipo actualizado con 'new-discs'
type AppRoute = {
  to: string;
  label: string;
  type: 'disc-app' | 'new-discs' | 'riff-valley' | 'management' | 'bottom';
  activeClass?: string;
  requiredRole?: string;
  icon?: string;
};

export default defineComponent({
  name: 'SidebarMenu',
  props: {
    menuVisible: { type: Boolean, required: true },
  },
  emits: ['close-menu'],
  setup(props, { emit }) {
    const authStore = useAuthStore();
    const allRoutes = routesData as AppRoute[];

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

    const filterByRole = (routes: AppRoute[]) => {
      return routes.filter((route) => {
        if (route.requiredRole) {
          return authStore.hasRole(route.requiredRole);
        }
        return true;
      });
    };

    // 1. Disc App
    const filteredDiscAppRoutes = computed(() =>
      filterByRole(allRoutes.filter((r) => r.type === 'disc-app'))
    );

    // 2. Nuevos Discos (NUEVA CATEGORÍA)
    const filteredNewDiscsRoutes = computed(() =>
      filterByRole(allRoutes.filter((r) => r.type === 'new-discs'))
    );

    // 3. Riff Valley
    const filteredRiffValleyRoutes = computed(() =>
      filterByRole(allRoutes.filter((r) => r.type === 'riff-valley'))
    );

    // 4. Gestión
    const filteredManagementRoutes = computed(() =>
      filterByRole(allRoutes.filter((r) => r.type === 'management'))
    );

    // 5. Bottom
    const filteredBottomRoutes = computed(() =>
      filterByRole(allRoutes.filter((r) => r.type === 'bottom'))
    );

    return {
      handleLogout,
      closeMenu,
      logoutLabel: 'Cerrar sesión',
      filteredDiscAppRoutes,
      filteredNewDiscsRoutes,
      filteredRiffValleyRoutes,
      filteredManagementRoutes,
      filteredBottomRoutes,
    };
  },
});
</script>