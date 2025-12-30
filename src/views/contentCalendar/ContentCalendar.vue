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
                    class="fc-event p-4 bg-white border-2 rounded-lg cursor-move hover:shadow-lg transition-all" :class="[
                        getContentTypeClass(content.type),
                        showOnlyMyEvents && content.author?.id === authStore.userId ? 'ring-2 ring-red-500 ring-offset-2' : '',
                        showOnlyMyEvents && content.author?.id !== authStore.userId ? 'opacity-30 grayscale' : ''
                    ]" @click="openEditModal(content)">
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
                            <img v-if="authStore.image" :src="authStore.image" :alt="authStore.username || 'Usuario'"
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
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
                            :disabled="editingContent.type === 'spotify'">
                            <option value="article">Artículo</option>
                            <option value="photos">Fotos</option>
                            <option value="radar">Radar</option>
                            <option value="best">Mejores Discos</option>
                            <option value="video">Video</option>
                            <option value="reunion">Reunión</option>
                            <option value="spotify" v-if="editingContent.type === 'spotify'">Spotify</option>
                        </select>
                        <p v-if="editingContent.type === 'spotify'" class="text-xs text-gray-500 mt-1">
                            El tipo de contenido no se puede cambiar para listas de Spotify.
                        </p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input v-model="editingContent.name" type="text"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
                            :disabled="editingContent.type === 'spotify'" placeholder="Título del contenido" />
                        <p v-if="editingContent.type === 'spotify'" class="text-xs text-gray-500 mt-1">
                            El nombre no se puede editar para listas de Spotify.
                        </p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea v-model="editingContent.notes"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2" rows="3"
                            placeholder="Descripción o notas..."></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Publicación</label>
                        <input v-model="editingContent.publicationDate" type="datetime-local"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2" />
                        <button
                            v-if="editingContent.publicationDate && !['reunion', 'radar', 'best'].includes(editingContent.type)"
                            @click="editingContent.publicationDate = ''"
                            class="text-xs text-gray-500 hover:text-gray-700 mt-1">
                            Quitar fecha (mover a backlog)
                        </button>
                        <p v-if="['reunion', 'radar', 'best'].includes(editingContent.type)"
                            class="text-xs text-amber-600 mt-1">
                            ⚠️ Este tipo de contenido requiere fecha obligatoria
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
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h3 class="text-lg font-bold mb-4">Nuevo Contenido</h3>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select v-model="newContent.type" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option value="article">Artículo</option>
                            <option value="photos">Fotos</option>
                            <option value="radar">Radar</option>
                            <option value="best">Mejores Discos</option>
                            <option value="video">Video</option>
                            <option value="reunion">Reunión</option>
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

                    <!-- Radar: Year + Month + Week selectors -->
                    <div v-if="newContent.type === 'radar'" class="space-y-4">
                        <div class="grid grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Año <span class="text-red-600">*</span>
                                </label>
                                <select v-model="newContent.selectedYear" @change="handleYearChange"
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option :value="2025">2025</option>
                                    <option :value="2026">2026</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Mes <span class="text-red-600">*</span>
                                </label>
                                <select v-model="newContent.selectedMonth" @change="updateRadarListDate"
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option v-for="month in 12" :key="month" :value="month">
                                        {{ getMonthName(month) }}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Semana <span class="text-red-600">*</span>
                                </label>
                                <select v-model="newContent.selectedWeek" @change="updateRadarListDate"
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option
                                        v-for="week in getWeeksInMonth(newContent.selectedMonth, newContent.selectedYear)"
                                        :key="week" :value="week">
                                        Semana {{ week }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div v-if="newContent.listDate" class="text-sm text-gray-600">
                            📅 Fecha de lista: <strong>{{ formatDisplayDate(newContent.listDate) }}</strong>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Publicación <span class="text-red-600">*</span>
                                </label>
                                <input v-model="newContent.publicationDate" type="datetime-local"
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    :class="{ 'border-red-500': !newContent.publicationDate }" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha Cierre
                                </label>
                                <input v-model="newContent.closeDate" type="date"
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    :min="newContent.listDate" />
                            </div>
                        </div>
                    </div>

                    <!-- Best/Video: Year + Month selector -->
                    <div v-else-if="['best', 'video'].includes(newContent.type)" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Año <span class="text-red-600">*</span>
                                </label>
                                <select v-model="newContent.selectedYear" @change="handleYearChange"
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option :value="2025">2025</option>
                                    <option :value="2026">2026</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Mes <span class="text-red-600">*</span>
                                </label>
                                <select v-model="newContent.selectedMonth" @change="updateBestVideoListDate"
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option v-for="month in 12" :key="month" :value="month">
                                        {{ getMonthName(month) }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div v-if="newContent.listDate" class="text-sm text-gray-600">
                            📅 Fecha de lista: <strong>{{ formatDisplayDate(newContent.listDate) }}</strong> (día 15 del
                            mes)
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de Publicación <span v-if="newContent.type === 'best'"
                                    class="text-red-600">*</span>
                            </label>
                            <input v-model="newContent.publicationDate" type="datetime-local"
                                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                                :class="{ 'border-red-500': newContent.type === 'best' && !newContent.publicationDate }" />
                            <p v-if="newContent.type === 'best'" class="text-xs text-gray-500 mt-1">
                                Este tipo de contenido requiere una fecha obligatoria
                            </p>
                        </div>
                    </div>

                    <!-- Other types: Regular publication date -->
                    <div v-else>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de Publicación
                            <span v-if="newContent.type === 'reunion'" class="text-red-600">*</span>
                        </label>
                        <input v-model="newContent.publicationDate" type="datetime-local"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2"
                            :class="{ 'border-red-500': newContent.type === 'reunion' && !newContent.publicationDate }" />
                        <p v-if="newContent.type === 'reunion'" class="text-xs text-gray-500 mt-1">
                            Este tipo de contenido requiere una fecha obligatoria
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
        <div v-if="showActionsModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity"
            @click.self="showActionsModal = false">

            <!-- Modal Ampliado para Radar -->
            <div v-if="selectedContent?.type === 'radar'"
                class="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 flex flex-col max-h-[90vh]">
                <div class="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">{{ selectedContent?.name }}</h3>
                        <p class="text-gray-500 text-sm mt-1">Gestión de asignaciones y detalles</p>
                    </div>

                    <div class="flex items-center gap-4">
                        <div v-if="radarDetails"
                            class="flex items-center gap-2 bg-indigo-900/10 p-1 rounded-lg border border-indigo-500/20 mr-2">
                            <div class="flex items-center gap-2 px-3 py-1.5 bg-indigo-900/80 rounded-md text-white border border-indigo-500/30 shadow-sm"
                                title="Fecha Lista">
                                <i class="fa-regular fa-calendar text-indigo-300 text-xs"></i>
                                <input type="date" :value="formatRadarDate(radarDetails.listDate)"
                                    :min="radarMinListDate" :max="radarMaxListDate"
                                    @change="(e) => updateRadarField('listDate', (e.target as HTMLInputElement).value)"
                                    class="bg-transparent border-none p-0 text-white text-xs font-bold focus:ring-0 cursor-pointer w-[80px]" />
                            </div>
                            <div class="flex items-center gap-2 px-3 py-1.5 bg-indigo-900/80 rounded-md text-white border border-indigo-500/30 shadow-sm"
                                title="Fecha Cierre">
                                <i class="fa-regular fa-clock text-indigo-300 text-xs"></i>
                                <input type="date" :value="formatRadarDate(radarDetails.closeDate)"
                                    :min="radarMinCloseDate" :max="radarMaxCloseDate"
                                    @change="(e) => updateRadarField('closeDate', (e.target as HTMLInputElement).value)"
                                    class="bg-transparent border-none p-0 text-white text-xs font-bold focus:ring-0 cursor-pointer w-[80px]" />
                            </div>
                        </div>

                        <div v-if="radarDetails" class="relative">
                            <select v-model="radarDetails.status" @change="updateListStatus(radarDetails)"
                                :class="getStatusClass(radarDetails.status)"
                                class="appearance-none pl-4 pr-8 py-2 border rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors focus:ring-1 focus:ring-indigo-200 shadow-sm">
                                <option value="new" class="text-gray-900">Nueva</option>
                                <option value="assigned" class="text-gray-900">Asignada</option>
                                <option value="published" class="text-gray-900">Publicada</option>
                            </select>
                            <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none"
                                :class="radarDetails.status === 'new' ? 'text-red-100' : (radarDetails.status === 'assigned' ? 'text-orange-100' : 'text-green-100')"></i>
                        </div>

                        <button @click="showActionsModal = false"
                            class="text-gray-400 hover:text-gray-600 transition-colors">
                            <i class="fa-solid fa-xmark text-2xl"></i>
                        </button>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto mb-6 custom-scrollbar">
                    <div v-if="loadingRadarDetails" class="flex justify-center py-10">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>

                    <div v-else-if="radarDetails && radarDetails.asignations && radarDetails.asignations.length > 0">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b border-gray-200">
                                    <th class="py-3 px-4 text-sm font-semibold text-gray-600">Álbum / Artista</th>
                                    <th class="py-3 px-4 text-sm font-semibold text-gray-600 text-center">Acciones</th>
                                    <th class="py-3 px-4 text-sm font-semibold text-gray-600">Usuario</th>
                                    <th class="py-3 px-4 text-sm font-semibold text-gray-600 text-center">#</th>
                                    <th class="py-3 px-4 text-sm font-semibold text-gray-600 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="asig in radarDetails.asignations" :key="asig.id"
                                    class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                    <td class="py-3 px-4">
                                        <div class="flex flex-col">
                                            <span class="font-medium text-gray-800">{{ asig.disc?.name || 'Desconocido' }}</span>
                                            <span class="text-xs text-gray-500">{{ asig.disc?.artist?.name || 'Artista desconocido' }}</span>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <div class="flex items-center justify-center gap-2">
                                            <a v-if="asig.disc?.link" :href="asig.disc.link" target="_blank"
                                                class="w-8 h-8 flex items-center justify-center bg-gray-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                                                title="Spotify">
                                                <i class="fa-brands fa-spotify text-sm"></i>
                                            </a>
                                            <button
                                                @click="copyArtistAndDisc(asig.disc?.artist?.name || '', asig.disc?.name || '')"
                                                class="w-8 h-8 flex items-center justify-center bg-gray-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
                                                title="Copiar Info">
                                                <i class="fa-solid fa-clipboard text-sm"></i>
                                            </button>
                                            <button @click="copyToClipboard(asig.disc?.image || '')"
                                                class="w-8 h-8 flex items-center justify-center bg-gray-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                                title="Copiar Imagen">
                                                <i class="fa-solid fa-image text-sm"></i>
                                            </button>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4">
                                        <div class="flex items-center gap-2">
                                            <img v-if="asig.user?.image" :src="asig.user.image"
                                                class="w-6 h-6 rounded-full object-cover" />
                                            <div v-else
                                                class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {{ asig.user?.username?.charAt(0).toUpperCase() || '?' }}
                                            </div>
                                            <span class="text-sm text-gray-700">{{ asig.user?.username || 'Sin asignar'
                                            }}</span>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <span v-if="asig.position > 0"
                                            class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                                            {{ asig.position }}
                                        </span>
                                        <span v-else class="text-gray-400">-</span>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <label class="inline-flex items-center cursor-pointer">
                                            <input type="checkbox" :checked="asig.done" @change="toggleAsignation(asig)"
                                                class="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition duration-150 ease-in-out">
                                        </label>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div v-else class="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                        No hay asignaciones en esta lista.
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button @click="deleteRadarList"
                        class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2 transition-colors">
                        <i class="fa-solid fa-trash"></i>
                        Borrar Lista
                    </button>
                    <button @click="router.push(`/discos/radar/${selectedContent.list?.id}`)"
                        class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center gap-2 transition-colors">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        Ir al Detalle
                    </button>
                    <button @click="showActionsModal = false"
                        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>

            <!-- Modal Diseño Sutil para Fotos -->
            <div v-else-if="selectedContent?.type === 'photos'"
                class="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative overflow-hidden">
                <!-- Decorative background blob -->
                <div
                    class="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none">
                </div>

                <div class="relative z-10">
                    <!-- Header Actions -->
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex items-center gap-2">
                            <span
                                class="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-bold uppercase tracking-wider rounded-md">
                                Fotos
                            </span>
                        </div>
                        <button @click="showActionsModal = false"
                            class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                            <i class="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>

                    <!-- Main Content -->
                    <div class="space-y-6">
                        <!-- Title Input (Massive & Clean) -->
                        <div>
                            <input v-model="editingContent.name" type="text"
                                class="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent"
                                placeholder="Título del álbum..." />
                        </div>

                        <!-- Grid for Meta Info -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Left Column: Notes -->
                            <div class="space-y-4">
                                <div>
                                    <label
                                        class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notas</label>
                                    <textarea v-model="editingContent.notes"
                                        class="w-full border-0 bg-gray-50 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-pink-100 focus:bg-white transition-all resize-none text-sm leading-relaxed"
                                        rows="6"
                                        placeholder="Añade detalles sobre las fotos (ubicación, banda, fotógrafo...)"></textarea>
                                </div>
                            </div>

                            <!-- Right Column: Date & Author -->
                            <div class="space-y-6">
                                <div class="bg-gray-50 rounded-xl p-5 space-y-5">
                                    <!-- Date -->
                                    <div>
                                        <label
                                            class="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            <i class="fa-regular fa-calendar"></i> Fecha de Publicación
                                        </label>
                                        <input v-model="editingContent.publicationDate" type="datetime-local"
                                            class="w-full border-gray-200 rounded-lg text-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50" />
                                        <button v-if="editingContent.publicationDate"
                                            @click="editingContent.publicationDate = ''"
                                            class="text-xs text-gray-400 hover:text-pink-600 mt-2 flex items-center gap-1 transition-colors">
                                            <i class="fa-solid fa-arrow-rotate-left"></i> Mover a backlog
                                        </button>
                                    </div>

                                    <!-- Author -->
                                    <div>
                                        <label
                                            class="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            <i class="fa-regular fa-user"></i> Autor
                                        </label>
                                        <select v-model="editingContent.authorId"
                                            class="w-full border-gray-200 rounded-lg text-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50">
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
                        <button @click="confirmDeleteContent"
                            class="group flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                            title="Eliminar permanentemente">
                            <i class="fa-regular fa-trash-can text-lg group-hover:scale-110 transition-transform"></i>
                            <span class="text-sm font-medium">Eliminar</span>
                        </button>

                        <div class="flex gap-3">
                            <button @click="showActionsModal = false"
                                class="px-6 py-2.5 text-gray-600 hover:bg-gray-100 font-medium rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button @click="handleUpdateContent"
                                class="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 shadow-lg shadow-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            <!-- Modal para Reuniones -->
            <div v-else-if="selectedContent?.type === 'reunion'"
                class="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative overflow-hidden">
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
                        <button @click="showActionsModal = false"
                            class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                            <i class="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>

                    <!-- Main Content -->
                    <div class="space-y-6">
                        <!-- Title Input (Massive & Clean) -->
                        <div>
                            <input v-model="editingContent.name" type="text"
                                class="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent"
                                placeholder="Título de la reunión..." />
                            <button @click="goToReunions"
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
                                    <textarea v-model="editingContent.notes"
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
                                        <input v-model="editingContent.publicationDate" type="datetime-local"
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
                                        <select v-model="editingContent.authorId"
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
                        <button @click="confirmDeleteContent"
                            class="group flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                            title="Eliminar permanentemente">
                            <i class="fa-regular fa-trash-can text-lg group-hover:scale-110 transition-transform"></i>
                            <span class="text-sm font-medium">Eliminar</span>
                        </button>

                        <div class="flex gap-3">
                            <button @click="showActionsModal = false"
                                class="px-6 py-2.5 text-gray-600 hover:bg-gray-100 font-medium rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button @click="handleUpdateContent"
                                class="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 shadow-lg shadow-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Normal para otros tipos -->
            <div v-else class="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
                <h3 class="text-lg font-bold mb-4">{{ selectedContent?.name }}</h3>

                <div class="space-y-3">
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
                <p class="text-gray-700 mb-6">¿Estás seguro de que deseas eliminar el evento "<strong>{{
                    contentToDelete?.name }}</strong>"?</p>
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
import { ref, onMounted, computed, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import type { ContentType, Content } from '@services/contents/contents';
import { getContents, createContent as createContentAPI, updateContent, deleteContent, getContentsByMonth } from '@services/contents/contents';
import { useAuthStore } from '@stores/auth/auth';
import { getRvUsers } from '@services/users/users';
import SwalService from '@services/swal/SwalService';
import { updateAsignationService } from '@services/asignation/asignation';
import { deleteList, getListDetails, updateList } from '@services/list/list';

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

const radarDetails = ref<any>(null);
const loadingRadarDetails = ref(false);

const newContent = ref({
    type: 'article' as ContentType,
    name: '',
    notes: '',
    publicationDate: '',
    closeDate: '',
    authorId: '',
    listDate: '',
    selectedMonth: new Date().getMonth() + 1,
    selectedWeek: 1,
    selectedYear: new Date().getFullYear()
});

const minListDate = computed(() => {
    if (!newContent.value.publicationDate) return undefined;
    // Lunes de la semana actual
    const d = new Date(newContent.value.publicationDate);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    // day: 0 (Sun) to 6 (Sat)
    // Monday is 1
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
});

const maxListDate = computed(() => {
    if (!newContent.value.publicationDate) return undefined;
    // Próximo domingo
    const d = new Date(newContent.value.publicationDate);
    const day = d.getDay();
    const diff = day === 0 ? 0 : 7 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
});

const minCloseDate = computed(() => {
    if (!newContent.value.publicationDate) return undefined;
    // Close date can be the same as list date
    const d = new Date(newContent.value.publicationDate);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
});

const maxCloseDate = computed(() => {
    if (!newContent.value.publicationDate) return undefined;
    // Miércoles siguiente
    const d = new Date(newContent.value.publicationDate);
    const day = d.getDay();
    const diffToSunday = day === 0 ? 0 : 7 - day;
    d.setDate(d.getDate() + diffToSunday);

    // Ahora sumamos 3 días para llegar al miércoles
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
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
            start: c.publicationDate,
            end: c.closeDate ? new Date(new Date(c.closeDate).setDate(new Date(c.closeDate).getDate() + 1)).toISOString().split('T')[0] : undefined,
            backgroundColor: getContentTypeColor(c.type).bg,
            borderColor: getContentTypeColor(c.type).border,
            extendedProps: {
                contentType: c.type,
                notes: c.notes,
                author: c.author,
                list: c.list
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
        const notes = arg.event.extendedProps.notes || '';
        const isMyEvent = authStore.userId && author?.id === authStore.userId;
        const shouldDim = showOnlyMyEvents.value && !isMyEvent;
        const shouldHighlight = showOnlyMyEvents.value && isMyEvent;

        const container = document.createElement('div');
        container.className = `flex items-center gap-1.5 p-1 overflow-hidden transition-all ${shouldDim ? 'opacity-30' : 'opacity-100'}`;
        // Add native tooltip with notes
        if (notes) {
            container.title = notes;
        }

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
    eventClick: async (info: any) => {
        const contentId = info.event.id;
        const content = allContents.value.find(c => c.id === contentId);
        if (content) {
            selectedContent.value = content;
            showActionsModal.value = true;

            // Pre-fill editing content for photos and reunions for the direct modal
            if (content.type === 'photos' || content.type === 'reunion') {
                editingContentId.value = content.id;
                editingContent.value = {
                    type: content.type,
                    name: content.name,
                    notes: content.notes || '',
                    publicationDate: toDatetimeLocal(content.publicationDate || ''),
                    authorId: content.author?.id || ''
                };
            }

            if (content.type === 'radar' && content.list?.id) {
                loadingRadarDetails.value = true;
                try {
                    const details = await getListDetails(content.list.id);
                    if (details && details.asignations) {
                        details.asignations.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
                    }
                    radarDetails.value = details;
                } catch (e) {
                    console.error('Error loading radar details', e);
                    SwalService.error('Error cargando detalles de la lista');
                } finally {
                    loadingRadarDetails.value = false;
                }
            } else {
                radarDetails.value = null;
            }
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

        // Check for Radar lock: if radar has asignations, prevent move
        const extendedProps = info.event.extendedProps;
        if (extendedProps.contentType === 'radar' && extendedProps.list?.asignations?.length > 0) {
            info.revert();
            SwalService.error('No se puede mover un Radar que ya tiene asignaciones.');
            return;
        }

        await handleDropToCalendar(contentId, newDate);
    },
    eventDragStop: async (info: any) => {
        const jsEvent = info.jsEvent;
        const content = allContents.value.find(c => c.id === info.event.id);

        // Prevent mandatory date types from being moved to backlog
        const mandatoryDateTypes = ['reunion', 'radar', 'best'];
        if (content && mandatoryDateTypes.includes(content.type)) {
            // Check if dropped on backlog
            if (backlogContainerRef.value) {
                const backlogRect = backlogContainerRef.value.getBoundingClientRect();
                if (
                    jsEvent.clientX >= backlogRect.left &&
                    jsEvent.clientX <= backlogRect.right &&
                    jsEvent.clientY >= backlogRect.top &&
                    jsEvent.clientY <= backlogRect.bottom
                ) {
                    // Revert the drag - these types cannot go to backlog
                    info.revert();
                    SwalService.error(`El contenido tipo "${getContentTypeLabel(content.type)}" requiere fecha obligatoria y no puede volver al backlog.`);
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
        spotify: 'Spotify',
        radar: 'Radar',
        best: 'Mejores Discos',
        video: 'Video',
        reunion: 'Reunión'
    };
    return labels[type];
}

function getContentTypeBadge(type: ContentType): string {
    const badges: Record<ContentType, string> = {
        article: 'bg-blue-100 text-blue-800',
        photos: 'bg-pink-100 text-pink-800',
        spotify: 'bg-lime-100 text-lime-800',
        radar: 'bg-yellow-100 text-yellow-800',
        best: 'bg-red-100 text-red-800',
        video: 'bg-violet-100 text-violet-800',
        reunion: 'bg-orange-100 text-orange-800'
    };
    return badges[type];
}

function getContentTypeClass(type: ContentType): string {
    const classes: Record<ContentType, string> = {
        article: 'border-blue-200 hover:border-blue-400',
        photos: 'border-pink-200 hover:border-pink-400',
        spotify: 'border-lime-200 hover:border-lime-400',
        radar: 'border-yellow-200 hover:border-yellow-400',
        best: 'border-red-200 hover:border-red-400',
        video: 'border-violet-200 hover:border-violet-400',
        reunion: 'border-orange-200 hover:border-orange-400'
    };
    return classes[type];
}

function getContentTypeColor(type: ContentType) {
    const colors: Record<ContentType, { bg: string; border: string }> = {
        article: { bg: '#3b82f6', border: '#2563eb' },     // Azul
        photos: { bg: '#ec4899', border: '#db2777' },      // Rosa/Magenta
        spotify: { bg: '#22c55e', border: '#16a34a' },        // Verde Lima
        radar: { bg: '#f59e0b', border: '#d97706' },       // Amarillo/Ámbar
        best: { bg: '#ef4444', border: '#dc2626' },        // Rojo
        video: { bg: '#8b5cf6', border: '#7c3aed' },       // Violeta
        reunion: { bg: '#f97316', border: '#ea580c' }      // Naranja
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

    // Validate mandatory date types
    const mandatoryDateTypes = ['reunion', 'radar', 'best'];
    if (mandatoryDateTypes.includes(newContent.value.type) && !newContent.value.publicationDate) {
        alert(`El contenido tipo "${getContentTypeLabel(newContent.value.type)}" requiere una fecha de publicación obligatoria`);
        return;
    }

    try {
        // Create the content directly without creating a separate reunion entity first
        await createContentAPI({
            type: newContent.value.type,
            name: newContent.value.name,
            notes: newContent.value.notes || undefined,
            publicationDate: newContent.value.publicationDate ? new Date(newContent.value.publicationDate).toISOString() : undefined,
            closeDate: newContent.value.closeDate || undefined,
            authorId: newContent.value.authorId,
            listDate: newContent.value.listDate || undefined
        });

        newContent.value = {
            type: 'article',
            name: '',
            notes: '',
            publicationDate: '',
            closeDate: '',
            authorId: '',
            listDate: '',
            selectedMonth: new Date().getMonth() + 1,
            selectedWeek: 1,
            selectedYear: new Date().getFullYear()
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
        publicationDate: toDatetimeLocal(content.publicationDate || ''),
        authorId: content.author?.id || ''
    };

    if (content.type === 'photos') {
        selectedContent.value = content;
        showActionsModal.value = true;
    } else {
        showEditModal.value = true;
    }
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

async function toggleAsignation(asig: any) {
    const newState = !asig.done;
    // Optimistic UI update
    asig.done = newState;

    try {
        await updateAsignationService(asig.id, { done: newState });
    } catch (e) {
        console.error('Error updating asignation', e);
        asig.done = !newState; // Revert
        SwalService.error('Error actualizando el estado de la asignación');
    }
}

async function deleteRadarList() {
    if (!selectedContent.value?.list?.id) return;

    const result = await SwalService.confirm(
        '¿Eliminar Lista?',
        'Estás a punto de eliminar la lista asociada a este radar. Esta acción no se puede deshacer.',
        'warning'
    );

    if (result.isConfirmed) {
        try {
            await deleteList(selectedContent.value.list.id);
            SwalService.success('Lista eliminada correctamente');
            showActionsModal.value = false;
            // Reload calendar
            await loadContentsByMonth(currentYear.value, currentMonth.value);
        } catch (e) {
            console.error(e);
            SwalService.error('Error eliminando la lista');
        }
    }
}

async function handleUpdateContent() {
    if (!editingContentId.value || !editingContent.value.name || !editingContent.value.authorId) return;

    // Validate mandatory date types
    const mandatoryDateTypes = ['reunion', 'radar', 'best'];
    if (mandatoryDateTypes.includes(editingContent.value.type) && !editingContent.value.publicationDate) {
        alert(`El contenido tipo "${getContentTypeLabel(editingContent.value.type)}" requiere una fecha de publicación obligatoria`);
        return;
    }

    try {
        await updateContent(editingContentId.value, {
            type: editingContent.value.type,
            name: editingContent.value.name,
            notes: editingContent.value.notes || undefined,
            publicationDate: editingContent.value.publicationDate ? new Date(editingContent.value.publicationDate).toISOString() : null,
            authorId: editingContent.value.authorId
        });

        showEditModal.value = false;
        showActionsModal.value = false;
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

function copyToClipboard(text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        SwalService.success("Copiado al portapapeles");
    });
}


function copyArtistAndDisc(artist: string, disc: string) {
    const formattedText = `**${artist}** - *${disc}*`;
    navigator.clipboard.writeText(formattedText).then(() => {
        SwalService.success("Info copiada");
    });
}

function getStatusClass(status: string) {
    const classes = {
        'new': 'bg-red-500 hover:bg-red-600 border-red-400 text-white',
        'assigned': 'bg-orange-500 hover:bg-orange-600 border-orange-400 text-white',
        'published': 'bg-green-500 hover:bg-green-600 border-green-400 text-white'
    };
    return classes[status as keyof typeof classes] || 'bg-indigo-900/50 hover:bg-indigo-900 border-indigo-500/30 text-white';
}

async function updateListStatus(list: any) {
    if (!list || !list.id) return;
    try {
        await updateList(list.id, { status: list.status });
        // Optionally show success toast
        // SwalService.success('Estado actualizado');
    } catch (error) {
        console.error('Error updating status:', error);
        SwalService.error('Error al actualizar estado');
    }
}

const radarMaxListDate = computed(() => {
    if (!radarDetails.value?.listDate) return undefined;
    const d = new Date(radarDetails.value.listDate);
    const day = d.getDay();
    const diff = day === 0 ? 0 : 7 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
});

const radarMaxCloseDate = computed(() => {
    if (!radarDetails.value?.listDate) return undefined;
    const d = new Date(radarDetails.value.listDate);
    const day = d.getDay();
    const diffToSunday = day === 0 ? 0 : 7 - day;
    d.setDate(d.getDate() + diffToSunday);
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
});

const radarMinListDate = computed(() => {
    if (!radarDetails.value?.listDate) return undefined;
    const d = new Date(radarDetails.value.listDate);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
});

const radarMinCloseDate = computed(() => {
    if (!radarDetails.value?.listDate) return undefined;
    const d = new Date(radarDetails.value.listDate);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
});

function formatRadarDate(dateString: string) {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
}

async function updateRadarField(field: string, value: any) {
    if (!radarDetails.value || !radarDetails.value.id) return;
    try {
        await updateList(radarDetails.value.id, { [field]: value });
        radarDetails.value = { ...radarDetails.value, [field]: value };
        await loadContentsByMonth(currentYear.value, currentMonth.value);
    } catch (error) {
        console.error(`Error updating ${field}:`, error);
        SwalService.error('Error al actualizar fecha');
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

    // Initialize listDate for current month
    updateBestVideoListDate();
    updateRadarListDate();
});

// Watch for modal opening or type change to auto-fill name
watch([() => showCreateModal.value, () => newContent.value.type], ([isOpen, type]) => {
    if (isOpen && (type === 'radar' || type === 'best')) {
        // Auto-fill name based on type
        if (type === 'radar') {
            const monthName = getMonthName(newContent.value.selectedMonth);
            newContent.value.name = `Discos ${monthName} Semana ${newContent.value.selectedWeek}`;
        } else if (type === 'best') {
            const monthName = getMonthName(newContent.value.selectedMonth);
            newContent.value.name = `Mejores Discos de ${monthName}`;
        }
    }
});

function toDatetimeLocal(dateStr: string) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const localDate = new Date(date.getTime() - offsetMs);
    return localDate.toISOString().slice(0, 16);
}

function getMonthName(month: number): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month - 1];
}

function getWeeksInMonth(month: number, year: number): number {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    // Get the first Monday
    let current = new Date(firstDay);
    const dayOfWeek = current.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
    if (daysUntilMonday > 0) {
        current.setDate(current.getDate() + daysUntilMonday);
    }

    let weekCount = 0;
    while (current <= lastDay) {
        weekCount++;
        current.setDate(current.getDate() + 7);
    }

    return Math.max(weekCount, 1);
}

function getFridayOfWeek(month: number, week: number, year: number): string {
    const firstDay = new Date(year, month - 1, 1);

    // Find the first Monday of the month
    let monday = new Date(firstDay);
    const dayOfWeek = monday.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
    monday.setDate(monday.getDate() + daysUntilMonday);

    // Add weeks to get to the desired week
    monday.setDate(monday.getDate() + (week - 1) * 7);

    // Get Friday of that week (Monday + 4 days)
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);

    return friday.toISOString().split('T')[0];
}

function updateRadarListDate() {
    newContent.value.listDate = getFridayOfWeek(newContent.value.selectedMonth, newContent.value.selectedWeek, newContent.value.selectedYear);
}

function updateBestVideoListDate() {
    const date = new Date(newContent.value.selectedYear, newContent.value.selectedMonth - 1, 15);
    newContent.value.listDate = date.toISOString().split('T')[0];
}

function handleYearChange() {
    // Reset month to January when year changes
    newContent.value.selectedMonth = 1;
    newContent.value.selectedWeek = 1;

    // Update listDate based on content type
    if (newContent.value.type === 'radar') {
        updateRadarListDate();
    } else if (['best', 'video'].includes(newContent.value.type)) {
        updateBestVideoListDate();
    }
}


function formatDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
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
