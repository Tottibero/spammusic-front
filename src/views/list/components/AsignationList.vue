<template>
  <div class="bg-white p-6 rounded-2xl shadow-md">
    <h3 class="text-lg font-bold mb-4">Asignaciones</h3>
    <div class="overflow-x-auto">
      <table class="w-full table-auto border-collapse">
        <thead class="bg-gray-200">
          <tr>
            <th class="px-4 py-2 text-left text-gray-600 font-medium">
              Artista
            </th>
            <th class="px-4 py-2 text-left text-gray-600 font-medium">Disco</th>
            <th class="px-4 py-2 text-left text-gray-600 font-medium">
              Usuario
            </th>
            <th class="px-4 py-2 text-left text-gray-600 font-medium">
              Acciones
            </th>
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
                <SpotifyArtistButton :artistName="asignation.disc.artist.name" />
                <button
                  @click="copyToClipboard(asignation.disc.image)"
                  class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <i class="fa-solid fa-copy"></i>
                </button>
                <input
                  type="checkbox"
                  :checked="asignation.done"
                  @change="toggleDone(asignation)"
                  class="form-checkbox h-5 w-5 text-green-500"
                />
                <button
                  @click="remove(asignation.id)"
                  class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useAsignationStore } from "@stores/asignation/asignation";
import { useUserStore } from "@stores/user/users";
import SpotifyArtistButton from "@components/SpotifyArtistButton.vue";
import SwalService from '@services/swal/SwalService';

export default defineComponent({
  name: "AsignationList",
  components: {
    SpotifyArtistButton,
  },
  setup() {
    const asignationStore = useAsignationStore();
    const usersStore = useUserStore();
    const asignations = ref<any[]>([]);

    watch(
      () => asignationStore.asignations,
      (newAsignations) => {
        asignations.value = [...newAsignations];
        console.log("Asignaciones sincronizadas:", asignations.value);
      },
      { immediate: true, deep: true }
    );

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
      navigator.clipboard.writeText(text).then(() => {
        SwalService.success("Enlace copiado al portapapeles");

      }).catch(err => {
        console.error("Error al copiar:", err);
      });
    };

    return {
      asignations,
      remove,
      toggleDone,
      copyToClipboard,
    };
  },
});
</script>