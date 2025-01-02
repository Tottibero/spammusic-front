<template>
    <div class="max-w-sm mx-auto mt-10">
      <h1 class="text-2xl font-bold mb-4">Login</h1>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <input
          type="text"
          v-model="username"
          placeholder="Username"
          class="w-full px-4 py-2 border rounded"
        />
        <input
          type="password"
          v-model="password"
          placeholder="Password"
          class="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          :disabled="loading"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      </form>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useAuthStore } from '../stores/auth';
  import { useRouter } from 'vue-router';
  
  export default defineComponent({
    setup() {
      const username = ref('');
      const password = ref('');
      const loading = ref(false);
      const error = ref<string | null>(null);
  
      const authStore = useAuthStore();
      const router = useRouter();
  
      const handleLogin = async () => {
        error.value = null;
        loading.value = true;
  
        try {
          await authStore.login({ username: username.value, password: password.value });
          router.push({ name: 'Home' });
        } catch (err) {
          error.value = 'Login failed. Please check your credentials.';
        } finally {
          loading.value = false;
        }
      };
  
      return {
        username,
        password,
        loading,
        error,
        handleLogin,
      };
    },
  });
  </script>
  