<template>
  <div>
    <!-- Tabla de asignaciones sin asignar: solo se muestra si hay asignaciones sin asignar -->
    <div v-if="unassignedAsignations.length" class="mb-8">
      <h4 class="text-xl font-semibold mb-2">Sin asignar</h4>
      <div class="bg-white p-6 rounded-2xl shadow-md">
        <div class="overflow-x-auto">
          <table class="w-full table-auto border-collapse">
            <thead class="bg-gray-200">
              <tr>
                <th class="px-4 py-2 text-left text-gray-600 font-medium">Artista</th>
                <th class="px-4 py-2 text-left text-gray-600 font-medium">Disco</th>
                <th class="px-4 py-2 text-left text-gray-600 font-medium">Usuario</th>
                <th class="px-4 py-2 text-left text-gray-600 font-medium">Acciones</th>
                <th class="px-4 py-2 text-left text-gray-600 font-medium">Grupo</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="asignation in unassignedAsignations"
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
                <!-- Select para cambiar la posición -->
                <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
                  <select
                    v-model.number="asignation.position"
                    @change="updatePosition(asignation)"
                    class="border border-gray-300 rounded p-1"
                  >
                    <option :value="0">Sin asignar</option>
                    <option
                      v-for="option in availablePositions"
                      :key="option"
                      :value="option"
                      :disabled="isGroupFull(option, asignation)"
                    >
                      {{ 'radar ' + option }}
                    </option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tablas para cada grupo (radar) -->
    <div
      v-for="group in availablePositions"
      :key="group"
      class="mb-8"
    >
      <h4 class="text-xl font-semibold mb-2">Radar {{ group }}</h4>
      <div class="bg-white p-6 rounded-2xl shadow-md">
        <div class="overflow-x-auto">
          <table class="w-full table-auto border-collapse">
            <thead class="bg-gray-200">
              <tr>
                <th class="px-4 py-2 text-left text-gray-600 font-medium">Artista</th>
                <th class="px-4 py-2 text-left text-gray-600 font-medium">Disco</th>
                <th class="px-4 py-2 text-left text-gray-600 font-medium">Usuario</th>
                <th class="px-4 py-2 text-left text-gray-600 font-medium">Acciones</th>
                <th class="px-4 py-2 text-left text-gray-600 font-medium">Grupo</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="asignation in groupedAsignations[group]"
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
                <!-- Select para cambiar el grupo -->
                <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
                  <select
                    v-model.number="asignation.position"
                    @change="updatePosition(asignation)"
                    class="border border-gray-300 rounded p-1"
                  >
                    <option :value="0">Sin asignar</option>
                    <option
                      v-for="option in availablePositions"
                      :key="option"
                      :value="option"
                      :disabled="isGroupFull(option, asignation)"
                    >
                      {{ 'radar ' + option }}
                    </option>
                  </select>
                </td>
              </tr>
              <!-- Si el radar está vacío, se muestra un mensaje -->
              <tr v-if="!groupedAsignations[group] || !groupedAsignations[group].length">
                <td colspan="5" class="px-4 py-2 text-center text-gray-500">
                  No hay asignaciones en este radar.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";
import { useAsignationStore } from "@stores/asignation/asignation";
import SpotifyArtistButton from "@components/SpotifyArtistButton.vue";
import SwalService from "@services/swal/SwalService";

export default defineComponent({
  name: "AsignationList",
  components: {
    SpotifyArtistButton,
  },
  setup() {
    const asignationStore = useAsignationStore();
    const asignations = ref<any[]>([]);

    // Sincroniza las asignaciones desde el store.
    // Si no tienen 'position', se les asigna 0 (Sin asignar)
    watch(
      () => asignationStore.asignations,
      (newAsignations) => {
        asignations.value = newAsignations.map((a: any) => ({
          ...a,
          position: a.position ?? 0,
        }));
      },
      { immediate: true, deep: true }
    );

    // Asignaciones sin grupo (position === 0)
    const unassignedAsignations = computed(() =>
      asignations.value.filter((a) => a.position === 0)
    );

    // Agrupa las asignaciones asignadas (position > 0) por grupo
    const groupedAsignations = computed(() => {
      const groups: Record<number, any[]> = {};
      asignations.value.forEach((a) => {
        if (a.position > 0) {
          if (!groups[a.position]) groups[a.position] = [];
          groups[a.position].push(a);
        }
      });
      return groups;
    });

    // Calcula el número máximo de grupos basado en el total de asignaciones  
    // para disponer siempre las mismas opciones (sin importar si están asignadas o no)
    const maxGroup = computed(() => {
      return asignations.value.length > 0
        ? Math.ceil(asignations.value.length / 4)
        : 1;
    });

    // Array de números de grupo: [1, 2, ..., maxGroup]
    const availablePositions = computed(() =>
      Array.from({ length: maxGroup.value }, (_, i) => i + 1)
    );

    // Función para determinar si un grupo ya tiene 4 asignaciones
    // (se permite mantener la asignación actual incluso si el grupo está lleno)
    const isGroupFull = (groupNumber: number, currentAsignation: any) => {
      const group = groupedAsignations.value[groupNumber] || [];
      return group.length >= 4 && currentAsignation.position !== groupNumber;
    };

    const remove = (id: string) => {
      asignations.value = asignations.value.filter(
        (asignation) => asignation.id !== id
      );
      asignationStore.removeAsignation(id);
    };

    const toggleDone = async (asignation: any) => {
      const updatedAsignation = {
        ...asignation,
        done: !asignation.done,
      };

      try {
        await asignationStore.updateAsignationStore(updatedAsignation);
        asignations.value = asignations.value.map((a) =>
          a.id === asignation.id ? updatedAsignation : a
        );
      } catch (error) {
        console.error("Error actualizando la asignación:", error);
      }
    };

    const copyToClipboard = (text: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          SwalService.success("Enlace a la imagen copiado al portapapeles");
        })
        .catch((err) => {
          console.error("Error al copiar:", err);
        });
    };

    const copyArtistAndDisc = (artist: string, disc: string) => {
      const formattedText = `**${artist}** - *${disc}*`;
      navigator.clipboard
        .writeText(formattedText)
        .then(() => {
          SwalService.success("Nombre copiado al portapapeles");
        })
        .catch((err) => {
          console.error("Error al copiar:", err);
        });
    };

    // Actualiza la posición del assignment en el store y en la lista local.
    // El valor de la posición es el que se obtiene del select (1, 2, …)
    const updatePosition = async (asignation: any) => {
      try {
        await asignationStore.updateAsignationStore(asignation);
        asignations.value = asignations.value.map((a) =>
          a.id === asignation.id ? asignation : a
        );
        SwalService.success("Updated asignation");
      } catch (error) {
        console.error("Error al actualizar la posición:", error);
      }
    };

    return {
      asignations,
      unassignedAsignations,
      groupedAsignations,
      availablePositions,
      remove,
      toggleDone,
      copyToClipboard,
      copyArtistAndDisc,
      updatePosition,
      isGroupFull,
    };
  },
});
</script>
