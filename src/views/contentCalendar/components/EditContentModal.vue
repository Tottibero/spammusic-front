<template>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="$emit('close')">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 class="text-lg font-bold mb-4">Editar Contenido</h3>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select v-model="formData.type"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
                        :disabled="formData.type === 'spotify'">
                        <option value="article">Artículo</option>
                        <option value="photos">Fotos</option>
                        <option value="radar">Radar</option>
                        <option value="best">Mejores Discos</option>
                        <option value="video">Video</option>
                        <option value="reunion">Reunión</option>
                        <option value="spotify" v-if="formData.type === 'spotify'">Spotify</option>
                    </select>
                    <p v-if="formData.type === 'spotify'" class="text-xs text-gray-500 mt-1">
                        El tipo de contenido no se puede cambiar para listas de Spotify.
                    </p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input v-model="formData.name" type="text"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
                        :disabled="formData.type === 'spotify'" placeholder="Título del contenido" />
                    <p v-if="formData.type === 'spotify'" class="text-xs text-gray-500 mt-1">
                        El nombre no se puede editar para listas de Spotify.
                    </p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                    <textarea v-model="formData.notes" class="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows="3" placeholder="Descripción o notas..."></textarea>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Publicación
                        <span v-if="['reunion', 'radar', 'best'].includes(formData.type)" class="text-red-600">*</span>
                    </label>
                    <input v-model="formData.publicationDate" type="datetime-local"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2"
                        :min="formData.type === 'radar' && formData.listDate ? formatDateTime(formData.listDate) : undefined" />

                    <button v-if="formData.publicationDate && !['reunion', 'radar', 'best'].includes(formData.type)"
                        @click="formData.publicationDate = ''" class="text-xs text-gray-500 hover:text-gray-700 mt-1">
                        Quitar fecha (mover a backlog)
                    </button>
                    <p v-if="['reunion', 'radar', 'best'].includes(formData.type)" class="text-xs text-amber-600 mt-1">
                        ⚠️ Este tipo de contenido requiere fecha obligatoria
                    </p>
                </div>

                <div v-if="formData.type === 'radar'">
                    <div v-if="formData.listDate" class="mb-4 text-sm text-gray-600">
                        📅 Fecha de lista: <strong>{{ formatDisplayDate(formData.listDate) }}</strong>
                    </div>

                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Cierre
                    </label>
                    <input v-model="formData.closeDate" type="date"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2"
                        :min="formData.publicationDate ? formData.publicationDate.split('T')[0] : (formData.listDate ? formData.listDate : undefined)" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                    <select v-model="formData.authorId" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                        <option value="">Seleccionar autor...</option>
                        <option v-for="user in rvUsers" :key="user.id" :value="user.id">
                            {{ user.username }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="flex justify-between items-center mt-6">
                <button @click="$emit('delete')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    🗑️ Eliminar
                </button>
                <div class="flex gap-2">
                    <button @click="$emit('close')" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                        Cancelar
                    </button>
                    <button @click="handleUpdate"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Content } from '@services/contents/contents';

interface Props {
    show: boolean;
    content: Content;
    rvUsers: any[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
    close: [];
    update: [data: any];
    delete: [];
}>();

const formData = ref({
    type: props.content.type,
    name: props.content.name,
    notes: props.content.notes || '',
    publicationDate: props.content.publicationDate || '',
    closeDate: props.content.closeDate || '',
    authorId: props.content.author?.id || '',
    listDate: props.content.list?.listDate || ''
});

// Watch for content changes
watch(() => props.content, (newContent) => {
    formData.value = {
        type: newContent.type,
        name: newContent.name,
        notes: newContent.notes || '',
        publicationDate: newContent.publicationDate || '',
        closeDate: newContent.closeDate || '',
        authorId: newContent.author?.id || '',
        listDate: newContent.list?.listDate || ''
    };
}, { deep: true });

function handleUpdate() {
    emit('update', { ...formData.value });
}

function formatDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr + 'T00:00';
}
</script>
