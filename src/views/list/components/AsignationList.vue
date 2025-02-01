<template>
  <div>
    <!-- Solo se muestran las secciones de asignación de posición si type === "week" -->
    <template v-if="isWeek">
      <!-- Tabla para asignaciones de tipo "week" sin asignar (position === 0) -->
      <div v-if="unassignedWeekAsignations.length" class="mb-8">
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
                  v-for="asignation in unassignedWeekAsignations"
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
                  <!-- Select para cambiar la posición (solo en type week) -->
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

      <!-- Tablas para cada grupo (radar) de asignaciones de tipo "week" -->
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
                  v-for="asignation in groupedWeekAsignations[group]"
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
                  <!-- Select para cambiar el grupo (solo en type week) -->
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
                <tr v-if="!groupedWeekAsignations[group] || !groupedWeekAsignations[group].length">
                  <td colspan="5" class="px-4 py-2 text-center text-gray-500">
                    No hay asignaciones en este radar.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- Si el prop type NO es "week", puedes mostrar otro contenido o simplemente no aplicar agrupación -->
    <template v-else>
      <!-- Aquí puedes renderizar las asignaciones sin el mecanismo de posición -->
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
import { defineComponent, ref, watch, computed } from "vue";
import { useAsignationStore } from "@stores/asignation/asignation";
import SpotifyArtistButton from "@components/SpotifyArtistButton.vue";
import SwalService from "@services/swal/SwalService";

export default defineComponent({
  name: "AsignationList",
  props: {
    // Prop global que determina el tipo para aplicar la asignación de position.
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
    const asignations = ref<any[]>([]);
    console.log("type", props.type)
    // Sincronizamos todas las asignaciones desde el store.
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

    // Computed para saber si el prop type es "week"
    const isWeek = computed(() => props.type === "week");

    // Si type es "week", trabajamos con estas asignaciones;
    // de lo contrario, no se aplicará el agrupamiento de posición.
    const weekAsignations = computed(() => (isWeek.value ? asignations.value : []));

    // Asignaciones de tipo "week" sin grupo (position === 0)
    const unassignedWeekAsignations = computed(() =>
      weekAsignations.value.filter((a) => a.position === 0)
    );

    // Agrupamos las asignaciones de tipo "week" que ya tienen grupo (position > 0)
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

    // Calculamos el número máximo de grupos basado en el total de asignaciones de tipo "week"
    // Se usa Math.ceil(total / 4) para que cada grupo tenga hasta 4 elementos.
    const maxGroup = computed(() => {
      return weekAsignations.value.length > 0
        ? Math.ceil(weekAsignations.value.length / 4)
        : 1;
    });

    // Array con números de grupo: [1, 2, …, maxGroup]
    const availablePositions = computed(() =>
      Array.from({ length: maxGroup.value }, (_, i) => i + 1)
    );

    // Función para determinar si un grupo (radar) ya tiene 4 asignaciones (para type week)
    // Se permite mantener la asignación actual aunque el grupo esté lleno.
    const isGroupFull = (groupNumber: number, currentAsignation: any) => {
      const group = groupedWeekAsignations.value[groupNumber] || [];
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

    // Actualiza la posición del assignment (solo para type "week").
    // Se usa el valor obtenido del select (1, 2, …).
    const updatePosition = async (asignation: any) => {
      if (!isWeek.value) return;
      try {
        await asignationStore.updateAsignationStore(asignation);
        asignations.value = asignations.value.map((a) =>
          a.id === asignation.id ? asignation : a
        );
      } catch (error) {
        console.error("Error al actualizar la posición:", error);
      }
    };

    return {
      asignations,
      isWeek,
      unassignedWeekAsignations,
      groupedWeekAsignations,
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
