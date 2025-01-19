<template>
  <div class="flex">
    <!-- Botón hamburguesa -->
    <button
      class="menu-hamburguesa fixed top-4 left-4 z-20 bg-gray-800 text-white p-2 rounded-md md:hidden"
      @click="toggleMenu"
    >
      <!-- Ícono de hamburguesa -->
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Barra lateral -->
    <SidebarMenu :menuVisible="menuVisible" />

    <!-- Contenido principal -->
    <main
      :class="[
        'flex-1 bg-gray-100 p-6 transition-all duration-300',
        menuVisible ? 'ml-64' : 'ml-0 md:ml-64',
      ]"
    >
      <slot />
    </main>
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import SidebarMenu from "./components/SidebarMenu.vue";

export default {
  name: "DefaultLayout",
  components: {
    SidebarMenu,
  },
  setup() {
    const menuVisible = ref(false);

    const toggleMenu = () => {
      menuVisible.value = !menuVisible.value;
    };

    return {
      menuVisible,
      toggleMenu,
    };
  },
};
</script>

<style>
/* Ocultar barra lateral en pantallas pequeñas por defecto */
@media (max-width: 768px) {
  aside {
    display: none;
  }
  .menu-hamburguesa {
    display: block;
  }
}

@media (min-width: 768px) {
  .menu-hamburguesa {
    display: none;
  }
}
</style>
