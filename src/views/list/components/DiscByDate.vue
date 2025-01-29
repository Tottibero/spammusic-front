<template>
  <div class="max-w-7xl mx-auto mt-10">
    <h3 class="text-2xl font-bold mb-8 text-center">
      Discs for {{ type === "month" ? "Month" : "Week" }}: {{ formattedDate }}
    </h3>
    <div
      v-if="discs.length === 0 && !loading"
      class="text-center text-gray-500"
    >
      No discs found for the selected {{ type }}.
    </div>
    <div v-else>
      <!-- Lista de discos agrupados -->
      <div
        v-for="(group, index) in discs"
        :key="group.start || group.releaseDate"
        class="mb-8"
      >
        <!-- Encabezado del grupo -->
        <div
          class="flex justify-between items-center bg-gray-200 px-4 py-2 rounded cursor-pointer"
          @click="toggleGroup(index)"
        >
          <h3 class="text-xl font-bold">
            {{ type === "week" ? `${group.start}` : group.releaseDate }}
          </h3>
          <i
            :class="
              groupState[index] ? 'fas fa-chevron-up' : 'fas fa-chevron-down'
            "
            class="text-xl"
          ></i>
        </div>

        <!-- Contenido del grupo -->
        <transition name="fade-slide" mode="out-in">
          <div v-if="groupState[index]" class="mt-4">
            <ul>
              <li
                v-for="disc in group.discs"
                :key="disc.id"
                class="flex justify-between items-center p-4 border-b"
              >
                <div class="flex items-center">
                  <div
                    v-if="disc.genre?.color"
                    :style="{ backgroundColor: disc.genre.color }"
                    class="w-4 h-4 rounded-full mr-2"
                  ></div>
                  <h4 class="text-md font-semibold">
                    {{ disc.artist.name }} - {{ disc.name }}
                  </h4>
                </div>
                <p class="text-sm text-gray-500">
                  Genre: {{ disc.genre?.name || "Unknown" }}
                </p>
                <button
                  @click="abrirEnlaceArtista(disc.artist.name)"
                  class="bg-green-500 text-white px-4 py-2 rounded ml-2"
                >
                  Open Artist on Spotify
                </button>

                <!-- Selector de usuarios -->
                <select
                  v-model="selectedUser[disc.id]"
                  class="border rounded px-2 py-1 ml-4"
                >
                  <option value="" disabled>Select user</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.username }}
                  </option>
                </select>
                <!-- Botón de asignar -->
                <button
                  v-if="disc.hasExistingAsignation"
                  @click="updateAsignation(disc.id)"
                  class="bg-yellow-500 text-white px-4 py-2 rounded ml-2"
                >
                  Update
                </button>
                <button
                  v-else
                  @click="assignUser(disc.id)"
                  class="bg-blue-500 text-white px-4 py-2 rounded ml-2"
                >
                  Assign
                </button>
              </li>
            </ul>
          </div>
        </transition>
      </div>
    </div>
    <div ref="scrollObserver" class="h-1 text-center py-6">
      <span v-if="loading" class="text-gray-600">Loading more discs...</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from "vue";
import { getDiscsDated } from "@services/discs/discs";
import { getUsers } from "@services/users/users";
import SwalService from '@services/swal/SwalService';
import { obtenerEnlaceArtistaSpotify } from "@helpers/SpotifyFunctions";
import { postAsignationService } from "@services/asignation/asignation";
import { useAsignationStore } from "@stores/asignation/asignation";
import { updateAsignationService } from "@services/asignation/asignation";

export default defineComponent({
  name: "DiscsByDate",
  props: {
    date: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      validator: (value: string) => ["week", "month"].includes(value),
    },
    listId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const discs = ref<any[]>([]);
    const users = ref<any[]>([]);
    const groupState = reactive({});
    const loading = ref(false);
    const hasMore = ref(true);
    const page = ref(1);
    const limit = ref(50);
    const formattedDate = ref("");
    const scrollObserver = ref<HTMLDivElement | null>(null);
    const asignationStore = useAsignationStore();

    const selectedUser = reactive<{ [key: string]: string }>({}); // Selección de usuario por disco

    const fetchDiscs = async () => {
      if (loading.value || !hasMore.value) return;

      loading.value = true;
      try {
        const startDate = new Date(props.date);
        const endDate = new Date(props.date);

        if (props.type === "week") {
          const day = startDate.getUTCDay();
          const diff = startDate.getUTCDate() - day + (day === 0 ? -6 : 1);
          startDate.setUTCDate(diff);
          endDate.setUTCDate(startDate.getUTCDate() + 6);
        } else {
          startDate.setUTCDate(1);
          endDate.setUTCMonth(startDate.getUTCMonth() + 1);
          endDate.setUTCDate(0);
        }

        formattedDate.value =
          props.type === "week"
            ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            : startDate.toLocaleDateString("default", {
                month: "long",
                year: "numeric",
              });

        const offset = (page.value - 1) * limit.value;
        const response = await getDiscsDated(limit.value, offset, [
          startDate.toISOString(),
          endDate.toISOString(),
        ]);

        if (response.data.length === 0) {
          hasMore.value = false;
          return;
        }

        const updatedDiscs = response.data.map((group: any) => ({
          start:
            props.type === "week"
              ? new Date(group.releaseDate).toLocaleDateString()
              : null,
          end:
            props.type === "week"
              ? new Date(
                  new Date(group.releaseDate).setDate(
                    new Date(group.releaseDate).getDate() + 6
                  )
                ).toLocaleDateString()
              : null,
          releaseDate: props.type === "month" ? group.releaseDate : null,
          discs: group.discs,
        }));

        updatedDiscs.forEach((newGroup) => {
          const existingIndex = discs.value.findIndex((group) =>
            props.type === "week"
              ? group.start === newGroup.start && group.end === newGroup.end
              : group.releaseDate === newGroup.releaseDate
          );

          if (existingIndex !== -1) {
            discs.value[existingIndex].discs = [
              ...discs.value[existingIndex].discs,
              ...newGroup.discs,
            ];
          } else {
            discs.value.push(newGroup);
          }

          newGroup.discs.forEach((disc: any) => {
            const asignation = disc.asignations?.find(
              (asignation: any) => asignation.list.id === props.listId
            );

            if (asignation) {
              selectedUser[disc.id] = asignation.user.id;
              disc.hasExistingAsignation = true; // Marca que ya tiene una asignación
            } else {
              disc.hasExistingAsignation = false; // No tiene asignación
            }
          });
        });

        page.value++;
      } catch (error) {
        console.error("Error fetching discs:", error);
      } finally {
        loading.value = false;
      }
    };

    const fetchUsers = async () => {
      try {
        const usersResponse = await getUsers();
        users.value = usersResponse.sort((a, b) =>
          a.username.localeCompare(b.username)
        );
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const toggleGroup = (index: number) => {
      groupState[index] = !groupState[index];
    };

    const assignUser = async (discId: string) => {
      const userId = selectedUser[discId];
      if (userId) {
        try {
          console.log(
            `Assigned user ${userId} to disc ${discId} for list ${props.listId}`
          );
          const response = await postAsignationService({
            userId,
            discId,
            listId: props.listId,
          });

          // Muestra la respuesta del servidor
          console.log("Assignment created successfully:", response);

          // Actualiza la store con la nueva asignación
          asignationStore.addAsignation(response);

          // Encuentra el disco correspondiente y actualiza su estado
          const groupIndex = discs.value.findIndex((group) =>
            group.discs.some((disc: any) => disc.id === discId)
          );

          if (groupIndex !== -1) {
            const discIndex = discs.value[groupIndex].discs.findIndex(
              (disc: any) => disc.id === discId
            );
            if (discIndex !== -1) {
              discs.value[groupIndex].discs[discIndex].hasExistingAsignation =
                true;
            }
          }

          SwalService.success('Assignment created successfully.');
        } catch (error) {
          console.error("Error creating assignment:", error);
          SwalService.error('Failed to assign user. Please try again.');
        }
      } else {
        SwalService.error('Please select a user before assigning.');
      }
    };

    const removeAsignationFromDisc = (removedAsignation: any) => {
      console.log(
        "Removed Asignation:",
        JSON.stringify(removedAsignation, null, 2)
      );

      if (removedAsignation && removedAsignation.disc) {
        const discId = removedAsignation.disc.id;

        // Eliminar al usuario asignado del select
        if (selectedUser[discId]) {
          delete selectedUser[discId];
          console.log(`Removed selected user for disc: ${discId}`);
        }

        // Actualizar la propiedad `hasExistingAsignation`
        const groupIndex = discs.value.findIndex((group) =>
          group.discs.some((disc: any) => disc.id === discId)
        );

        if (groupIndex !== -1) {
          const discIndex = discs.value[groupIndex].discs.findIndex(
            (disc: any) => disc.id === discId
          );
          if (discIndex !== -1) {
            discs.value[groupIndex].discs[discIndex].hasExistingAsignation =
              false;
          }
        } else {
          console.warn(`No group or disc found for disc ID ${discId}`);
        }
      } else {
        console.error("Invalid removedAsignation structure or disc not found.");
      }
    };

    const observeScroll = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        fetchDiscs();
      }
    };

    const abrirEnlaceArtista = async (artistName: string) => {
      try {
        const enlace = await obtenerEnlaceArtistaSpotify(artistName);
        if (enlace) {
          window.open(enlace, "_blank");
        } else {
          SwalService.error('No se pudo encontrar el enlace del artista en Spotify.');
        }
      } catch (error) {
        console.error("Error al obtener el enlace del artista:", error);
        SwalService.error('Ocurrió un error al intentar abrir el enlace.');
      }
    };

    onMounted(() => {
      fetchUsers();
      fetchDiscs();
      const observer = new IntersectionObserver(observeScroll, {
        threshold: 1.0,
      });
      if (scrollObserver.value) observer.observe(scrollObserver.value);
    });

    // Watcher para detectar cambios en las asignaciones
    watch(
      () => asignationStore.asignations,
      (newAsignations, oldAsignations) => {
        const removedAsignation = oldAsignations.find(
          (oldA) => !newAsignations.find((newA) => newA.id === oldA.id)
        );

        if (removedAsignation) {
          console.log("Removed Asignation:", removedAsignation);
          removeAsignationFromDisc(removedAsignation);
        }
      },
      { deep: true }
    );

    const updateAsignation = async (discId: string) => {
      const userId = selectedUser[discId];

      // Encuentra el asignationId para el disco
      const group = discs.value.find((group) =>
        group.discs.some((disc: any) => disc.id === discId)
      );
      const disc = group?.discs.find((disc: any) => disc.id === discId);
      const asignationId = disc?.asignations?.find(
        (asignation: any) => asignation.list.id === props.listId
      )?.id;

      if (userId && asignationId) {
        try {
          console.log(
            `Updating assignment for user ${userId} to disc ${discId} with asignationId ${asignationId} for list ${props.listId}`
          );

          // Aquí deberías realizar la llamada al servicio de actualización
          const response = await asignationStore.updateAsignationStore({
            id: asignationId,
            userId,
            done: false
          });

          console.log("Assignment updated successfully:", response);

          SwalService.success('Assignment updated successfully.');
        } catch (error) {
          console.error("Error updating assignment:", error);
          SwalService.error('Failed to update assignment. Please try again.');
        }
      } else {
        SwalService.error("Please select a user and ensure the assignment exists before updating.");
      }
    };

    return {
      discs,
      groupState,
      loading,
      hasMore,
      page,
      formattedDate,
      toggleGroup,
      scrollObserver,
      users,
      selectedUser,
      assignUser,
      abrirEnlaceArtista, // Asegúrate de incluirlo aquí
      updateAsignation,
    };
  },
});
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.6s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-15px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
