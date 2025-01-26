<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h1 class="text-2xl font-bold mb-6">Listas</h1>

    <button
      @click="goToCreate"
      class="mb-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
    >
      Crear Nuevo
    </button>

    <table
      class="w-full table-auto bg-white shadow-md rounded-lg border-collapse"
    >
      <thead class="bg-gray-200">
        <tr>
          <th class="px-4 py-2 text-left text-gray-600 font-medium">ID</th>
          <th class="px-4 py-2 text-left text-gray-600 font-medium">Nombre</th>
          <th class="px-4 py-2 text-left text-gray-600 font-medium">Tipo</th>
          <th class="px-4 py-2 text-left text-gray-600 font-medium">Estado</th>
          <th class="px-4 py-2 text-left text-gray-600 font-medium">
            Fecha de Lista
          </th>
          <th class="px-4 py-2 text-left text-gray-600 font-medium">
            Fecha de Lanzamiento
          </th>
          <th class="px-4 py-2 text-left text-gray-600 font-medium">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in lists"
          :key="item.id"
          class="odd:bg-white even:bg-gray-50"
        >
          <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
            {{ item.id }}
          </td>
          <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
            {{ item.name }}
          </td>
          <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
            {{ item.type }}
          </td>
          <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
            {{ item.status }}
          </td>
          <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
            {{ item.listDate }}
          </td>
          <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
            {{ item.releaseDate }}
          </td>
          <td class="px-4 py-2 border-t border-gray-200 text-gray-700">
            <button
              @click="goToEdit(item.id)"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Editar
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-between items-center mt-6">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
      >
        Anterior
      </button>

      <div class="flex gap-2">
        <span
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          :class="{ 'bg-blue-500 text-white': page === currentPage }"
          class="cursor-pointer px-4 py-2 rounded-md border border-gray-300 hover:bg-blue-100"
        >
          {{ page }}
        </span>
      </div>

      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { getLists } from "@services/list/list";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "PaginatedTable",
  setup() {
    const lists = ref<any[]>([]);
    const totalItems = ref(0);
    const totalPages = ref(0);
    const currentPage = ref(1);
    const limit = 10; // Número de elementos por página
    const router = useRouter();

    const fetchLists = async (page: number) => {
      const offset = (page - 1) * limit;
      try {
        const response = await getLists(limit, offset);
        lists.value = response.data;
        totalItems.value = response.totalItems;
        totalPages.value = Math.ceil(response.totalItems / limit);
        currentPage.value = page;
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    };

    const goToPage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        fetchLists(page);
      }
    };

    const goToEdit = (id: string) => {
      if (!id) {
        console.error("ID is undefined");
        return;
      }
      router.push({ name: "EditList", params: { id } });
    };

    const goToCreate = () => {
      router.push({ name: "CreateList" });
    };

    onMounted(() => {
      fetchLists(currentPage.value);
    });

    return {
      lists,
      totalItems,
      totalPages,
      currentPage,
      goToPage,
      goToEdit,
      goToCreate,
    };
  },
});
</script>

<style scoped>
/***** Styling is handled with TailwindCSS *****/
</style>
