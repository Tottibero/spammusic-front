<template>
  <aside :class="[
    'w-72 bg-rv-navy text-white fixed left-0 top-0 z-30 transform transition-transform duration-300 h-screen flex flex-col border-r border-white/10',
    menuVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
  ]">

    <!-- Header -->
    <div class="p-5 flex items-center gap-3 shrink-0 pl-6 bg-rv-navy">
      <img src="/LOGO-RIFF-VALLEY.svg" class="w-8 h-8 drop-shadow-sm" />

      <div class="flex items-baseline gap-1 relative top-[1px]">
        <span class="font-brand text-3xl tracking-wide opacity-90 drop-shadow-sm">
          RIFF VALLEY
        </span>

        <span class="text-sm font-medium tracking-widest lowercase text-white/75">
          app
        </span>
      </div>
    </div>


    <!-- Divider con degradado corporativo -->
    <div class="h-[4px] w-full bg-rv-gradient"></div>


    <div class="flex-1 overflow-y-auto overscroll-contain py-4">
      <ul class="menu w-full px-2 space-y-1">

        <li v-for="route in filteredDiscAppRoutes" :key="route.to">
          <router-link :to="route.to" class="flex items-center justify-start py-2 px-4 text-sm font-medium rounded-primary
         transition-all duration-300
         hover:bg-gray-700 hover:text-white" :active-class="'bg-gradient-to-r from-[#e46e8a] to-[#b0669f] text-white'"
            @click="closeMenu">
            <i :class="[route.icon, 'text-base w-5 text-center mr-3']"></i>
            {{ route.label }}
          </router-link>
        </li>

        <li v-if="filteredNewDiscsRoutes.length > 0" class="pt-2">
          <details class="group">
            <summary class="font-bold uppercase text-xs tracking-wider flex justify-between items-center py-2 px-4
         text-white group-open:text-gray-400
         hover:text-white cursor-pointer">
              <div class="flex items-center justify-start">
                <i class="fa-solid fa-circle-plus text-base w-5 text-center mr-3"></i>
                Nuevos Discos
              </div>
              <i
                class="fa-solid fa-chevron-down text-[10px] transition-transform duration-200 group-open:rotate-180"></i>
            </summary>
            <ul>
              <li v-for="route in filteredNewDiscsRoutes" :key="route.to" class="mt-1">
                <router-link :to="route.to" class="flex items-center justify-start py-2 pl-8 pr-4 text-sm font-medium rounded-primary
         transition-all duration-300
         hover:bg-gray-700 hover:text-white" :active-class="'bg-gradient-to-r from-[#d66a43] to-[#ce6241] text-white'"
                  @click="closeMenu">
                  <i :class="[route.icon, 'text-base w-5 text-center mr-3']"></i>
                  {{ route.label }}
                </router-link>
              </li>
            </ul>
          </details>
        </li>

        <li v-if="filteredRiffValleyRoutes.length > 0" class="pt-2">
          <details class="group">
            <summary class="font-bold uppercase text-xs tracking-wider flex justify-between items-center py-2 px-4
         text-white group-open:text-gray-400
         hover:text-white cursor-pointer">
              <div class="flex items-center justify-start">
                <i class="fa-solid fa-headphones text-base w-5 text-center mr-3"></i>
                Riff Valley
              </div>

              <i class="fa-solid fa-chevron-down text-[10px]
               transition-transform duration-200
               group-open:rotate-180"></i>
            </summary>

            <ul>
              <li v-for="route in filteredRiffValleyRoutes" :key="route.to" class="mt-1">
                <router-link :to="route.to" class="flex items-center justify-start py-2 pl-8 pr-4 text-sm font-medium rounded-primary
                 transition-all duration-300
                 hover:bg-gray-700 hover:text-white"
                  :active-class="'bg-gradient-to-r from-[#2f66c9] to-[#0064d6] text-white'" @click="closeMenu">
                  <i :class="[route.icon, 'text-base w-5 text-center mr-3']"></i>
                  {{ route.label }}
                </router-link>
              </li>
            </ul>
          </details>
        </li>

        <li v-if="filteredManagementRoutes.length > 0" class="pt-2">
          <details class="group">
            <summary class="font-bold uppercase text-xs tracking-wider flex justify-between items-center py-2 px-4
         text-white group-open:text-gray-400
         hover:text-white cursor-pointer">
              <div class="flex items-center justify-start">
                <i class="fa-solid fa-gears text-base w-5 text-center mr-3"></i>
                Gestión
              </div>

              <i class="fa-solid fa-chevron-down text-[10px]
               transition-transform duration-200
               group-open:rotate-180"></i>
            </summary>

            <ul>
              <li v-for="route in filteredManagementRoutes" :key="route.to" class="mt-1">
                <router-link :to="route.to" class="flex items-center justify-start py-2 pl-8 pr-4 text-sm font-medium rounded-primary
                 transition-all duration-300
                 hover:bg-gray-700 hover:text-white"
                  :active-class="'bg-gradient-to-r from-[#b0669f] to-[#8a5bb4] text-white'" @click="closeMenu">
                  <i :class="[route.icon, 'text-base w-5 text-center mr-3']"></i>
                  {{ route.label }}
                </router-link>
              </li>
            </ul>
          </details>
        </li>


        <li v-if="filteredBottomRoutes.length > 0" class="my-2 border-t border-gray-700/50"></li>

        <li v-for="route in filteredBottomRoutes" :key="route.to">
          <router-link :to="route.to" class="flex items-center justify-start py-2 px-4 text-sm font-medium rounded-primary
         transition-all duration-300
         hover:bg-gray-700 hover:text-white" :active-class="'bg-gradient-to-r from-[#e46e8a] to-[#b0669f] text-white'"
            @click="closeMenu">
            <i :class="[route.icon, 'text-base w-5 text-center mr-3']"></i>
            {{ route.label }}
          </router-link>
        </li>

      </ul>
    </div>

    <!-- Divider corporativo -->
    <div class="h-[1px] w-full bg-rv-gradient"></div>

    <div class="p-2 shrink-0">
      <button @click="handleLogout" class="w-full bg-transparent flex items-center justify-start py-2 px-4 text-sm font-medium rounded-primary
         transition-all duration-300
         border-0 outline-none focus:outline-none focus-visible:outline-none
         ring-0 focus:ring-0 focus-visible:ring-0
         hover:bg-red-600 hover:text-white">
        <i class="fa-solid fa-right-from-bracket text-base w-5 text-center mr-3"></i>
        {{ logoutLabel }}
      </button>
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