<template>
  <div id="app-container">
    <!-- Use the ToastContainer component -->
    <ToastContainer v-bind="toastConnfigOptions">
      <template #icon="props">
        <span style="font-size:40px">
          {{
            {
              info: '👀',
              success: '🤩',
              error: '😩',
              warn: '🥸',
            }[props.type]
          }}
        </span>
      </template>
      <template #content="props">
        <div v-if="props.type === 'success'">
          <h4>🧚 {{ props.title }} 🥳🥳</h4>
          <p>{{ props.text }}</p>
        </div>
      </template>
      <template #clearIcon>
        <span style="outline:1px solid red; border-radius:50%; padding:4px 6px;">
          ❌
        </span>
      </template>
    </ToastContainer>

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
import "vue3-toaster";
import { ToastContainer } from "vue3-toaster";

export default defineComponent({
  name: 'App',
  components: {
    ToastContainer,
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
