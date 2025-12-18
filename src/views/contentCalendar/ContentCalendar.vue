<template>
    <div class="flex h-screen overflow-hidden bg-gray-50">
        <!-- Backlog Panel -->
        <div class="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            <div class="p-4 border-b border-gray-200">
                <h2 class="text-lg font-bold text-gray-900">Backlog de Eventos</h2>
                <button @click="showCreateModal = true"
                    class="mt-3 w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md">
                    + Nuevo Evento
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-4 space-y-3" ref="backlogContainerRef">
                <div v-for="content in backlogItems" :key="content.id"
                    :data-event='JSON.stringify({ title: content.name, id: content.id, extendedProps: { author: content.author } })'
                    class="fc-event p-4 bg-white border-2 rounded-lg cursor-move hover:shadow-lg transition-all"
                    :class="[
                        getContentTypeClass(content.type),
                        showOnlyMyEvents && content.author?.id === authStore.userId ? 'ring-2 ring-red-500 ring-offset-2' : '',
                        showOnlyMyEvents && content.author?.id !== authStore.userId ? 'opacity-30 grayscale' : ''
                    ]"
                    @click="openEditModal(content)">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-xs font-semibold px-2 py-1 rounded"
                                    :class="getContentTypeBadge(content.type)">
                                    {{ getContentTypeLabel(content.type) }}
                                </span>
                            </div>
                            <h3 class="font-bold text-base text-gray-900 mb-2">{{ content.name }}</h3>
                            <p v-if="content.notes" class="text-sm text-gray-600 mb-3 line-clamp-2">{{ content.notes }}
                            </p>

                            <!-- Author info -->
                            <div v-if="content.author"
                                class="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                                <img v-if="content.author.image" :src="content.author.image"
                                    :alt="content.author.username" class="w-6 h-6 rounded-full object-cover" />
                                <span class="text-xs text-gray-500 font-medium">{{ content.author.username }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="backlogItems.length === 0" class="text-center py-8 text-gray-400">
                    <p class="text-sm">No hay eventos sin programar</p>
                </div>
            </div>
        </div>

        <!-- Calendar Panel -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <div class="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                <h1 class="text-xl font-bold text-gray-900">Calendario de Eventos</h1>
                <div class="flex gap-2">
                    <!-- Botón de filtro de usuario -->
                    <button v-if="authStore.userId" @click="toggleMyEventsFilter"
                        class="relative transition-all duration-300"
                        :class="showOnlyMyEvents ? '' : 'opacity-60 grayscale'"
                        :title="showOnlyMyEvents ? 'Mostrar todos los eventos' : 'Mostrar solo mis eventos'">
                        <div class="relative">
                            <img v-if="authStore.image" :src="authStore.image" 
                                :alt="authStore.username || 'Usuario'" 
                                class="w-10 h-10 rounded-full object-cover transition-all"
                                :class="showOnlyMyEvents ? 'ring-4 ring-indigo-600 ring-offset-2' : ''" />
                            <div v-else 
                                class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg"
                                :class="showOnlyMyEvents ? 'ring-4 ring-indigo-600 ring-offset-2' : ''">
                                {{ authStore.username?.charAt(0).toUpperCase() }}
                            </div>
                        </div>
                    </button>

                    <!-- Botón de leyenda -->
                    <button @click="showLegendModal = true"
                        class="w-10 h-10 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-600 font-bold text-lg transition-colors flex items-center justify-center"
                        title="Ver leyenda de colores">
                        ?
                    </button>
                </div>
            </div>

            <div class="flex-1 overflow-auto p-4">
                <div class="bg-white rounded-lg shadow-lg p-4">
                    <FullCalendar :options="calendarOptions" ref="calendarRef" />
                </div>
            </div>
        </div>

        <!-- Edit Content Modal -->
        <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="showEditModal = false">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-lg font-bold mb-4">Editar Contenido</h3>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select v-model="editingContent.type"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option value="article">Artículo</option>
                            <option value="photos">Fotos</option>
                            <option value="list">Spotify</option>
                            <option value="radar">Radar</option>
                            <option value="best">Mejores Discos</option>
                            <option value="video">Video</option>
                            <option value="meeting">Reunión</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input v-model="editingContent.name" type="text"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="Título del contenido" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea v-model="editingContent.notes"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2" rows="3"
                            placeholder="Descripción o notas..."></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Publicación</label>
                        <input v-model="editingContent.publicationDate" type="date"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2" />
                        <button v-if="editingContent.publicationDate && editingContent.type !== 'meeting'"
                            @click="editingContent.publicationDate = ''"
                            class="text-xs text-gray-500 hover:text-gray-700 mt-1">
                            Quitar fecha (mover a backlog)
                        </button>
                        <p v-if="editingContent.type === 'meeting'" class="text-xs text-amber-600 mt-1">
                            ⚠️ Las reuniones requieren fecha obligatoria
                        </p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                        <select v-model="editingContent.authorId"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option value="">Seleccionar autor...</option>
                            <option v-for="user in rvUsers" :key="user.id" :value="user.id">
                                {{ user.username }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="flex justify-between items-center mt-6">
                    <button @click="handleDeleteContent"
                        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        🗑️ Eliminar
                    </button>
                    <div class="flex gap-2">
                        <button @click="showEditModal = false"
                            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                            Cancelar
                        </button>
                        <button @click="handleUpdateContent"
                            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create Content Modal -->
        <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="showCreateModal = false">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-lg font-bold mb-4">Nuevo Contenido</h3>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select v-model="newContent.type" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option value="article">Artículo</option>
                            <option value="photos">Fotos</option>
                            <option value="list">Spotify</option>
                            <option value="radar">Radar</option>
                            <option value="best">Mejores Discos</option>
                            <option value="video">Video</option>
                            <option value="meeting">Reunión</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input v-model="newContent.name" type="text"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="Título del contenido" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea v-model="newContent.notes" class="w-full border border-gray-300 rounded-lg px-3 py-2"
                            rows="3" placeholder="Descripción o notas..."></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                        <select v-model="newContent.authorId"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option value="">Seleccionar autor...</option>
                            <option v-for="user in rvUsers" :key="user.id" :value="user.id">
                                {{ user.username }}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de Publicación
                            <span v-if="newContent.type === 'meeting'" class="text-red-600">*</span>
                        </label>
                        <input v-model="newContent.publicationDate" type="date"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2"
                            :class="{ 'border-red-500': newContent.type === 'meeting' && !newContent.publicationDate }" />
                        <p v-if="newContent.type === 'meeting'" class="text-xs text-gray-500 mt-1">
                            Las reuniones requieren una fecha obligatoria
                        </p>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                    <button @click="showCreateModal = false"
                        class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                        Cancelar
                    </button>
                    <button @click="handleCreateContent"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        Crear
                    </button>
                </div>
            </div>
        </div>

        <!-- Event Actions Modal -->
        <div v-if="showActionsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="showActionsModal = false">
            <div class="bg-white rounded-lg p-6 w-full max-w-sm">
                <h3 class="text-lg font-bold mb-4">{{ selectedContent?.name }}</h3>

                <div class="space-y-3">
                    <button v-if="selectedContent?.type === 'meeting'" @click="goToReunions"
                        class="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2">
                        <span>📅</span>
                        <span>Ir a Reuniones</span>
                    </button>

                    <button @click="editFromActions"
                        class="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
                        <span>✏️</span>
                        <span>Editar Evento</span>
                    </button>

                    <button @click="confirmDeleteContent"
                        class="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-trash"></i>
                        <span>Eliminar Evento</span>
                    </button>

                    <button @click="showActionsModal = false"
                        class="w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="cancelDeleteContent">
            <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <i class="fa-solid fa-trash text-red-600 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-900">Eliminar Evento</h3>
                        <p class="text-sm text-gray-600">Esta acción no se puede deshacer</p>
                    </div>
                </div>
                <p class="text-gray-700 mb-6">¿Estás seguro de que deseas eliminar el evento "<strong>{{ contentToDelete?.name }}</strong>"?</p>
                <div class="flex justify-end gap-3">
                    <button @click="cancelDeleteContent"
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button @click="executeDeleteContent"
                        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                        <i class="fa-solid fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        </div>

        <!-- Legend Modal -->
        <div v-if="showLegendModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="showLegendModal = false">
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
                    <button @click="showLegendModal = false"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import type { ContentType, Content } from '@services/contents/contents';
import { getContents, createContent as createContentAPI, updateContent, deleteContent, getContentsByMonth } from '@services/contents/contents';
import { useAuthStore } from '@stores/auth/auth';
import { getRvUsers } from '@services/users/users';
import { postReunion } from '@services/reunions/reunions';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const showOnlyMyEvents = ref(false);

// Debug: verificar que el usuario está cargado
console.log('ContentCalendar - authStore:', { userId: authStore.userId, username: authStore.username });
const router = useRouter();
const calendarRef = ref<InstanceType<typeof FullCalendar>>();
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showActionsModal = ref(false);
const showLegendModal = ref(false);
const showDeleteModal = ref(false);
const selectedContent = ref<Content | null>(null);
const contentToDelete = ref<Content | null>(null);
const allContents = ref<Content[]>([]);
const editingContentId = ref<string | null>(null);
const rvUsers = ref<any[]>([]);
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1); // 1-12
const backlogContainerRef = ref<HTMLElement | null>(null);

const newContent = ref({
    type: 'article' as ContentType,
    name: '',
    notes: '',
    publicationDate: '',
    authorId: ''
});

const editingContent = ref({
    type: 'article' as ContentType,
    name: '',
    notes: '',
    publicationDate: '',
    authorId: ''
});

// Backlog items (content without publicationDate)
const backlogItems = computed(() => {
    return allContents.value
        .filter(c => !c.publicationDate)
        .sort((a, b) => {
            // Primero ordenar por usuario: 'riff valley' primero
            const aIsRiffValley = a.author?.username?.toLowerCase() === 'riff valley';
            const bIsRiffValley = b.author?.username?.toLowerCase() === 'riff valley';

            if (aIsRiffValley && !bIsRiffValley) return -1;
            if (!aIsRiffValley && bIsRiffValley) return 1;

            // Si ambos son o no son 'riff valley', ordenar alfabéticamente por nombre
            return (a.name || '').localeCompare(b.name || '');
        });
});

// Calendar events (content with publicationDate)
const calendarEvents = computed(() => {
    return allContents.value
        .filter(c => c.publicationDate)
        .map(c => ({
            id: c.id,
            title: c.name,
            date: c.publicationDate,
            backgroundColor: getContentTypeColor(c.type).bg,
            borderColor: getContentTypeColor(c.type).border,
            extendedProps: {
                contentType: c.type,
                notes: c.notes,
                author: c.author
            }
        }));
});

const calendarOptions = ref({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'es',
    firstDay: 1, // Empezar en lunes
    height: 'auto',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth'
    },
    dayHeaderFormat: { weekday: 'short' as const }, // Mostrar días de la semana (Lun, Mar, Mié, etc.)
    editable: true,
    droppable: true,
    events: calendarEvents,
    datesSet: (dateInfo: any) => {
        // When calendar view changes (month navigation)
        const viewDate = new Date(dateInfo.view.currentStart);
        const newYear = viewDate.getFullYear();
        const newMonth = viewDate.getMonth() + 1;

        // Only load if month/year changed
        if (newYear !== currentYear.value || newMonth !== currentMonth.value) {
            currentYear.value = newYear;
            currentMonth.value = newMonth;
            loadContentsByMonth(newYear, newMonth);
        }
    },
    eventContent: (arg: any) => {
        const author = arg.event.extendedProps.author;
        const isMyEvent = authStore.userId && author?.id === authStore.userId;
        const shouldDim = showOnlyMyEvents.value && !isMyEvent;
        const shouldHighlight = showOnlyMyEvents.value && isMyEvent;
        
        const container = document.createElement('div');
        container.className = `flex items-center gap-1.5 p-1 overflow-hidden transition-all ${shouldDim ? 'opacity-30' : 'opacity-100'}`;
        
        // Add red border to my events when filter is active
        if (shouldHighlight) {
            container.style.border = '2px solid #ef4444';
            container.style.borderRadius = '4px';
            container.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.2)';
        }

        if (author?.image) {
            const img = document.createElement('img');
            img.src = author.image;
            img.alt = author.username;
            img.className = 'w-5 h-5 rounded-full object-cover flex-shrink-0';
            container.appendChild(img);
        }

        const textContainer = document.createElement('div');
        textContainer.className = 'flex-1 min-w-0';

        const title = document.createElement('div');
        title.className = 'font-semibold text-xs truncate';
        title.textContent = arg.event.title;
        textContainer.appendChild(title);

        if (author?.username) {
            const authorName = document.createElement('div');
            authorName.className = 'text-[10px] opacity-75 truncate';
            authorName.textContent = author.username;
            textContainer.appendChild(authorName);
        }

        container.appendChild(textContainer);

        return { domNodes: [container] };
    },
    eventClick: (info: any) => {
        const contentId = info.event.id;
        const content = allContents.value.find(c => c.id === contentId);
        if (content) {
            selectedContent.value = content;
            showActionsModal.value = true;
        }
    },
    drop: async (info: any) => {
        // info.draggedEl contains the element that was dropped
        // info.dateStr contains the date where it was dropped
        // The event data comes from data-event attribute correctly parsed by Draggable

        // We can get the ID from the event definition created by Draggable
        // info.event is NOT available in drop callback directly like this for external events initial drop depending on config,
        // but let's check what Draggable provides.
        // Actually, with Draggable, FullCalendar creates an event instance.

        // However, we want to handle the API update.
        // The easiest way with Draggable + parsed data-event is relying on 'eventReceive' if we want the event object,
        // or parsing the element yourself in 'drop'.

        // Let's rely on parsing the data-event attribute from the dragged element for simplicity and consistency with previous logic
        const eventData = JSON.parse(info.draggedEl.getAttribute('data-event'));
        const contentId = eventData.id;

        if (contentId) {
            await handleDropToCalendar(contentId, info.dateStr);
            // We don't need to manually remove the element, Vue's reactivity will handle it 
            // when loadBacklogContents() is called and the item gains a date.
            // But if FullCalendar adds the event automatically, we might have duplication until refresh.
            // 'droppable: true' makes FC render the event immediately.
            // We'll let the refresh syncing handle the final state.
            info.draggedEl.parentNode?.removeChild(info.draggedEl);
        }
    },
    eventDrop: async (info: any) => {
        const contentId = info.event.id;
        const newDate = info.event.startStr;
        await handleDropToCalendar(contentId, newDate);
    },
    eventDragStop: async (info: any) => {
        const jsEvent = info.jsEvent;
        const content = allContents.value.find(c => c.id === info.event.id);

        // Prevent meetings from being moved to backlog
        if (content?.type === 'meeting') {
            // Check if dropped on backlog
            if (backlogContainerRef.value) {
                const backlogRect = backlogContainerRef.value.getBoundingClientRect();
                if (
                    jsEvent.clientX >= backlogRect.left &&
                    jsEvent.clientX <= backlogRect.right &&
                    jsEvent.clientY >= backlogRect.top &&
                    jsEvent.clientY <= backlogRect.bottom
                ) {
                    // Revert the drag - meetings cannot go to backlog
                    info.revert();
                    alert('Las reuniones no pueden moverse al backlog. La fecha es obligatoria.');
                    return;
                }
            }
        }

        // Check if dropped on backlog (for non-meeting content)
        if (backlogContainerRef.value) {
            const backlogRect = backlogContainerRef.value.getBoundingClientRect();
            // Check collision with backlog container
            if (
                jsEvent.clientX >= backlogRect.left &&
                jsEvent.clientX <= backlogRect.right &&
                jsEvent.clientY >= backlogRect.top &&
                jsEvent.clientY <= backlogRect.bottom
            ) {
                const contentId = info.event.id;
                // Remove visual event immediately to prevent revert animation
                info.event.remove();
                await handleDropToCalendar(contentId, null as any); // Send null to move to backlog
            }
        }
    }
});

function getContentTypeLabel(type: ContentType): string {
    const labels: Record<ContentType, string> = {
        article: 'Artículo',
        photos: 'Fotos',
        list: 'Spotify',
        radar: 'Radar',
        best: 'Mejores Discos',
        video: 'Video',
        meeting: 'Reunión'
    };
    return labels[type];
}

function getContentTypeBadge(type: ContentType): string {
    const badges: Record<ContentType, string> = {
        article: 'bg-blue-100 text-blue-800',
        photos: 'bg-pink-100 text-pink-800',
        list: 'bg-lime-100 text-lime-800',
        radar: 'bg-yellow-100 text-yellow-800',
        best: 'bg-red-100 text-red-800',
        video: 'bg-violet-100 text-violet-800',
        meeting: 'bg-orange-100 text-orange-800'
    };
    return badges[type];
}

function getContentTypeClass(type: ContentType): string {
    const classes: Record<ContentType, string> = {
        article: 'border-blue-200 hover:border-blue-400',
        photos: 'border-pink-200 hover:border-pink-400',
        list: 'border-lime-200 hover:border-lime-400',
        radar: 'border-yellow-200 hover:border-yellow-400',
        best: 'border-red-200 hover:border-red-400',
        video: 'border-violet-200 hover:border-violet-400',
        meeting: 'border-orange-200 hover:border-orange-400'
    };
    return classes[type];
}

function getContentTypeColor(type: ContentType) {
    const colors: Record<ContentType, { bg: string; border: string }> = {
        article: { bg: '#3b82f6', border: '#2563eb' },     // Azul
        photos: { bg: '#ec4899', border: '#db2777' },      // Rosa/Magenta
        list: { bg: '#22c55e', border: '#16a34a' },        // Verde Lima
        radar: { bg: '#f59e0b', border: '#d97706' },       // Amarillo/Ámbar
        best: { bg: '#ef4444', border: '#dc2626' },        // Rojo
        video: { bg: '#8b5cf6', border: '#7c3aed' },       // Violeta
        meeting: { bg: '#f97316', border: '#ea580c' }      // Naranja
    };
    return colors[type];
}

// function handleDragStart(event: DragEvent, content: Content) {
//     if (event.dataTransfer) {
//         event.dataTransfer.effectAllowed = 'move';
//         event.dataTransfer.setData('text/plain', content.id);
//     }
// }

async function handleDropToCalendar(contentId: string, dateStr: string | null) {
    try {
        await updateContent(contentId, { publicationDate: dateStr });
        // Reload both backlog and current month
        await loadBacklogContents();
        await loadContentsByMonth(currentYear.value, currentMonth.value);
        // No need to manually update events - calendarEvents is reactive
    } catch (error) {
        console.error('Error updating content date:', error);
    }
}

async function handleCreateContent() {
    if (!newContent.value.name || !newContent.value.authorId) return;

    // Validate that meetings have a publication date
    if (newContent.value.type === 'meeting' && !newContent.value.publicationDate) {
        alert('Las reuniones requieren una fecha de publicación obligatoria');
        return;
    }

    try {
        let reunionId: string | undefined = undefined;

        // If it's a meeting, create the reunion FIRST and get its ID
        if (newContent.value.type === 'meeting' && newContent.value.publicationDate) {
            try {
                const createdReunion = await postReunion({
                    title: newContent.value.name,
                    description: newContent.value.notes || '',
                    date: newContent.value.publicationDate
                });
                reunionId = createdReunion.id;
            } catch (reunionError) {
                console.error('Error creating reunion:', reunionError);
                alert('Error al crear la reunión. Por favor, intenta de nuevo.');
                return; // Stop content creation if reunion fails
            }
        }

        // Now create the content with the reunionId if it's a meeting
        await createContentAPI({
            type: newContent.value.type,
            name: newContent.value.name,
            notes: newContent.value.notes || undefined,
            publicationDate: newContent.value.publicationDate || undefined,
            reunionId: reunionId,
            authorId: newContent.value.authorId
        });

        newContent.value = {
            type: 'article',
            name: '',
            notes: '',
            publicationDate: '',
            authorId: ''
        };
        showCreateModal.value = false;
        // Reload backlog since new content might be created without date
        await loadBacklogContents();
        // Also reload current month to preserve scheduled events
        await loadContentsByMonth(currentYear.value, currentMonth.value);
    } catch (error) {
        console.error('Error creating content:', error);
        alert('Error al crear el contenido. Por favor, intenta de nuevo.');
    }
}

function openEditModal(content: Content) {
    editingContentId.value = content.id;
    editingContent.value = {
        type: content.type,
        name: content.name,
        notes: content.notes || '',
        publicationDate: content.publicationDate || '',
        authorId: content.author?.id || content.authorId || ''
    };
    showEditModal.value = true;
}

function toggleMyEventsFilter() {
    showOnlyMyEvents.value = !showOnlyMyEvents.value;
    // Force calendar to re-render by triggering reactivity
    allContents.value = [...allContents.value];
}

function goToReunions() {
    showActionsModal.value = false;
    router.push('/reunions');
}

function editFromActions() {
    if (selectedContent.value) {
        showActionsModal.value = false;
        openEditModal(selectedContent.value);
    }
}

function confirmDeleteContent() {
    contentToDelete.value = selectedContent.value;
    showActionsModal.value = false;
    showDeleteModal.value = true;
}

function cancelDeleteContent() {
    showDeleteModal.value = false;
    contentToDelete.value = null;
}

async function executeDeleteContent() {
    if (!contentToDelete.value) return;
    
    try {
        await deleteContent(contentToDelete.value.id);
        // Remove from local state
        allContents.value = allContents.value.filter(c => c.id !== contentToDelete.value!.id);
        showDeleteModal.value = false;
        contentToDelete.value = null;
        // Reload data
        await loadBacklogContents();
        await loadContentsByMonth(currentYear.value, currentMonth.value);
    } catch (error) {
        console.error('Error deleting content:', error);
        alert('No se pudo eliminar el evento');
    }
}

async function handleUpdateContent() {
    if (!editingContentId.value || !editingContent.value.name || !editingContent.value.authorId) return;

    // Validate that meetings always have a date
    if (editingContent.value.type === 'meeting' && !editingContent.value.publicationDate) {
        alert('Las reuniones requieren una fecha de publicación obligatoria');
        return;
    }

    try {
        await updateContent(editingContentId.value, {
            type: editingContent.value.type,
            name: editingContent.value.name,
            notes: editingContent.value.notes || undefined,
            publicationDate: editingContent.value.publicationDate || null,
            authorId: editingContent.value.authorId
        });

        showEditModal.value = false;
        editingContentId.value = null;
        // Reload both backlog and current month
        await loadBacklogContents();
        await loadContentsByMonth(currentYear.value, currentMonth.value);
    } catch (error) {
        console.error('Error updating content:', error);
    }
}

async function handleDeleteContent() {
    if (!editingContentId.value) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este contenido?')) return;

    try {
        await deleteContent(editingContentId.value);

        showEditModal.value = false;
        editingContentId.value = null;
        // Reload both backlog and current month
        await loadBacklogContents();
        await loadContentsByMonth(currentYear.value, currentMonth.value);
    } catch (error) {
        console.error('Error deleting content:', error);
    }
}

async function loadRvUsers() {
    try {
        rvUsers.value = await getRvUsers();
        // Set default author to current user if available
        if (authStore.userId && !newContent.value.authorId) {
            newContent.value.authorId = authStore.userId;
        }
    } catch (error) {
        console.error('Error loading RV users:', error);
    }
}

async function loadContentsByMonth(year: number, month: number) {
    try {
        const monthContents = await getContentsByMonth(year, month);

        // Keep backlog items (no publicationDate) and add new month contents
        const backlogItems = allContents.value.filter(c => !c.publicationDate);
        const scheduledItems = monthContents.filter(c => c.publicationDate);

        allContents.value = [...backlogItems, ...scheduledItems];
    } catch (error) {
        console.error('Error loading contents by month:', error);
    }
}

async function loadBacklogContents() {
    try {
        // Load all contents to get backlog items (those without publicationDate)
        const allData = await getContents();
        const backlog = allData.filter(c => !c.publicationDate);
        // Ensure allContents only contains backlog items before merging with month contents
        // This prevents duplication if loadContentsByMonth is called right after
        allContents.value = backlog;
    } catch (error) {
        console.error('Error loading backlog contents:', error);
    }
}

onMounted(async () => {
    await loadRvUsers();
    // Load backlog first
    await loadBacklogContents();
    // Then load current month's scheduled content
    await loadContentsByMonth(currentYear.value, currentMonth.value);

    // Initialize Draggable
    if (backlogContainerRef.value) {
        new Draggable(backlogContainerRef.value, {
            itemSelector: '.fc-event',
            eventData: function (eventEl) {
                return JSON.parse(eventEl.getAttribute('data-event') || '{}');
            }
        });
    }
});
</script>

<style scoped>
:deep(.fc) {
    font-family: inherit;
}

:deep(.fc-toolbar-title) {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
}

:deep(.fc-button) {
    background-color: #6366f1 !important;
    border-color: #6366f1 !important;
    text-transform: capitalize;
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
}

:deep(.fc-button:hover) {
    background-color: #4f46e5 !important;
    border-color: #4f46e5 !important;
}

:deep(.fc-button-active) {
    background-color: #4338ca !important;
    border-color: #4338ca !important;
}

:deep(.fc-daygrid-day-number) {
    color: #374151;
    font-weight: 600;
    font-size: 0.875rem;
}

:deep(.fc-day-today) {
    background-color: #fef3c7 !important;
}

:deep(.fc-event) {
    cursor: pointer;
    border-radius: 4px;
    padding: 4px;
    font-size: 0.75rem;
    min-height: 40px;
}

:deep(.fc-event:hover) {
    opacity: 0.85;
    transform: scale(1.02);
    transition: all 0.2s;
}

:deep(.fc-daygrid-day-frame) {
    min-height: 100px;
}
</style>
