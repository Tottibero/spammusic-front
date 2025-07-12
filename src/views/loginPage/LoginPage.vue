<template>
  <div class="min-h-screen flex flex-col items-center justify-center">
    <img src="/LOGO-SPAM-MUSIC.svg" alt="Spam Music Logo" class="w-32 h-32 mb-4">

    <h1 class="text-5xl font-extrabold mb-8 text-[#211d1d]">
      Spam Music
    </h1>

    <div class="w-full max-w-sm shadow-lg rounded-3xl p-6 flex flex-col items-center justify-center">
      <form @submit.prevent="handleLogin" class="space-y-4 w-full">
        <input type="text" v-model="username" placeholder="Username"
          class="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <input type="password" v-model="password" placeholder="Password"
          class="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <button type="submit"
          class="w-full bg-gradient-to-r from-[#fcee21] to-[#d9e021] text-black font-bold py-2 rounded-full hover:from-[#fbd900] hover:to-[#c5d600] focus:outline-none focus:ring-4 focus:ring-yellow-300 "
          :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
      </form>
    </div>

    <div class="mt-6 text-center">
<button
  @click="showHowToUse = true"
  class="inline-flex items-center text-[#211d1d] font-semibold px-4 py-2 rounded-full shadow transition duration-100
         bg-gray-100 hover:bg-gradient-to-r hover:from-[#fcee21] hover:to-[#d9e021] hover:text-[#211d1d]"
>
  <i class="fa-solid fa-circle-question text-md mr-2"></i>
  Cómo usar la app
</button>
    </div>

    <!-- Modal con contenido explicativo -->
    <HowToUseModal v-if="showHowToUse" @close="showHowToUse = false" />
  </div>
</template>


<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from '../../stores/auth/auth';
import { useRouter } from 'vue-router';
import HowToUseModal from '@/components/HowToUseModal.vue'; // 👈 ajuste aquí

export default defineComponent({
  components: {
    HowToUseModal,
  },
  setup() {
    const username = ref('');
    const password = ref('');
    const loading = ref(false);
    const error = ref<string | null>(null);
    const showHowToUse = ref(false); // 👈 control del modal

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
      showHowToUse, // 👈 exportamos control
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
