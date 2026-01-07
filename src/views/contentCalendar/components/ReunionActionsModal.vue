<template>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="$emit('close')">
        <div class="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative overflow-hidden">
            <!-- Decorative background blob -->
            <div
                class="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none">
            </div>

            <div class="relative z-10">
                <!-- Header Actions -->
                <div class="flex justify-between items-start mb-6">
                    <div class="flex items-center gap-2">
                        <span
                            class="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-md">
                            Reunión
                        </span>
                    </div>
                    <button @click="$emit('close')"
                        class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                        <i class="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                <!-- Main Content -->
                <div class="space-y-6">
                    <!-- Title Input (Massive & Clean) -->
                    <div>
                        <input v-model="formData.name" type="text"
                            class="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent"
                            placeholder="Título de la reunión..." />
                        <button @click="$emit('navigate-reunions')"
                            class="mt-2 text-xs text-gray-400 hover:text-orange-600 transition-colors flex items-center gap-1">
                            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                            <span>Ver en página de reuniones</span>
                        </button>
                    </div>

                    <!-- Grid for Meta Info -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Left Column: Notes -->
                        <div class="space-y-4">
                            <div>
                                <label
                                    class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notas</label>
                                <textarea v-model="formData.notes"
                                    class="w-full border-0 bg-gray-50 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all resize-none text-sm leading-relaxed"
                                    rows="6"
                                    placeholder="Añade detalles sobre la reunión (agenda, temas a tratar...)"></textarea>
                            </div>
                        </div>

                        <!-- Right Column: Date & Author -->
                        <div class="space-y-6">
                            <div class="bg-gray-50 rounded-xl p-5 space-y-5">
                                <!-- Date -->
                                <div>
                                    <label
                                        class="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        <i class="fa-regular fa-calendar"></i> Fecha de Reunión <span
                                            class="text-red-600">*</span>
                                    </label>
                                    <input v-model="formData.publicationDate" type="datetime-local"
                                        class="w-full border-gray-200 rounded-lg text-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" />
                                    <p class="text-xs text-amber-600 mt-2">
                                        ⚠️ Las reuniones requieren fecha obligatoria
                                    </p>
                                </div>

                                <!-- Author -->
                                <div>
                                    <label
                                        class="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        <i class="fa-regular fa-user"></i> Autor
                                    </label>
                                    <select v-model="formData.authorId"
                                        class="w-full border-gray-200 rounded-lg text-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50">
                                        <option value="">Seleccionar autor...</option>
                                        <option v-for="user in rvUsers" :key="user.id" :value="user.id">
                                            {{ user.username }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                    <button @click="$emit('delete')"
                        class="group flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                        title="Eliminar permanentemente">
                        <i class="fa-regular fa-trash-can text-lg group-hover:scale-110 transition-transform"></i>
                        <span class="text-sm font-medium">Eliminar</span>
                    </button>

                    <div class="flex gap-3">
                        <button @click="$emit('close')"
                            class="px-6 py-2.5 text-gray-600 hover:bg-gray-100 font-medium rounded-xl transition-colors">
                            Cancelar
                        </button>
                        <button @click="handleUpdate"
                            class="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 shadow-lg shadow-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                            Guardar Cambios
                        </button>
                    </div>
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
    'navigate-reunions': [];
}>();

// Helper to format date for datetime-local input (YYYY-MM-DDThh:mm)
// Helper to format date for datetime-local input (YYYY-MM-DDThh:mm)
function formatForInput(dateStr: string): string {
    if (!dateStr) return '';

    // Check if it's an ISO string with Z (UTC)
    if (dateStr.endsWith('Z')) {
        // If it's effectively "Midnight UTC", treat as "Floating" (keep visual 00:00)
        // This avoids timezone shifts for date-only content (like Radar)
        if (dateStr.endsWith('T00:00:00.000Z') || dateStr.endsWith('T00:00:00Z')) {
            return dateStr.slice(0, 16);
        }

        // Otherwise (REUNIONS etc with specific time), convert to LOCAL time for display
        // "2026-01-27T14:18:00Z" -> "2026-01-27T15:18" (in UTC+1)
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Fallback for non-Z strings
    if (dateStr.length >= 16) {
        return dateStr.slice(0, 16);
    }
    // If it's just a date "YYYY-MM-DD"
    if (dateStr.length === 10) {
        return dateStr + 'T00:00';
    }
    return dateStr;
}

const formData = ref({
    name: props.content.name,
    notes: props.content.notes || '',
    publicationDate: formatForInput(props.content.publicationDate || ''),
    authorId: (props.content as any).authorId || props.content.author?.id || ''
});

// Watch for content changes
watch(() => props.content, (newContent) => {
    formData.value = {
        name: newContent.name,
        notes: newContent.notes || '',
        publicationDate: formatForInput(newContent.publicationDate || ''),
        authorId: (newContent as any).authorId || newContent.author?.id || ''
    };
}, { deep: true });

// Watch for publication date changes to auto-update reunion name
watch(() => formData.value.publicationDate, (newDate) => {
    if (newDate) {
        const date = new Date(newDate);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            // Check if name is already formatted or default, to avoid overwriting custom titles?
            // User requested "automatic", usually implies overwrite or when empty/pattern match.
            // For now, let's update it directly as per request "make title automatic".
            formData.value.name = `Reunión del ${day}/${month}`;
        }
    }
});

function handleUpdate() {
    emit('update', { ...formData.value });
}
</script>
