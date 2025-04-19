<template>
  <div class="p-4 bg-white rounded-md shadow">
    <h2 class="text-lg font-bold mb-4">Lista</h2>

    <!-- Botón para mostrar formulario -->
    <div class="mb-6">
      <button
        @click="showCreateForm = !showCreateForm"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        {{ showCreateForm ? "Cancelar" : "➕ Nueva Asignación" }}
      </button>
    </div>

    <!-- Formulario de creación -->
    <form
      v-if="showCreateForm"
      @submit.prevent="createAsignation"
      class="space-y-4 mb-6"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Usuario</label
        >
        <select
          v-model="form.userId"
          class="w-full border border-gray-300 rounded p-2"
        >
          <option value="">-- Sin asignar usuario --</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.username }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Descripción</label
        >
        <textarea
          v-model="form.description"
          rows="3"
          class="w-full border border-gray-300 rounded p-2"
          placeholder="Describe la asignación"
        ></textarea>
      </div>


      <div class="flex space-x-2">
        <button
          type="submit"
          class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Crear Asignación
        </button>
        <button
          type="button"
          @click="showCreateForm = false"
          class="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Cancelar
        </button>
      </div>
    </form>

    <!-- Lista de asignaciones -->
    <div>
      <h3 class="text-md font-semibold mb-2">Asignaciones Creadas</h3>
      <div v-if="asignations.length === 0" class="text-gray-500">
        No hay asignaciones creadas todavía.
      </div>
      <ul class="space-y-2">
        <li
          v-for="(asignation, index) in asignations"
          :key="index"
          class="p-2 bg-gray-50 rounded-md flex flex-col space-y-2"
        >
          <div class="flex items-center justify-between">
            <input
              type="checkbox"
              :checked="asignation.done"
              @change="toggleDone(asignation)"
              class="form-checkbox h-5 w-5 text-indigo-600"
            />

            <div class="flex space-x-2">
              <button
                v-if="editingId !== asignation.id"
                @click="startEditing(asignation)"
                class="bg-indigo-500 text-white text-sm px-3 py-1 rounded hover:bg-indigo-600"
              >
                Editar
              </button>

              <button
                @click="deleteAsignation(asignation.id)"
                class="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>

          <div
            v-if="editingId === asignation.id"
            class="flex flex-col space-y-2 mt-2"
          >
            <select v-model="editForm.userId" class="border p-2 rounded">
              <option value="">-- Sin asignar usuario --</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.username }}
              </option>
            </select>

            <textarea
              v-model="editForm.description"
              rows="2"
              class="border p-2 rounded"
              placeholder="Descripción"
            ></textarea>

            <div class="flex space-x-2">
              <button
                @click="saveEdit(asignation.id)"
                class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Guardar
              </button>
              <button
                @click="cancelEditing"
                class="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>

          <div v-else class="mt-2">
            <span class="font-semibold">Usuario:</span>
            {{ asignation.user?.username || "N/A" }} <br />
            <span class="font-semibold">Descripción:</span>
<p v-html="formatTextWithLineBreaks(asignation.description)"></p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from "vue";
import { getUsers } from "@services/users/users";
import SwalService from "@services/swal/SwalService";
import {
  postAsignationService,
  updateAsignationService,
  deleteAsignationService,
} from "@services/asignation/asignation";

export default defineComponent({
  name: "SpecialAsignationForm",
  props: {
    listId: {
      type: String,
      required: true,
    },
    asignations: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const users = ref<any[]>([]);
    const asignations = ref<any[]>([]);
    const editingId = ref<string | null>(null);
    const editForm = ref({
      userId: "",
      description: "",
    });

    const showCreateForm = ref(false); // <<<<<<<<<<< AÑADIR ESTO

    const form = ref({
      userId: "",
      description: "",
      done: false,
    });

    const formatTextWithLineBreaks = (text: string): string => {
  return text.replace(/\n/g, "<br>");
};

    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        users.value = response;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const createAsignation = async () => {
      try {
        const newAsignationData = {
          userId: form.value.userId || null,
          description: form.value.description || "",
          done: form.value.done,
          listId: props.listId,
        };
        const response = await postAsignationService(newAsignationData);
        asignations.value.push(response);

        // Limpiar formulario
        form.value.userId = "";
        form.value.description = "";
        form.value.done = false;

        // Ocultar el formulario después de crear
        showCreateForm.value = false;

        SwalService.success("Asignación creada con éxito!");
      } catch (error) {
        console.error("Error creating asignation:", error);
      }
    };

    const startEditing = (asignation: any) => {
      editingId.value = asignation.id;
      editForm.value = {
        userId: asignation.user?.id || "",
        description: asignation.description,
      };
    };

    const cancelEditing = () => {
      editingId.value = null;
      editForm.value = {
        userId: "",
        description: "",
      };
    };

    const saveEdit = async (id: string) => {
      try {
        const updatedAsignationData = {
          userId: editForm.value.userId || null,
          description: editForm.value.description,
        };

        await updateAsignationService(id, updatedAsignationData);

        // Una vez actualizado en backend, ahora actualizamos en frontend
        const index = asignations.value.findIndex((a) => a.id === id);

        if (index !== -1) {
          const updatedUser = users.value.find(
            (u) => u.id === editForm.value.userId
          );

          // Actualizamos directamente en el array local
          asignations.value[index] = {
            ...asignations.value[index],
            userId: editForm.value.userId,
            description: editForm.value.description,
            user: updatedUser ?? asignations.value[index].user, // si no encuentra usuario, deja el que tenía
          };
        }

        SwalService.success("Asignación actualizada con éxito!");
        cancelEditing();
      } catch (error) {
        console.error("Error updating asignation:", error);
        SwalService.error("Error actualizando asignación");
      }
    };

    const toggleDone = async (asignation: any) => {
      try {
        const newDone = !asignation.done; // inverso del actual

        await updateAsignationService(asignation.id, { done: newDone });

        const index = asignations.value.findIndex(
          (a) => a.id === asignation.id
        );
        if (index !== -1) {
          asignations.value[index].done = newDone;
        }

        SwalService.success("Estado actualizado");
      } catch (error) {
        console.error("Error toggling done:", error);
        SwalService.error("Error actualizando estado");
      }
    };

    const deleteAsignation = async (id: string) => {
      try {
        const confirm = window.confirm(
          "¿Seguro que quieres borrar esta asignación?"
        );
        if (!confirm) return;

        await deleteAsignationService(id);

        asignations.value = asignations.value.filter((a) => a.id !== id);

        SwalService.success("Asignación eliminada con éxito!");
      } catch (error) {
        console.error("Error deleting asignation:", error);
        SwalService.error("Error eliminando asignación");
      }
    };

    watch(
      () => props.asignations,
      (newAsignations) => {
        if (newAsignations) {
          asignations.value = [...newAsignations];
        }
      },
      { immediate: true, deep: true }
    );

    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      form,
      asignations,
      createAsignation,
      editingId,
      editForm,
      startEditing,
      cancelEditing,
      saveEdit,
      toggleDone,
      showCreateForm,
      deleteAsignation,
      formatTextWithLineBreaks
    };
  },
});
</script>
