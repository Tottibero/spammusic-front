<template>
  <div class="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
    <div class="bg-white p-6 rounded-2xl shadow-md w-full max-w-5xl mb-6">
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-xl font-bold">Listas Actuales</h4>
        <button
          @click="goToCreate"
          class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full table-auto border-collapse">
          <thead class="bg-gray-200">
            <tr>
              <th class="px-4 py-2 text-left text-gray-600 font-medium">Nombre</th>
              <th class="px-4 py-2 text-left text-gray-600 font-medium">Tipo</th>
              <th class="px-4 py-2 text-left text-gray-600 font-medium">Estado</th>
              <th class="px-4 py-2 text-left text-gray-600 font-medium">Fecha de Lista</th>
              <th class="px-4 py-2 text-left text-gray-600 font-medium">Fecha de Lanzamiento</th>
              <th class="px-4 py-2 text-left text-gray-600 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in lists" :key="item.id" class="odd:bg-white even:bg-gray-50">
              <td class="px-4 py-2 border-t border-gray-200 text-gray-700">{{ item.name }}</td>
              <td class="px-4 py-2 border-t border-gray-200 text-gray-700">{{ item.type }}</td>
              <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
                <span :class="statusClass(item.status)" class="px-2 py-1 rounded-full text-xs font-bold">
                  {{ readableStatus(item.status) }}
                </span>
              </td>
              <td class="px-4 py-2 border-t border-gray-200 text-gray-700">{{ item.listDate }}</td>
              <td class="px-4 py-2 border-t border-gray-200 text-gray-700">{{ item.releaseDate }}</td>
              <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
                <button @click="goToEdit(item.id)" class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Diseño responsive para móviles -->
        <div v-for="item in lists" :key="item.id" class="sm:hidden bg-white p-4 rounded-lg shadow-md mb-4 w-full">
          <h5 class="text-lg font-semibold">{{ item.name }}</h5>
          <p><strong>Tipo:</strong> {{ item.type }}</p>
          <p><strong>Estado:</strong> <span :class="statusClass(item.status)" class="px-2 py-1 rounded-full text-xs font-bold">{{ readableStatus(item.status) }}</span></p>
          <p><strong>Fecha de Lista:</strong> {{ item.listDate }}</p>
          <p><strong>Fecha de Lanzamiento:</strong> {{ item.releaseDate }}</p>
          <div class="mt-2 flex justify-end">
            <button @click="goToEdit(item.id)" class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
          </div>
        </div>

      </div>
    </div>
    <div class="bg-white p-6 rounded-2xl shadow-md w-full max-w-5xl">
      <div class="mb-4 cursor-pointer" @click="togglePastLists">
        <h4 class="text-xl font-bold">Listas Pasadas</h4>
      </div>
      <div v-if="showPastLists" class="overflow-y-auto max-h-96">
        <ul>
          <li
            v-for="item in pastLists"
            :key="item.id"
            class="flex justify-between items-center py-2 border-b border-gray-200"          
            >
            <span class="text-gray-700">{{ item.name }}</span>
            <div class="flex space-x-2">
              {{ item.type }}
            </div>
            <div class="flex space-x-2">
              {{ item.listDate }}
            </div>
            <div class="flex space-x-2">
              {{ item.releaseDate }}
            </div>

            <div class="flex space-x-2">
              <a
                v-if="item.link"
                :href="item.link"
                target="_blank"
                class="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center space-x-1"
              >
                <i class="fa-solid fa-link"></i>
                <span>Ir al enlace</span>
              </a>
              <button
                @click="goToEdit(item.id)"
                class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-1"
              >
                <i class="fa-solid fa-pen-to-square"></i>
                <span>Editar</span>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { getLists } from "@services/list/list";
import { useRouter } from "vue-router";

const statusMap: Record<string, string> = {
  new: "New",
  assigned: "Assigned",
  completed: "Completed",
  revised: "Revised",
  withimage: "With Image",
  scheduled: "Scheduled",
  webpublished: "Web Published",
  smpublished: "Social Media Published",
};

export default defineComponent({
  name: "PaginatedTable",
  setup() {
    const lists = ref<any[]>([]);
    const pastLists = ref<any[]>([]);
    const showPastLists = ref(false);
    const router = useRouter();

    const fetchLists = async () => {
      try {
        const response = await getLists(20, 0, ["smpublished"]);
        lists.value = response.data;
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    };

    const fetchPastLists = async () => {
      try {
        const exclusions = Object.keys(statusMap).filter(
          (status) => status !== "smpublished"
        );
        const response = await getLists(20, 0, exclusions);
        pastLists.value = response.data;
      } catch (error) {
        console.error("Error fetching past lists:", error);
      }
    };

    const readableStatus = (status: string) => statusMap[status] || "Unknown";

    const statusClass = (status: string) => {
      const statusColors: Record<string, string> = {
        new: "bg-red-100 text-red-800",
        assigned: "bg-orange-100 text-orange-800",
        completed: "bg-yellow-100 text-yellow-800",
        revised: "bg-green-100 text-green-800",
        withimage: "bg-teal-100 text-teal-800",
        scheduled: "bg-blue-100 text-blue-800",
        webpublished: "bg-indigo-100 text-indigo-800",
        smpublished: "bg-purple-100 text-purple-800",
      };
      return statusColors[status] || "bg-gray-100 text-gray-800";
    };

    const goToEdit = (id: string) => {
      router.push({ name: "EditList", params: { id } });
    };

    const goToCreate = () => {
      router.push({ name: "CreateList" });
    };

    const togglePastLists = () => {
      showPastLists.value = !showPastLists.value;
    };

    onMounted(() => {
      fetchLists();
      fetchPastLists();
    });

    return {
      lists,
      pastLists,
      showPastLists,
      goToEdit,
      goToCreate,
      togglePastLists,
      readableStatus,
      statusClass,
    };
  },
});
</script>

<style scoped>
@media (max-width: 640px) {
  .table-auto {
    display: none;
  }
}
</style>
