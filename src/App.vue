<template>

  <div id="app-container">
    <!-- Use the ToastContainer component -->

    <!-- Layout logic -->
    <component :is="layoutComponent">
      <router-view />
    </component>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DefaultLayout from './layouts/DefaultLayout.vue';
import LoginLayout from './layouts/LoginLayout.vue';
// Remove this if "vue3-toaster/styles" is causing errors and isn't required:

export default defineComponent({
  name: 'App',
  components: {
  },
  data() {
    return {
      toastConnfigOptions: {
        pauseOnHover: true,
        closable: true,
        closeOnDoubleClick: true
      }
    };
  },
  computed: {
    layoutComponent() {
      // Determina el layout según el nombre de la ruta
      const routeName = this.$route.name;
      return routeName === 'Login' ? LoginLayout : DefaultLayout;
    },
  },
});
</script>
