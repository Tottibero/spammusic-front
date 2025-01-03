<template>
  <div id="app-container">

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
      <template #content="props" style="background: grey;">
        <div v-if="props.type === 'success'" >
          <h4 style="color: black;">
            🧚 {{ props.title }} 🥳🥳
          </h4>
          <p style="color: black;">
            {{ props.text }}
          </p>
        </div>
      </template>
      <template #clearIcon>
        <span style="outline:1px solid red; border-radius:50%; padding:4px 6px;">
          ❌
        </span>
      </template>
    </ToastContainer>

    <!-- Determina el layout según la ruta -->
    <component :is="layoutComponent">
      <router-view />
    </component>
  </div>
</template>

<script lang="ts">
import DefaultLayout from './layouts/DefaultLayout.vue';
import LoginLayout from './layouts/LoginLayout.vue';
import "vue3-toaster/styles";
import { useToaster, ToastContainer } from "vue3-toaster";
const toastConnfigOptions= {
  pauseOnHover:true,
  closable:true,
  closeOnDoubleClick:true
}

export default {
  name: 'App',
  computed: {
    layoutComponent() {
      // Determina el layout según el nombre de la ruta
      const routeName = this.$route.name;
      return routeName === 'Login' ? LoginLayout : DefaultLayout;
    },
  },
};
</script>
