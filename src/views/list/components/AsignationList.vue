<template>
  <div class="space-y-8">
    <!-- Solo se muestran las secciones de asignación de posición si type === "week" -->
    <template v-if="isWeek">
      <!-- Bandeja de entrada (Sin asignar) - Drag Zone -->
      <div class="p-6 rounded-3xl border-2 border-dashed transition-colors duration-300"
        :class="dragOverGroup === 0 ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50/50 border-gray-200'"
        @dragover.prevent="onDragOver(0)" @dragleave="onDragLeave" @drop="onDrop(0)">
        <h4 class="text-xl font-bold mb-6 px-2 flex items-center gap-3 text-gray-700">
          <div class="p-2 bg-gray-200 rounded-lg text-gray-600">
            <i class="fa-solid fa-inbox"></i>
          </div>
          Bandeja de Entrada
          <span class="text-sm font-bold px-2.5 py-1 rounded-full bg-gray-200 text-gray-600 shadow-sm">
            {{ unassignedWeekAsignations.length }}
          </span>
        </h4>

        <!-- Grid de Tarjetas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[100px]">
          <div v-for="asignation in unassignedWeekAsignations" :key="asignation.id" draggable="true"
            @dragstart="onDragStart(asignation, $event)"
            class="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group flex flex-col h-full cursor-grab active:cursor-grabbing relative">

            <!-- Main Content -->
            <div class="flex items-start gap-4 mb-2 flex-grow">
              <!-- Cover & Flag Column -->
              <div class="flex flex-col items-center gap-2 flex-shrink-0">
                <!-- Cover Placeholder -->
                <div
                  class="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 font-bold overflow-hidden shadow-inner">
                  <img v-if="asignation.disc.image" :src="asignation.disc.image" class="w-full h-full object-cover" />
                  <span v-else>{{ asignation.disc.artist.name.charAt(0) }}</span>
                </div>

                <!-- Flag -->
                <div v-if="(asignation.disc.artist?.country?.isoCode?.length >= 2)" class="w-5 h-5 flex-shrink-0"
                  :title="asignation.disc.artist.country.name">
                  <CircleFlags :country="asignation.disc.artist.country.isoCode.slice(0, 2).toLowerCase()"
                    :show-flag-name="false" />
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <!-- Header con Título y Botones Rápidos -->
                <div class="flex justify-between items-start gap-2 mb-1">
                  <h5 class="font-bold text-gray-900 text-base leading-tight truncate flex-1"
                    :title="asignation.disc.name">
                    {{ asignation.disc.name }}
                  </h5>

                  <!-- Quick Move Buttons -->
                  <div class="flex items-center gap-1 flex-shrink-0 ml-1">
                    <button v-for="pos in availablePositions" :key="pos" @click.stop="moveTo(asignation, pos)"
                      class="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border transition-colors bg-white text-gray-500 border-gray-200 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm"
                      :title="'Mover a Radar ' + pos">
                      {{ pos }}
                    </button>
                  </div>
                </div>

                <!-- Artist & Genre Row -->
                <div class="flex items-center gap-2 mb-2 min-w-0">
                  <p class="text-xs text-gray-500 font-medium truncate" :title="asignation.disc.artist.name">
                    {{ asignation.disc.artist.name }}
                  </p>
                  <span v-if="asignation.disc.genre"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm truncate max-w-[100px] flex-shrink-0"
                    :style="{ backgroundColor: asignation.disc.genre.color || '#9ca3af' }">
                    {{ asignation.disc.genre.name }}
                  </span>
                </div>

                <!-- Actions Row -->
                <div class="flex items-center gap-2">
                  <!-- Spotify -->
                  <div
                    class="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors cursor-pointer shadow-sm border border-green-200"
                    title="Spotify">
                    <SpotifyArtistButton :artistName="asignation.disc.artist.name"
                      class="!text-xs !bg-transparent !text-inherit !p-0 !w-full !h-full flex items-center justify-center !shadow-none" />
                  </div>
                  <!-- Copy Info -->
                  <button @click="copyArtistAndDisc(asignation.disc.artist.name, asignation.disc.name)"
                    class="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors shadow-sm border border-purple-200"
                    title="Copiar Info">
                    <i class="fa-solid fa-clipboard text-xs"></i>
                  </button>
                  <!-- Copy Image -->
                  <button @click="copyToClipboard(asignation.disc.image)"
                    class="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors shadow-sm border border-blue-200"
                    title="Copiar Imagen">
                    <i class="fa-solid fa-image text-xs"></i>
                  </button>
                  <!-- Delete -->
                  <button @click="remove(asignation.id)"
                    class="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors shadow-sm border border-red-200"
                    title="Eliminar">
                    <i class="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer: User & Check -->
            <div class="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3">
              <!-- Checkbox -->
              <label class="relative flex items-center justify-center cursor-pointer group/check w-8 flex-shrink-0">
                <input type="checkbox" :checked="asignation.done" @change="toggleDone(asignation)"
                  class="peer sr-only" />
                <div
                  class="w-6 h-6 border-2 border-gray-300 rounded-lg peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors shadow-sm">
                </div>
                <i
                  class="fa-solid fa-check text-[10px] text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></i>
              </label>

              <!-- User Selector Compact -->
              <div class="flex items-center w-full min-w-0">
                <div v-if="editingUserAsignationId !== asignation.id" @click="startEditingUser(asignation)"
                  class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 -ml-1.5 rounded-lg transition-colors group/user w-full min-w-0"
                  title="Asignar usuario">
                  <div
                    class="w-7 h-7 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-indigo-700 ring-2 ring-white overflow-hidden shadow-sm">
                    <img v-if="asignation.user?.image" :src="asignation.user.image"
                      class="w-full h-full object-cover" />
                    <span v-else>{{ asignation.user?.username?.charAt(0) || '?' }}</span>
                  </div>
                  <span class="text-xs font-semibold text-gray-600 truncate">
                    {{ asignation.user?.username || 'Sin asignar' }}
                  </span>
                </div>
                <select v-else @change="changeUser(asignation, $event)" @blur="editingUserAsignationId = null"
                  class="text-xs p-1.5 border rounded-lg border-indigo-300 focus:ring-0 w-full bg-white">
                  <option v-for="user in users" :key="user.id" :value="user.id"
                    :selected="user.id === asignation.user?.id">
                    {{ user.username }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Empty State for Inbox -->
          <div v-if="unassignedWeekAsignations.length === 0" class="col-span-full py-12 text-center text-gray-400">
            <i class="fa-solid fa-inbox text-4xl mb-3 opacity-30"></i>
            <p class="text-sm font-medium">Bandeja de entrada vacía</p>
          </div>
        </div>
      </div>

      <!-- Radares (Grupos) - Grid de 2 Columnas -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <div v-for="group in availablePositions" :key="group"
          class="p-6 rounded-3xl border-2 border-dashed transition-all duration-300"
          :class="dragOverGroup === group ? 'bg-indigo-50 border-indigo-400 shadow-md transform scale-[1.01]' : 'bg-white border-gray-200 shadow-sm'"
          @dragover.prevent="onDragOver(group)" @dragleave="onDragLeave" @drop="onDrop(group)">
          <!-- Header Radar -->
          <div class="flex items-center justify-between mb-6">
            <h4 class="text-xl font-bold flex items-center gap-3 text-gray-800">
              <div class="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <i class="fa-solid fa-satellite-dish"></i>
              </div>
              Radar {{ group }}
            </h4>
            <span class="text-sm font-bold px-3 py-1 rounded-full border transition-colors shadow-sm"
              :class="(groupedWeekAsignations[group]?.length || 0) >= 4 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'">
              {{ groupedWeekAsignations[group]?.length || 0 }}/4
            </span>
          </div>

          <!-- Grid Radar (dentro de cada grupo) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[150px]">
            <div v-for="asignation in groupedWeekAsignations[group]" :key="asignation.id" draggable="true"
              @dragstart="onDragStart(asignation, $event)"
              class="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group flex flex-col h-full cursor-grab active:cursor-grabbing relative overflow-hidden">

              <!-- Top Accent -->
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400"></div>

              <!-- Main Content -->
              <div class="flex items-start gap-4 mb-2 flex-grow">
                <!-- Cover & Flag Column -->
                <div class="flex flex-col items-center gap-2 flex-shrink-0">
                  <div
                    class="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 font-bold overflow-hidden shadow-inner">
                    <img v-if="asignation.disc.image" :src="asignation.disc.image" class="w-full h-full object-cover" />
                    <span v-else>{{ asignation.disc.artist.name.charAt(0) }}</span>
                  </div>
                  <div v-if="(asignation.disc.artist?.country?.isoCode?.length >= 2)" class="w-5 h-5 flex-shrink-0"
                    :title="asignation.disc.artist.country.name">
                    <CircleFlags :country="asignation.disc.artist.country.isoCode.slice(0, 2).toLowerCase()"
                      :show-flag-name="false" />
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <!-- Header con Título y Botones Rápidos (Mover a Inbox/Otros) -->
                  <div class="flex justify-between items-start gap-2 mb-1">
                    <h5 class="font-bold text-gray-900 text-base leading-tight truncate flex-1"
                      :title="asignation.disc.name">
                      {{ asignation.disc.name }}
                    </h5>
                    <div class="flex items-center gap-1 flex-shrink-0 ml-1">
                      <!-- Botón para volver a inbox -->
                      <button @click.stop="moveTo(asignation, 0)"
                        class="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border transition-colors bg-white text-gray-400 border-gray-200 hover:border-red-300 hover:text-red-500 hover:bg-red-50 shadow-sm"
                        title="Quitar de Radar (Mover a Bandeja)">
                        <i class="fa-solid fa-xmark"></i>
                      </button>
                      <!-- Botones para otros radares -->
                      <button v-for="pos in availablePositions" :key="pos" v-show="asignation.position !== pos"
                        @click.stop="moveTo(asignation, pos)"
                        class="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border transition-colors bg-white text-gray-500 border-gray-200 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm"
                        :title="'Mover a Radar ' + pos">
                        {{ pos }}
                      </button>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 mb-2 min-w-0">
                    <p class="text-xs text-gray-500 font-medium truncate" :title="asignation.disc.artist.name">
                      {{ asignation.disc.artist.name }}
                    </p>
                    <span v-if="asignation.disc.genre"
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm truncate max-w-[100px] flex-shrink-0"
                      :style="{ backgroundColor: asignation.disc.genre.color || '#9ca3af' }">
                      {{ asignation.disc.genre.name }}
                    </span>
                  </div>

                  <!-- Actions Row -->
                  <div class="flex items-center gap-2">
                    <div
                      class="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors cursor-pointer shadow-sm border border-green-200"
                      title="Spotify">
                      <SpotifyArtistButton :artistName="asignation.disc.artist.name"
                        class="!text-xs !bg-transparent !text-inherit !p-0 !w-full !h-full flex items-center justify-center !shadow-none" />
                    </div>
                    <button @click="copyArtistAndDisc(asignation.disc.artist.name, asignation.disc.name)"
                      class="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors shadow-sm border border-purple-200"
                      title="Copiar Info">
                      <i class="fa-solid fa-clipboard text-xs"></i>
                    </button>
                    <button @click="copyToClipboard(asignation.disc.image)"
                      class="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors shadow-sm border border-blue-200"
                      title="Copiar Imagen">
                      <i class="fa-solid fa-image text-xs"></i>
                    </button>
                    <button @click="remove(asignation.id)"
                      class="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors shadow-sm border border-red-200"
                      title="Eliminar">
                      <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3">
                <label class="relative flex items-center justify-center cursor-pointer group/check w-8 flex-shrink-0">
                  <input type="checkbox" :checked="asignation.done" @change="toggleDone(asignation)"
                    class="peer sr-only" />
                  <div
                    class="w-6 h-6 border-2 border-gray-300 rounded-lg peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors shadow-sm">
                  </div>
                  <i
                    class="fa-solid fa-check text-[10px] text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></i>
                </label>
                <div class="flex items-center w-full min-w-0">
                  <div v-if="editingUserAsignationId !== asignation.id" @click="startEditingUser(asignation)"
                    class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 -ml-1.5 rounded-lg transition-colors group/user w-full min-w-0"
                    title="Asignar usuario">
                    <div
                      class="w-7 h-7 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-indigo-700 ring-2 ring-white overflow-hidden shadow-sm">
                      <img v-if="asignation.user?.image" :src="asignation.user.image"
                        class="w-full h-full object-cover" />
                      <span v-else>{{ asignation.user?.username?.charAt(0) || '?' }}</span>
                    </div>
                    <span class="text-xs font-semibold text-gray-600 truncate">
                      {{ asignation.user?.username || 'Sin asignar' }}
                    </span>
                  </div>
                  <select v-else @change="changeUser(asignation, $event)" @blur="editingUserAsignationId = null"
                    class="text-xs p-1.5 border rounded-lg border-indigo-300 focus:ring-0 w-full bg-white">
                    <option v-for="user in users" :key="user.id" :value="user.id"
                      :selected="user.id === asignation.user?.id">
                      {{ user.username }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Empty State for Group -->
            <div v-if="!groupedWeekAsignations[group] || groupedWeekAsignations[group].length === 0"
              class="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
              <i class="fa-solid fa-arrow-right-to-bracket text-3xl mb-2 opacity-30"></i>
              <p class="text-sm font-medium">Arrastra discos aquí</p>
            </div>
          </div>
        </div>

        <!-- Add Group Button -->
        <div
          class="hidden xl:flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-3xl min-h-[200px] hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group"
          @click="availablePositionsCount++">
          <div class="text-center">
            <div
              class="w-14 h-14 bg-gray-100 group-hover:bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
              <i class="fa-solid fa-plus text-gray-400 group-hover:text-indigo-600 text-2xl transition-colors"></i>
            </div>
            <span class="font-bold text-gray-500 group-hover:text-indigo-600 transition-colors text-lg">Nuevo
              Radar</span>
          </div>
        </div>
      </div>

      <!-- Mobile Add Group Button -->
      <div
        class="xl:hidden flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-3xl hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group mb-8"
        @click="availablePositionsCount++">
        <div class="flex items-center gap-3">
          <i class="fa-solid fa-plus text-gray-400 group-hover:text-indigo-600"></i>
          <span class="font-bold text-gray-500 group-hover:text-indigo-600">Añadir Nuevo Radar</span>
        </div>
      </div>
    </template>

    <!-- Si el prop type NO es "week", renderizado simple -->
    <template v-else>
      <div class="bg-white p-6 rounded-2xl shadow-md">
        <div class="overflow-x-auto">
          <table class="w-full table-auto border-collapse">
            <thead class="bg-gray-200">
              <tr>
                <th class="px-4 py-2 text-left text-gray-600 font-medium">Artista</th>
                <th class="px-4 py-2 text-left text-gray-600 font-medium">Disco</th>
                <th class="px-4 py-2 text-left text-gray-600 font-medium">Usuario</th>
                <th class="px-4 py-2 text-left text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="asignation in asignations" :key="asignation.id" class="odd:bg-white even:bg-gray-50">
                <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
                  {{ asignation.disc.artist.name }}
                </td>
                <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
                  {{ asignation.disc.name }}
                </td>
                <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
                  {{ asignation.user.username }}
                </td>
                <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
                  <div class="flex items-center space-x-4">
                    <SpotifyArtistButton :artistName="asignation.disc.artist.name" />
                    <button @click="copyArtistAndDisc(asignation.disc.artist.name, asignation.disc.name)"
                      class="px-2 py bg-purple-500 text-white rounded-md hover:bg-purple-600 mr-2">
                      <i class="fa-solid fa-clipboard"></i>
                    </button>
                    <button @click="copyToClipboard(asignation.disc.image)"
                      class="px-2 py bg-blue-500 text-white rounded-md hover:bg-blue-600">
                      <i class="fa-solid fa-image"></i>
                    </button>
                    <input type="checkbox" :checked="asignation.done" @change="toggleDone(asignation)"
                      class="form-checkbox h-5 w-5 text-green-500" />
                    <button @click="remove(asignation.id)"
                      class="px-2 py bg-red-500 text-white rounded-md hover:bg-red-600">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!asignations.length">
                <td colspan="4" class="px-4 py-2 text-center text-gray-500">
                  No hay asignaciones.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, nextTick } from "vue";
import { useAsignationStore } from "@stores/asignation/asignation";
import { useUserStore } from "@stores/user/users";
import SpotifyArtistButton from "@components/SpotifyArtistButton.vue";
import SwalService from "@services/swal/SwalService";

export default defineComponent({
  name: "AsignationList",
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  components: {
    SpotifyArtistButton,
  },
  setup(props) {
    const asignationStore = useAsignationStore();
    const userStore = useUserStore();
    const asignations = ref<any[]>([]);

    // Usuario
    const users = computed(() => userStore.usersRv); // Usar usuarios RV
    const editingUserAsignationId = ref<string | null>(null);

    // Cargar usuarios RV si no están cargados
    if (userStore.usersRv.length === 0) {
      userStore.loadRvUsers();
    }

    // Edit User Logic
    const startEditingUser = async (asignation: any) => {
      editingUserAsignationId.value = asignation.id;
      // Esperar a que el DOM se actualice para enfocar el select
      await nextTick();
      // Opcional: enfocar el select si usamos refs
    };

    const changeUser = async (asignation: any, event: Event) => {
      const select = event.target as HTMLSelectElement;
      const newUserId = select.value;

      if (newUserId && newUserId !== asignation.user.id) {
        try {
          const updatedAsignationPayload = { id: asignation.id, userId: newUserId };
          await asignationStore.updateAsignationStore(updatedAsignationPayload);

          // Actualizar localmente para reflejar el cambio sin recargar
          const newUser = userStore.usersRv.find((u: any) => u.id === newUserId);
          if (newUser) {
            const index = asignations.value.findIndex(a => a.id === asignation.id);
            if (index !== -1) {
              // Crear nueva referencia para reactividad
              const updatedAsignation = { ...asignations.value[index], user: newUser };
              asignations.value[index] = updatedAsignation;
            }
          }

          SwalService.success('Usuario actualizado');
        } catch (error) {
          console.error("Failed to update user", error);
          SwalService.error("Error al cambiar usuario");
        }
      }
      editingUserAsignationId.value = null;
    };

    // Drag and Drop state
    const draggedItem = ref<any>(null);
    const dragOverGroup = ref<number | null>(null);
    const availablePositionsCount = ref(1); // Control manual de número de grupos si se desea expandir

    watch(
      () => asignationStore.asignations,
      (newAsignations) => {
        asignations.value = newAsignations.map((a: any) => ({
          ...a,
          position: a.position ?? 0,
        }));
        // Calcular grupos iniciales basados en datos
        if (props.type === 'week' && asignations.value.length > 0) {
          const maxPos = Math.max(...asignations.value.map(a => a.position));
          const calculatedneeded = Math.ceil(asignations.value.length / 4);
          availablePositionsCount.value = Math.max(maxPos, calculatedneeded, 1);
        }
      },
      { immediate: true, deep: true }
    );

    const isWeek = computed(() => props.type === "week");
    const weekAsignations = computed(() => (isWeek.value ? asignations.value : []));

    const unassignedWeekAsignations = computed(() =>
      weekAsignations.value.filter((a) => a.position === 0)
    );

    const groupedWeekAsignations = computed(() => {
      const groups: Record<number, any[]> = {};
      weekAsignations.value.forEach((a) => {
        if (a.position > 0) {
          if (!groups[a.position]) groups[a.position] = [];
          groups[a.position].push(a);
        }
      });
      return groups;
    });

    const availablePositions = computed(() =>
      Array.from({ length: availablePositionsCount.value }, (_, i) => i + 1)
    );

    const isGroupFull = (groupNumber: number, currentAsignation?: any) => {
      if (groupNumber === 0) return false;
      const group = groupedWeekAsignations.value[groupNumber] || [];
      // Si estamos validando para el item que ya está en el grupo, no cuenta como full para él mismo
      if (currentAsignation && currentAsignation.position === groupNumber) return false;
      return group.length >= 4;
    };

    // --- Drag and Drop Handlers ---

    const onDragStart = (item: any, event: DragEvent) => {
      draggedItem.value = item;
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.dropEffect = 'move';
      }
    };

    const onDragOver = (group: number) => {
      // Validar si podemos soltar aquí
      if (isGroupFull(group, draggedItem.value)) {
        // Opcional: mostrar feedback visual de "no permitido"
        return;
      }
      dragOverGroup.value = group;
    };

    const onDragLeave = () => {
      dragOverGroup.value = null;
    };

    const onDrop = async (group: number) => {
      dragOverGroup.value = null;
      if (!draggedItem.value) return;

      if (isGroupFull(group, draggedItem.value)) {
        SwalService.error('Este radar ya tiene 4 discos asignados.');
        return;
      }

      const item = draggedItem.value;

      // Si el grupo es el mismo, no hacemos nada
      if (item.position === group) {
        draggedItem.value = null;
        return;
      }

      await moveTo(item, group);
      draggedItem.value = null;
    };


    const remove = (id: string) => {
      asignations.value = asignations.value.filter(
        (asignation) => asignation.id !== id
      );
      asignationStore.removeAsignation(id);
    };

    const toggleDone = async (asignation: any) => {
      const updatedAsignation = { ...asignation, done: !asignation.done };
      try {
        await asignationStore.updateAsignationStore(updatedAsignation);
        asignations.value = asignations.value.map((a) =>
          a.id === asignation.id ? updatedAsignation : a
        );
      } catch (error) {
        console.error("Error actualizando:", error);
      }
    };

    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        SwalService.success("Enlace a la imagen copiado");
      });
    };

    const copyArtistAndDisc = (artist: string, disc: string) => {
      const formattedText = `**${artist}** - *${disc}*`;
      navigator.clipboard.writeText(formattedText).then(() => {
        SwalService.success("Copiado al portapapeles");
      });
    };

    const updatePosition = async (asignation: any) => {
      if (!isWeek.value) return;
      try {
        await asignationStore.updateAsignationStore(asignation);
        // Actualizar referencia local por si acaso
        asignations.value = asignations.value.map((a) =>
          a.id === asignation.id ? asignation : a
        );
      } catch (error) {
        console.error("Error al actualizar la posición:", error);
        SwalService.error("Error al mover el disco");
      }
    };

    // Quick Assign without drag
    const moveTo = async (asignation: any, group: number) => {
      if (asignation.position === group) return;

      if (isGroupFull(group, asignation)) {
        SwalService.error(`El Radar ${group} ya está completo (4/4).`);
        return;
      }

      // Update logic
      const updated = { ...asignation, position: group };
      // Optimistic update locally handled by updatePosition ref map
      await updatePosition(updated);
    };

    return {
      asignations,
      isWeek,
      unassignedWeekAsignations,
      groupedWeekAsignations,
      availablePositions,
      availablePositionsCount,
      remove,
      toggleDone,
      copyToClipboard,
      copyArtistAndDisc,
      updatePosition,
      isGroupFull,
      // D&D
      onDragStart,
      onDragOver,
      onDragLeave,
      onDrop,
      dragOverGroup,
      draggedItem,
      // User Edit
      users,
      editingUserAsignationId,
      startEditingUser,
      changeUser,
      // Quick Move
      moveTo
    };
  },
});
</script>
