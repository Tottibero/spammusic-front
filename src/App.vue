<template>
  <div>
    <!-- Determina el layout según la ruta -->
    <component :is="layoutComponent">
      <router-view />
    </component>
  </div>
</template>

<script lang="ts">
import DefaultLayout from './layouts/DefaultLayout.vue';
import LoginLayout from './layouts/LoginLayout.vue';

export default {
  name: 'App',
  computed: {
    layoutComponent() {
      // Determina el layout según el nombre de la ruta
      const routeName = this.$route.name;
      return routeName === 'login' ? LoginLayout : DefaultLayout;
    },
  },
};
</script>
