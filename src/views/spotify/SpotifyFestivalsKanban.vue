<template>
    <div class="p-6 h-full flex flex-col">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-semibold">Tablero de Festivales</h1>
            <div class="flex gap-2">
                <button class="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800" @click="openCreate">
                    Nueva lista
                </button>
                <button class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300" @click="reload">
                    Recargar
                </button>
            </div>
        </div>

        <!-- Loading / Error -->
        <div v-if="loading" class="text-center py-10">Cargando festivales...</div>
        <div v-else-if="error" class="text-red-500 text-center py-10">{{ error }}</div>

        <!-- Kanban Board -->
        <div v-else class="flex gap-4 h-full overflow-x-auto pb-4">
            <div v-for="col in columns" :key="col.id"
                class="flex-1 min-w-[300px] rounded-xl p-4 flex flex-col max-h-full"
                :class="[col.bgClass, col.borderClass]" @dragover.prevent="onDragOver" @drop="onDrop(col.id)">
                <!-- Column Header -->
                <h2 class="font-bold mb-4 flex items-center justify-between sticky top-0 pb-2 z-10"
                    :class="[col.textClass, col.bgClass]">
                    {{ col.label }}
                    <span class="text-sm px-2 py-0.5 rounded-full" :class="col.countClass">
                        {{ getItems(col.id).length }}
                    </span>
                </h2>

                <!-- Cards Container -->
                <div class="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    <div v-for="item in getItems(col.id)" :key="item.id"
                        class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow group relative"
                        draggable="true" @dragstart="onDragStart(item)">
                        <!-- Card Content -->
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-semibold text-gray-900 leading-tight">
                                {{ item.nombre }}
                            </h3>
                        </div>

                        <!-- User Selector & Actions -->
                        <div class="mt-3 space-y-3">
                            <!-- User Select -->
                            <!-- User Selector (Click to Edit) -->
                            <div class="relative group mt-3">
                                <!-- Visual Display (Click to edit) -->
                                <div v-if="editingUserItemId !== item.id" @click="startEditingUser(item.id)"
                                    class="flex items-center gap-2 p-1.5 rounded-lg border border-transparent bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">
                                    <template v-if="item.user">
                                        <img v-if="item.user.image" :src="item.user.image"
                                            class="w-5 h-5 rounded-full object-cover bg-gray-200" alt="Avatar" />
                                        <div v-else
                                            class="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-bold text-black/50">
                                            {{ item.user.username.charAt(0).toUpperCase() }}
                                        </div>
                                        <span class="text-xs font-medium text-gray-700 truncate min-w-0 flex-1">{{
                                            item.user.username }}</span>
                                    </template>
                                    <template v-else>
                                        <div class="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                                            <i class="fa-solid fa-user text-gray-400 text-[10px]"></i>
                                        </div>
                                        <span class="text-xs text-gray-500 flex-1">Sin asignar</span>
                                    </template>
                                </div>

                                <!-- Actual Select (Visible only when editing) -->
                                <select v-else :value="item.user?.id || ''" @change="onUserChange(item, $event)"
                                    @blur="stopEditingUser" ref="userSelectRef"
                                    class="w-full text-xs p-1.5 bg-white border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200">
                                    <option value="">Sin asignar</option>
                                    <option v-for="user in users" :key="user.id" :value="user.id">
                                        {{ user.username }}
                                    </option>
                                </select>
                            </div>

                            <!-- Action Buttons -->
                            <!-- Action Buttons and Date -->
                            <div class="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                                <!-- Date -->
                                <span class="text-xs text-gray-400">{{ fmtDate(item.fechaActualizacion) }}</span>

                                <!-- Buttons -->
                                <div class="flex items-center gap-2">
                                    <!-- Edit -->
                                    <button @click="openEdit(item)"
                                        class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                        title="Editar">
                                        <i class="fa-solid fa-pen text-xs"></i>
                                    </button>

                                    <!-- Delete -->
                                    <button @click="confirmDelete(item)"
                                        class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                        title="Eliminar">
                                        <i class="fa-solid fa-trash text-xs"></i>
                                    </button>

                                    <!-- Spotify Link -->
                                    <a :href="item.enlace" target="_blank"
                                        class="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-[#1DB954] hover:bg-green-100 transition-colors"
                                        title="Abrir en Spotify">
                                        <i class="fa-brands fa-spotify text-base"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <div v-if="showModal" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            @click.self="closeModal">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
                <h3 class="text-lg font-bold">{{ isEditing ? 'Editar Festival' : 'Nuevo Festival' }}</h3>

                <div>
                    <label class="block text-sm font-medium mb-1">Nombre</label>
                    <input v-model="form.nombre" type="text"
                        class="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/40" />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-1">Enlace</label>
                    <input v-model="form.enlace" type="url"
                        class="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/40" />
                </div>

                <div class="flex justify-end gap-2 pt-2">
                    <button @click="closeModal" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
                    <button @click="save"
                        class="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90">Guardar</button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue';
import {
    getSpotifyFestivals,
    createSpotify,
    updateSpotify,
    removeSpotify,
    type Spotify,
    type SpotifyEstado,
    toISO
} from '@services/spotify/spotify';
import { getUsersRv, type Superuser } from '@services/auth/auth';
import SwalService from '@services/swal/SwalService';

// --- Types ---
type ColumnId = SpotifyEstado;

interface Column {
    id: ColumnId;
    label: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    countClass: string;
}

// --- Constants ---
const columns: Column[] = [
    {
        id: 'por_actualizar',
        label: 'Por actualizar',
        bgClass: 'bg-red-50',
        borderClass: 'border-t-4 border-red-500',
        textClass: 'text-red-900',
        countClass: 'bg-red-200 text-red-800'
    },
    {
        id: 'en_desarrollo',
        label: 'En desarrollo',
        bgClass: 'bg-orange-50',
        borderClass: 'border-t-4 border-orange-500',
        textClass: 'text-orange-900',
        countClass: 'bg-orange-200 text-orange-800'
    },
    {
        id: 'para_publicar',
        label: 'Para publicar',
        bgClass: 'bg-blue-50',
        borderClass: 'border-t-4 border-blue-500',
        textClass: 'text-blue-900',
        countClass: 'bg-blue-200 text-blue-800'
    },
    {
        id: 'publicada',
        label: 'Publicada',
        bgClass: 'bg-green-50',
        borderClass: 'border-t-4 border-green-500',
        textClass: 'text-green-900',
        countClass: 'bg-green-200 text-green-800'
    },
];

// --- State ---
const items = ref<Spotify[]>([]);
const users = ref<Superuser[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const draggedItem = ref<Spotify | null>(null);

// User Edit State
const editingUserItemId = ref<string | null>(null);
const userSelectRef = ref<HTMLSelectElement | null>(null);

// Modal state
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const form = reactive({
    nombre: '',
    enlace: ''
});

// --- Getters ---
function getItems(status: SpotifyEstado) {
    return items.value.filter(i => i.estado === status);
}

function fmtDate(iso: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString() + ' ' + new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// --- Logic ---
async function reload() {
    loading.value = true;
    error.value = null;
    try {
        const [fetchedItems, fetchedUsers] = await Promise.all([
            getSpotifyFestivals(),
            getUsersRv()
        ]);
        items.value = fetchedItems;
        users.value = fetchedUsers;
    } catch (e: any) {
        console.error(e);
        error.value = e?.response?.data?.message || 'Error cargando datos';
        SwalService.error('Error cargando datos');
    } finally {
        loading.value = false;
    }
}

// --- Drag & Drop ---
function onDragStart(item: Spotify) {
    draggedItem.value = item;
}

function onDragOver(event: DragEvent) {
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
    }
}

async function onDrop(targetState: ColumnId) {
    if (!draggedItem.value) return;

    const item = draggedItem.value;
    if (item.estado === targetState) return;

    const originalState = item.estado;
    const originalDate = item.fechaActualizacion;

    // Optimistic update
    const newDate = toISO(new Date());
    item.estado = targetState;
    item.fechaActualizacion = newDate;

    try {
        await updateSpotify(item.id, {
            estado: targetState,
            fechaActualizacion: newDate
        });
    } catch (e) {
        console.error(e);
        item.estado = originalState; // Revert
        item.fechaActualizacion = originalDate;
        SwalService.error('No se pudo actualizar el estado');
    } finally {
        draggedItem.value = null;
    }
}

// --- User Assignment ---
// --- User Assignment ---
async function startEditingUser(itemId: string) {
    editingUserItemId.value = itemId;
    await nextTick();
    const selects = userSelectRef.value as unknown as HTMLSelectElement[];
    if (Array.isArray(selects) && selects.length > 0) {
        selects[0]?.focus();
    } else if (userSelectRef.value) {
        (userSelectRef.value as HTMLSelectElement).focus();
    }
}

function stopEditingUser() {
    editingUserItemId.value = null;
}

async function onUserChange(item: Spotify, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newUserId = select.value || null; // null if empty string

    // Stop editing
    editingUserItemId.value = null;

    // Optimistic? No, let's wait for confirmation or just do it. 
    // Select usually implies immediate action.
    const oldUser = item.user;

    if (newUserId) {
        // Encontrar el username para la UI optimista (o poner placeholder)
        const u = users.value.find(x => x.id === newUserId);
        item.user = {
            id: newUserId,
            username: u?.username || '...',
            image: u?.image
        };
    } else {
        item.user = undefined;
    }

    try {
        // We send userId. If empty string, we might need to send null or something depending on backend.
        // Assuming backend handles nullable string or check how update works. 
        // DTO has userId?: string.
        await updateSpotify(item.id, { userId: newUserId || undefined });
        // Success toast? Maybe not needed for small interactions.
    } catch (e) {
        console.error(e);
        item.user = oldUser; // Revert
        SwalService.error('Error asignando usuario');
    }
}

// --- Create / Edit Item ---
function openCreate() {
    isEditing.value = false;
    editingId.value = null;
    form.nombre = '';
    form.enlace = '';
    showModal.value = true;
}

function openEdit(item: Spotify) {
    isEditing.value = true;
    editingId.value = item.id;
    form.nombre = item.nombre;
    form.enlace = item.enlace;
    showModal.value = true;
}

function closeModal() {
    showModal.value = false;
    editingId.value = null;
}

async function save() {
    if (!form.nombre || !form.enlace) {
        SwalService.error('Completa todos los campos');
        return;
    }

    try {
        if (isEditing.value && editingId.value) {
            const updated = await updateSpotify(editingId.value, {
                nombre: form.nombre,
                enlace: form.enlace
            });
            // Update local
            const idx = items.value.findIndex(x => x.id === editingId.value);
            if (idx !== -1) items.value[idx] = updated;
            SwalService.success('Festival actualizado');
        } else {
            // Create new
            const created = await createSpotify({
                nombre: form.nombre,
                enlace: form.enlace,
                estado: 'por_actualizar', // Default state
                tipo: 'festival',         // Fixed type
                fechaActualizacion: toISO(new Date())
            });
            items.value.push(created);
            SwalService.success('Festival creado');
        }
        closeModal();
    } catch (e) {
        console.error(e);
        SwalService.error('Error guardando festival');
    }
}

// --- Delete Item ---
async function confirmDelete(item: Spotify) {
    const result = await SwalService.confirm(
        '¿Eliminar festival?',
        `Vas a eliminar "${item.nombre}". Esta acción no se puede deshacer.`,
        'warning'
    );

    if (result.isConfirmed) {
        try {
            await removeSpotify(item.id);
            items.value = items.value.filter(i => i.id !== item.id);
            SwalService.success('Festival eliminado');
        } catch (e) {
            console.error(e);
            SwalService.error('Error eliminando festival');
        }
    }
}

// --- Lifecycle ---
onMounted(reload);

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.2);
}
</style>
