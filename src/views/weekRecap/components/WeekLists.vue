<template>
    <div class="space-y-6">
      <!-- Listas -->
      <div
        v-for="item in lists"
        :key="item.id"
        class="p-6 bg-white shadow-md rounded-lg border border-gray-200"
      >
        <!-- Información de la lista -->
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-800">{{ item.name }}</h3>
            <!-- Información en línea -->
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <p>
                <span class="font-semibold">Tipo:</span> {{ item.type }}
              </p>
              <p>
                <span class="font-semibold">Estado:</span> {{ item.status }}
              </p>
              <p>
                <span class="font-semibold">Fecha de Lanzamiento:</span> {{ item.releaseDate }}
              </p>
            </div>
          </div>
          <button
            @click="goToEdit(item.id)"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Editar
          </button>
        </div>
  
        <!-- Tabla de asignaciones -->
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Discos:</h4>
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="border border-gray-300 px-2 py-1 text-left">Artista</th>
                <th class="border border-gray-300 px-2 py-1 text-left">Disco</th>
                <th class="border border-gray-300 px-2 py-1 text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="assignment in item.asignations"
                :key="assignment.id"
                class="odd:bg-white even:bg-gray-50"
              >
                <td class="border border-gray-300 px-2 py-1">
                  {{ assignment.disc.artist.name }}
                </td>
                <td class="border border-gray-300 px-2 py-1">
                  {{ assignment.disc.name }}
                </td>
                <td class="border border-gray-300 px-2 py-1 text-center">
                  <div class="flex items-center justify-center space-x-4">
                    <!-- Spotify link -->
                    <a
                      v-if="assignment.disc.link"
                      :href="assignment.disc.link"
                      target="_blank"
                      class="text-green-600"
                    >
                      <i class="fa-brands fa-spotify"></i>
                    </a>
                    <!-- Checkbox -->
                    <input
                      type="checkbox"
                      :checked="assignment.done"
                      @change="handleCheck(assignment.user.id, assignment)"
                      class="w-4 h-4"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from "vue";
  import { getLists } from "@services/list/list";
  import { useRouter } from "vue-router";
  
  export default defineComponent({
    name: "StyledList",
    setup() {
      const lists = ref<any[]>([]);
      const router = useRouter();
  
      // Llamada para obtener listas
      const fetchLists = async () => {
        try {
          const response = await getLists(100,0);
          lists.value = response.data;
        } catch (error) {
          console.error("Error fetching lists:", error);
        }
      };
  
      // Redirige al editor de la lista seleccionada
      const goToEdit = (id: string) => {
        router.push({ name: "EditList", params: { id } });
      };
  
      // Maneja el checkbox
      const handleCheck = (userId: string, assignment: any) => {
        console.log("Usuario ID:", userId);
        console.log("Assignment:", assignment);
      };
  
      onMounted(() => {
        fetchLists();
      });
  
      return {
        lists,
        goToEdit,
        handleCheck,
      };
    },
  });
  </script>
  
  <style scoped></style>
  