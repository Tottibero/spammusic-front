<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Peticiones de Discos</h1>

    <div v-if="petitions.length === 0" class="text-center text-gray-500">
      No hay peticiones pendientes.
    </div>

    <ul v-else class="space-y-4">
      <li v-for="petition in petitions" :key="petition.id" class="bg-white border rounded-lg shadow-md p-4 flex flex-col sm:flex-row sm:items-center justify-between">
        <!-- Info -->
        <div class="mb-4 sm:mb-0">
          <p class="text-sm text-gray-500 mb-1">Fecha sugerida:</p>
          <p class="font-semibold">{{ petition.date }}</p>
          <p class="mt-2 text-sm text-gray-500 mb-1">Disco sugerido:</p>
          <p class="font-medium">{{ petition.text }}</p>
        </div>

        <!-- Acciones -->
        <div class="flex space-x-2">
          <button @click="acceptPetition(petition)" title="Aceptar"
            class="text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-full shadow">
            <i class="fa-solid fa-check"></i>
          </button>
          <button @click="rejectPetition(petition.id)" title="Denegar"
            class="text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-full shadow">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <button @click="openEditModal(petition)" title="Modificar"
            class="text-white bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-full shadow">
            <i class="fa-solid fa-pen"></i>
          </button>
        </div>
      </li>
    </ul>

    <!-- Modal para editar petición -->
    <div v-if="editingPetition" class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Editar petición</h2>
        <label class="block text-sm font-medium mb-1">Fecha</label>
        <input type="date" v-model="editForm.date" class="w-full border rounded px-3 py-2 mb-3" />
        <label class="block text-sm font-medium mb-1">Texto</label>
        <textarea rows="4" v-model="editForm.text" class="w-full border rounded px-3 py-2 mb-4"></textarea>

        <div class="flex justify-end space-x-2">
          <button @click="editingPetition = null" class="bg-gray-200 px-4 py-2 rounded">Cancelar</button>
          <button @click="saveEdit" class="bg-blue-500 text-white px-4 py-2 rounded">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'PetitionsPage',
  setup() {
    const petitions = ref([
      { id: '1', date: '2025-06-28', text: 'Lauren Babic – Too Much and Never Enough (EP)' },
      { id: '2', date: '2025-06-30', text: 'Decrepid – Suffered Existence' },
    ]);

    const editingPetition = ref(null as null | { id: string; date: string; text: string });
    const editForm = ref({ date: '', text: '' });

    const openEditModal = (petition: any) => {
      editingPetition.value = petition;
      editForm.value = { date: petition.date, text: petition.text };
    };

    const saveEdit = () => {
      if (editingPetition.value) {
        const index = petitions.value.findIndex(p => p.id === editingPetition.value!.id);
        if (index !== -1) {
          petitions.value[index].date = editForm.value.date;
          petitions.value[index].text = editForm.value.text;
        }
        editingPetition.value = null;
      }
    };

    const rejectPetition = (id: string) => {
      petitions.value = petitions.value.filter(p => p.id !== id);
    };

    const acceptPetition = (petition: any) => {
      console.log('Proceder con:', petition);
      // Aquí iría la llamada a la API del importador existente
      rejectPetition(petition.id);
    };

    return {
      petitions,
      editingPetition,
      editForm,
      openEditModal,
      saveEdit,
      rejectPetition,
      acceptPetition,
    };
  },
});
</script>

<style scoped>
/***** Aquí puedes añadir animaciones si deseas para el modal *****/
</style>
