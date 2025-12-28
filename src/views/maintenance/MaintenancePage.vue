<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center animate-fade-in-up">
            <!-- Icono -->
            <div class="mb-6 relative">
                <div class="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                    <span class="text-6xl">🛠️</span>
                </div>
                <!-- Decoración -->
                <div class="absolute top-0 right-1/4 animate-bounce-slow">
                    <span class="text-2xl">⚙️</span>
                </div>
            </div>

            <!-- Título -->
            <h1 class="text-3xl font-bold text-gray-800 mb-4">
                Mantenimiento Programado
            </h1>

            <!-- Mensaje -->
            <p class="text-gray-600 mb-8 text-lg leading-relaxed">
                Estamos realizando mejoras en <span class="font-bold text-primary">Riff Valley</span> para brindarte una
                mejor experiencia.
                <br>
                Se informará por el canal <a href="https://t.me/spammusicapp" target="_blank"
                    class="text-blue-500 hover:underline">Telegram</a>.
            </p>

            <!-- Botón Recargar -->
            <button @click="reloadPage"
                class="btn btn-primary btn-lg w-full sm:w-auto min-w-[200px] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Recargar página
            </button>

            <!-- Footer info -->
            <div class="mt-8 pt-6 border-t border-gray-100">
                <p class="text-sm text-gray-400">
                    ¿Necesitas ayuda urgente? Contáctanos en
                    <a href="https://t.me/+zVadIcsfRKw2ZmQ0" target="_blank"
                        class="text-blue-500 hover:underline">Telegram</a>
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'MaintenancePage',
    setup() {
        const reloadPage = () => {
            window.location.reload();
        };

        return {
            reloadPage
        };
    }
});
</script>

<style scoped>
.animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out;
}

.animate-bounce-slow {
    animation: bounce 3s infinite;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(-10%);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }

    50% {
        transform: translateY(10%);
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
}
</style>
