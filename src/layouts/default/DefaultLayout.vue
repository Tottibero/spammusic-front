<template>
  <div class="flex">
    <!-- Botón hamburguesa (solo si no es la página de login) -->
    <button
      v-if="!isLoginPage"
      class="menu-hamburguesa fixed top-4 left-4 z-20 bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-[#211d1d] p-3 rounded-lg shadow-lg md:hidden transition-all duration-300 hover:from-[#c5d600] hover:to-[#fbd900]"
      @click="toggleMenu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#211d1d" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Barra lateral (solo si no es la página de login) -->
    <SidebarMenu 
      v-if="!isLoginPage"
      :menuVisible="menuVisible" 
      @close-menu="closeMenu"
    />

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
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import SidebarMenu from "./components/SidebarMenu.vue";

export default {
  name: "DefaultLayout",
  components: {
    SidebarMenu,
  },
  setup() {
    const menuVisible = ref(false);
    const route = useRoute();

    // ✅ Alternar menú con botón de hamburguesa
    const toggleMenu = () => {
      menuVisible.value = !menuVisible.value;
    };

    // ✅ Cerrar menú cuando cambia la ruta
    watch(route, () => {
      console.log("🔄 Cambio de ruta detectado en DefaultLayout.vue, cerrando menú...");
      menuVisible.value = false;
    });

    // ✅ Función para cerrar menú desde `SidebarMenu.vue`
    const closeMenu = () => {
      console.log("📌 `closeMenu()` ejecutado en DefaultLayout.vue");
      menuVisible.value = false;
    };

    return {
      menuVisible,
      toggleMenu,
      closeMenu,
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
