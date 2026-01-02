<template>
    <div class="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <h2 class="text-xl font-semibold mb-4">Conectando con Spotify...</h2>
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSpotifyAuthStore } from '../../stores/spotifyAuth';

const router = useRouter();
const route = useRoute();
const spotifyAuth = useSpotifyAuthStore();
const error = ref('');

onMounted(() => {
    // Implicit grant flow returns parameters in the hash
    if (route.hash) {
        const success = spotifyAuth.handleCallback(route.hash);
        if (success) {
            // Redirect back to list or home. Ideally we would stored the returnTo in localStorage before login.
            // For now, let's go to /spotify
            router.push('/spotify');
        } else {
            error.value = 'No se pudo obtener el token de acceso.';
            setTimeout(() => router.push('/spotify'), 3000);
        }
    } else {
        error.value = 'Respuesta de Spotify inválida.';
        setTimeout(() => router.push('/spotify'), 3000);
    }
});
</script>
