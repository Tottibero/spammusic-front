<template>
  <div class="flex">
<!-- Botón hamburguesa -->
<button
      v-if="!menuVisible"
      class="menu-hamburguesa fixed top-4 left-4 z-20 bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-[#211d1d] p-3 rounded-lg shadow-lg md:hidden transition-all duration-300 hover:from-[#c5d600] hover:to-[#fbd900]"
      @click="toggleMenu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#211d1d" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

<!-- Fondo oscuro con botón de cierre -->
<div v-if="menuVisible" class="overlay fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" @click="closeMenu">
  <!-- Botón de cierre (X) fuera del menú -->
  <button 
    class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-900 bg-opacity-75 text-white transition-all duration-300 hover:bg-gray-700"
    @click="closeMenu"
  >
    <i class="fa-solid fa-xmark text-lg"></i>
  </button>
</div>

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
      menuVisible.value = false;
    });

    // ✅ Función para cerrar menú desde `SidebarMenu.vue`
    const closeMenu = () => {
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
/* Fondo oscuro cuando el menú está desplegado */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

/* Ocultar barra lateral en pantallas pequeñas */
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
