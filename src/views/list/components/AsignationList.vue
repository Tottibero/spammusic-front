<template>
  <div>
    <!-- Solo se muestran las secciones de asignación de posición si type === "week" -->
    <template v-if="isWeek">
      <!-- Tabla para asignaciones de tipo "week" sin asignar (position === 0) -->
      <div 
        class="mb-8 transition-colors duration-200 rounded-2xl p-2 border-2 border-transparent"
        :class="dragOverGroup === 0 ? 'bg-indigo-50 border-indigo-300 shadow-lg' : ''"
        @dragover.prevent="onDragOver(0)"
        @dragleave="onDragLeave"
        @drop="onDrop(0)"
      >
        <h4 class="text-xl font-semibold mb-2 px-2 flex items-center gap-2">
          <i class="fa-solid fa-list-ul text-gray-500"></i>
          Sin asignar
          <span class="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {{ unassignedWeekAsignations.length }}
          </span>
        </h4>
        <div class="bg-white p-4 rounded-xl shadow-md">
          <div class="overflow-x-auto">
            <table class="w-full table-auto border-collapse text-sm">
              <thead class="bg-gray-100 rounded-t-lg">
                <tr>
                    <th class="px-3 py-2 text-center text-gray-600 font-medium rounded-tl-lg w-[40px]">
                      <i class="fa-solid fa-check"></i>
                    </th>
                    <th class="px-3 py-2 text-left text-gray-600 font-medium w-[40%]">Disco</th>
                    <th class="px-3 py-2 text-left text-gray-600 font-medium w-[20%]">Usuario</th>
                    <th class="px-3 py-2 text-right text-gray-600 font-medium rounded-tr-lg w-[40%]">Acciones</th>
                </tr>
              </thead>
              <tbody class="min-h-[50px]">
                <tr
                  v-for="asignation in unassignedWeekAsignations"
                  :key="asignation.id"
                  class="group odd:bg-white even:bg-gray-50 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  draggable="true"
                  @dragstart="onDragStart(asignation, $event)"
                >
                  <td class="px-3 py-2 text-center align-middle">
                     <input
                        type="checkbox"
                        :checked="asignation.done"
                        @change="toggleDone(asignation)"
                        class="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer transition-transform hover:scale-110"
                      />
                  </td>
                  <td class="px-3 py-2 text-gray-700 align-middle">
                      <div class="flex flex-col">
                        <span class="font-medium text-gray-800 truncate block max-w-[300px]" :title="asignation.disc.name">
                          {{ asignation.disc.name }}
                        </span>
                        <span class="text-xs text-gray-500 truncate block max-w-[300px]" :title="asignation.disc.artist.name">
                          {{ asignation.disc.artist.name }}
                        </span>
                      </div>
                  </td>
                  <td class="px-3 py-2 text-gray-700 align-middle">
                      <div v-if="editingUserAsignationId !== asignation.id" 
                           @click="startEditingUser(asignation)"
                           class="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-1 rounded transition-colors group/user"
                           title="Click para cambiar usuario">
                        <img :src="asignation.user.image" class="w-6 h-6 rounded-full object-cover border border-gray-200 shrink-0" />
                        <span class="truncate max-w-[100px] text-xs font-medium">{{ asignation.user.username }}</span>
                        <i class="fa-solid fa-pencil text-[10px] text-gray-400 opacity-0 group-hover/user:opacity-100 ml-1"></i>
                      </div>
                      <select v-else
                              @change="changeUser(asignation, $event)"
                              @blur="editingUserAsignationId = null"
                              class="w-full text-xs p-1 border rounded border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      >
                        <option v-for="user in users" :key="user.id" :value="user.id" :selected="user.id === asignation.user.id">
                          {{ user.username }}
                        </option>
                      </select>
                  </td>
                  <td class="px-3 py-2 text-right align-middle">
                      <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div class="w-7 h-7 flex items-center justify-center bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors" title="Spotify">
                        <SpotifyArtistButton
                          :artistName="asignation.disc.artist.name"
                          class="!p-0 !text-xs !bg-transparent !text-green-600 !w-full !h-full flex items-center justify-center !shadow-none"
                        />
                      </div>
                        <button
                          @click="copyArtistAndDisc(asignation.disc.artist.name, asignation.disc.name)"
                          class="w-7 h-7 flex items-center justify-center bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors"
                          title="Copiar Info"
                        >
                          <i class="fa-solid fa-clipboard text-xs"></i>
                        </button>
                        <button
                          @click="copyToClipboard(asignation.disc.image)"
                          class="w-7 h-7 flex items-center justify-center bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          title="Copiar Imagen"
                        >
                          <i class="fa-solid fa-image text-xs"></i>
                        </button>
                        <button
                          @click="remove(asignation.id)"
                          class="w-7 h-7 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          title="Eliminar"
                        >
                          <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                      </div>
                  </td>
                </tr>
                <tr v-if="unassignedWeekAsignations.length === 0">
                  <td colspan="5" class="px-4 py-8 text-center text-gray-400 border-dashed border-2 border-gray-100 rounded-lg m-2 bg-gray-50/50">
                    <div class="flex flex-col items-center gap-2">
                       <i class="fa-solid fa-inbox text-2xl opacity-20"></i>
                       <span class="text-sm font-medium">Bandeja de entrada vacía</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tablas para cada grupo (radar) de asignaciones de tipo "week" -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div
          v-for="group in availablePositions"
          :key="group"
          class="mb-4 transition-all duration-200 rounded-2xl p-2 border-2 border-transparent"
          :class="dragOverGroup === group ? 'bg-indigo-50 border-indigo-300 shadow-lg' : ''"
          @dragover.prevent="onDragOver(group)"
          @dragleave="onDragLeave"
          @drop="onDrop(group)"
        >
          <div class="flex items-center justify-between mb-2 px-2">
            <h4 class="text-xl font-semibold flex items-center gap-2">
              <i class="fa-solid fa-satellite-dish text-indigo-500"></i>
              Radar {{ group }}
            </h4>
            <span class="text-xs font-medium px-2 py-1 rounded-full" 
              :class="(groupedWeekAsignations[group]?.length || 0) >= 4 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
              {{ groupedWeekAsignations[group]?.length || 0 }}/4
            </span>
          </div>
          
          <div class="bg-white p-4 rounded-xl shadow-md min-h-[150px] flex flex-col">
            <div class="flex-1">
              <table class="w-full table-auto border-collapse text-sm">
                <thead class="bg-gray-100 rounded-t-lg">
                  <tr>
                    <th class="px-3 py-2 text-center text-gray-600 font-medium rounded-tl-lg w-[40px]">
                      <i class="fa-solid fa-check"></i>
                    </th>
                    <th class="px-3 py-2 text-left text-gray-600 font-medium w-[40%]">Disco</th>
                    <th class="px-3 py-2 text-left text-gray-600 font-medium w-[20%]">Usuario</th>
                    <th class="px-3 py-2 text-right text-gray-600 font-medium rounded-tr-lg w-[40%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="asignation in groupedWeekAsignations[group]"
                    :key="asignation.id"
                    class="group odd:bg-white even:bg-gray-50 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    draggable="true"
                    @dragstart="onDragStart(asignation, $event)"
                  >
                    <td class="px-3 py-2 text-center align-middle">
                     <input
                        type="checkbox"
                        :checked="asignation.done"
                        @change="toggleDone(asignation)"
                        class="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer transition-transform hover:scale-110"
                      />
                    </td>
                    <td class="px-3 py-2 text-gray-700 align-middle">
                      <div class="flex flex-col">
                        <span class="font-medium text-indigo-600 truncate block max-w-[200px]" :title="asignation.disc.name">
                          {{ asignation.disc.name }}
                        </span>
                        <span class="text-xs text-gray-500 truncate block max-w-[200px]" :title="asignation.disc.artist.name">
                          {{ asignation.disc.artist.name }}
                        </span>
                      </div>
                    </td>
                    <td class="px-3 py-2 text-gray-700 align-middle">
                      <div v-if="editingUserAsignationId !== asignation.id" 
                           @click="startEditingUser(asignation)"
                           class="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-1 rounded transition-colors group/user"
                           title="Click para cambiar usuario">
                        <img :src="asignation.user.image" class="w-6 h-6 rounded-full object-cover border border-gray-200 shrink-0" />
                        <span class="truncate max-w-[80px] text-xs font-medium">{{ asignation.user.username }}</span>
                        <i class="fa-solid fa-pencil text-[10px] text-gray-400 opacity-0 group-hover/user:opacity-100 ml-1"></i>
                      </div>
                      <select v-else
                              @change="changeUser(asignation, $event)"
                              @blur="editingUserAsignationId = null"
                              class="w-full text-xs p-1 border rounded border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      >
                        <option v-for="user in users" :key="user.id" :value="user.id" :selected="user.id === asignation.user.id">
                          {{ user.username }}
                        </option>
                      </select>
                    </td>
                    <td class="px-3 py-2 text-right align-middle">
                      <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div class="w-7 h-7 flex items-center justify-center bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors" title="Spotify">
                        <SpotifyArtistButton
                          :artistName="asignation.disc.artist.name"
                          class="!p-0 !text-xs !bg-transparent !text-green-600 !w-full !h-full flex items-center justify-center !shadow-none"
                        />
                      </div>
                        <button
                          @click="copyArtistAndDisc(asignation.disc.artist.name, asignation.disc.name)"
                          class="w-7 h-7 flex items-center justify-center bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors"
                          title="Copiar Info"
                        >
                          <i class="fa-solid fa-clipboard text-xs"></i>
                        </button>
                        <button
                          @click="copyToClipboard(asignation.disc.image)"
                          class="w-7 h-7 flex items-center justify-center bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          title="Copiar Imagen"
                        >
                          <i class="fa-solid fa-image text-xs"></i>
                        </button>
                        <button
                          @click="remove(asignation.id)"
                          class="w-7 h-7 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          title="Eliminar"
                        >
                          <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!groupedWeekAsignations[group] || !groupedWeekAsignations[group].length">
                    <td colspan="4" class="px-4 py-12 text-center text-gray-400 border-dashed border-2 border-gray-100 rounded-lg m-2 bg-gray-50/50">
                       <div class="flex flex-col items-center gap-2">
                         <i class="fa-solid fa-arrow-right-to-bracket text-2xl opacity-20"></i>
                         <span class="text-sm font-medium">Arrastra discos aquí</span>
                       </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Botón para añadir nuevo grupo de Radar -->
        <div class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-2xl min-h-[200px] hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group"
             @click="availablePositionsCount++">
          <div class="text-center">
            <div class="w-12 h-12 bg-gray-100 group-hover:bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors">
              <i class="fa-solid fa-plus text-gray-400 group-hover:text-indigo-600 text-xl transition-colors"></i>
            </div>
            <span class="font-medium text-gray-500 group-hover:text-indigo-600 transition-colors">Nuevo Radar</span>
          </div>
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
              <tr
                v-for="asignation in asignations"
                :key="asignation.id"
                class="odd:bg-white even:bg-gray-50"
              >
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
                    <SpotifyArtistButton
                      :artistName="asignation.disc.artist.name"
                    />
                    <button
                      @click="copyArtistAndDisc(asignation.disc.artist.name, asignation.disc.name)"
                      class="px-2 py bg-purple-500 text-white rounded-md hover:bg-purple-600 mr-2"
                    >
                      <i class="fa-solid fa-clipboard"></i>
                    </button>
                    <button
                      @click="copyToClipboard(asignation.disc.image)"
                      class="px-2 py bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      <i class="fa-solid fa-image"></i>
                    </button>
                    <input
                      type="checkbox"
                      :checked="asignation.done"
                      @change="toggleDone(asignation)"
                      class="form-checkbox h-5 w-5 text-green-500"
                    />
                    <button
                      @click="remove(asignation.id)"
                      class="px-2 py bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
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
                // También actualizar en el store si es necesario para mantener consistencia global
                // asignationStore.updateLocalAsignation(updatedAsignation); // Si existiera tal método
             }
           }
           
           SwalService.success('Usuario actualizado');
        } catch(error) {
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
        // Hack para que la imagen fantasma no incluya el fondo blanco de la fila entera si es posible
        // event.dataTransfer.setDragImage(event.target as Element, 0, 0); 
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

      // Actualizar localmente para feedback inmediato
      item.position = group;
      
      // Actualizar en backend
      await updatePosition(item);
      
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

    return {
      asignations,
      isWeek,
      unassignedWeekAsignations,
      groupedWeekAsignations,
      availablePositions,
      availablePositionsCount, // Expuesto para el botón de "Nuevo Radar"
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
      changeUser
    };
  },
});
</script>
