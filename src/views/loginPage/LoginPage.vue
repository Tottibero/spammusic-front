<template>
  <div class="min-h-screen flex flex-col items-center justify-center">
    <!-- Título llamativo -->
    <h1 class="text-5xl font-extrabold mb-8 text-brown-700">
      Spam Music
    </h1>

    <!-- Caja del login -->
    <div class="w-full max-w-sm shadow-lg rounded-lg p-6 flex flex-col items-center justify-center">
      <form @submit.prevent="handleLogin" class="space-y-4 w-full">
        <input
          type="text"
          v-model="username"
          placeholder="Username"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          v-model="password"
          placeholder="Password"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          :disabled="loading"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from '../../stores/auth/auth';
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

<style scoped>
body {
  background-color: #f9f9f9;
  font-family: 'Inter', sans-serif;
}

.text-brown-700 {
  color: #7B3F00;
}
</style>
