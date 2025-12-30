<template>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="$emit('close')">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 class="text-lg font-bold mb-4">Leyenda de Tipos de Contenido</h3>

            <div class="space-y-3">
                <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded" style="background-color: #3b82f6;"></div>
                    <span class="font-medium">Artículo</span>
                </div>
                <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded" style="background-color: #ec4899;"></div>
                    <span class="font-medium">Fotos</span>
                </div>
                <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded" style="background-color: #22c55e;"></div>
                    <span class="font-medium">Spotify</span>
                </div>
                <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded" style="background-color: #f59e0b;"></div>
                    <span class="font-medium">Radar</span>
                </div>
                <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded" style="background-color: #ef4444;"></div>
                    <span class="font-medium">Mejores Discos</span>
                </div>
                <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded" style="background-color: #8b5cf6;"></div>
                    <span class="font-medium">Video</span>
                </div>
                <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded" style="background-color: #f97316;"></div>
                    <span class="font-medium">Reunión</span>
                </div>
            </div>

            <div class="flex justify-end mt-6">
                <button @click="$emit('close')"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Cerrar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    show: boolean;
}

defineProps<Props>();

defineEmits<{
    close: [];
}>();
</script>
