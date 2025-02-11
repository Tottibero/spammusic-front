<template>
  <div id="app-container">
    <!-- Mostrar SidebarMenu solo si no es la página de login -->
    <SidebarMenu 
      v-if="!isLoginPage"
      :menuVisible="menuVisible"
      @close-menu="closeMenuHandler"
    />

    <!-- Layout logic -->
    <component :is="layoutComponent">
      <router-view />
    </component>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import DefaultLayout from "./layouts/default/DefaultLayout.vue";
import LoginLayout from "./layouts/auth/LoginLayout.vue";
import SidebarMenu from "@/layouts/default/components/SidebarMenu.vue";

export default defineComponent({
  name: "App",
  components: {
    SidebarMenu,
  },
  setup() {
    const menuVisible = ref(false);
    const route = useRoute();

    const closeMenuHandler = () => {
      console.log("✅ `closeMenuHandler()` ejecutado en App.vue");
      menuVisible.value = false;
    };

    // Detectar si estamos en la página de login
    const isLoginPage = computed(() => route.name === "Login");

    watch(route, () => {
      console.log("🔄 Cambio de ruta detectado, cerrando menú...");
      menuVisible.value = false;
    });

    return {
      menuVisible,
      closeMenuHandler,
      isLoginPage, // ✅ Nueva variable reactiva para detectar login
      layoutComponent: computed(() => {
        return route.name === "Login" ? LoginLayout : DefaultLayout;
      }),
    };
  },
});
</script>
