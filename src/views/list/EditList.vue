<template>
  <div
    class="p-6 bg-gray-100 min-h-screen grid grid-cols-1 gap-6 items-start"
    v-if="!loading"
  >
    <!-- Formulario de edición -->
    <div class="bg-white p-4 rounded-2xl shadow-md">
      <h3 class="text-lg font-bold mb-4">Info de la Lista</h3>
      <form @submit.prevent="submitForm" class="space-y-2">
        <!-- Compact Name and Type -->
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label for="name" class="text-sm font-medium text-gray-700"
              >Name</label
            >
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter list name"
              required
            />
          </div>
          <div>
            <label for="type" class="text-sm font-medium text-gray-700"
              >Type</label
            >
            <select
              id="type"
              v-model="form.type"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option disabled value="">Select a type</option>
              <option :value="ListType.MONTH">Month</option>
              <option :value="ListType.WEEK">Week</option>
              <option :value="ListType.SPECIAL">Special</option>
            </select>
          </div>
        </div>

        <!-- Compact Dates -->
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label for="specialDate" class="text-sm font-medium text-gray-700"
              >List Date</label
            >
            <input
              id="specialDate"
              v-model="form.listDate"
              type="date"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label for="releaseDate" class="text-sm font-medium text-gray-700"
              >Release Date</label
            >
            <input
              id="releaseDate"
              v-model="form.releaseDate"
              type="date"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <!-- Compact Link and Status -->
        <div class="grid grid-cols-2 gap-2 items-center">
          <div class="flex items-center">
            <div class="flex-grow">
              <label for="link" class="text-sm font-medium text-gray-700"
                >Link</label
              >
              <input
                id="link"
                v-model="form.link"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter a link (optional)"
              />
            </div>
            <button
              v-if="form.link"
              type="button"
              @click="openLink"
              class="ml-2 bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
            <i class="fa-solid fa-file"></i>
            </button>
          </div>
          <div class="flex items-center">
            <p class="text-sm text-gray-700">Status: {{ form.status }}</p>
          </div>
        </div>

        <!-- Compact Buttons -->
        <div class="grid grid-cols-2 gap-2">
          <button
            type="submit"
            class="bg-indigo-600 text-white py-1 px-2 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Update List
          </button>
          <button
            type="button"
            @click="assignForm"
            class="bg-green-500 text-white py-1 px-2 rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Asignar
          </button>
        </div>
      </form>
    </div>

    <!-- Tabla de discos -->
    <AsignationList />

    <!-- Listado de Discos por Fecha -->
    <div class="bg-white p-6 rounded-2xl shadow-md">
      <h3 class="text-lg font-bold mb-4">Listado de Discos por Fecha</h3>
      <DiscsByDate :date="form.listDate" :type="form.type" :list-id="id" />
    </div>
  </div>

  <div v-else class="flex items-center justify-center min-h-screen">
    <p class="text-lg font-medium text-gray-500">Cargando datos...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from "vue";
import { getListDetails, updateList } from "@services/list/list";
import DiscsByDate from "./components/DiscByDate.vue";
import AsignationList from "./components/AsignationList.vue";
import { useAsignationStore } from "@stores/asignation/asignation";
import { useUserStore } from "@stores/user/users";
import SwalService from '@services/swal/SwalService';

export enum ListType {
  MONTH = "month",
  WEEK = "week",
  SPECIAL = "special",
}

export default defineComponent({
  name: "EditListForm",
  components: { DiscsByDate, AsignationList },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const form = reactive({
      name: "",
      type: "",
      listDate: "",
      link: "",
      status: "",
      releaseDate: "",
    });

    const loading = ref(true);
    const asignationStore = useAsignationStore();
    const userStore = useUserStore();

    const loadListDetails = async () => {
      try {
        const details = await getListDetails(props.id);
        Object.assign(form, details); // Pre-fill form with list details
      } catch (error) {
        console.error("Error fetching list details:", error);
        SwalService.success('Unable to load list details. Please try again');
      } finally {
        loading.value = false; // Stop loading after fetching data
      }
    };

    const submitForm = async () => {
      try {
        console.log("Updating list with data:", form);
        const response = await updateList(props.id, {
          name: form.name,
          type: form.type,
          listDate: form.listDate || null,
          releaseDate: form.releaseDate || null,
          link: form.link || null,
          status: form.status,
        });
        console.log("List updated successfully:", response);
        SwalService.success('List updated successfully!');
      } catch (error) {
        console.error("Error updating list:", error);
        SwalService.error('An error occurred while updating the list. Please try again.');
      }
    };

    const assignForm = () => {
      console.log("Asignar formulario con datos:", form);
      // Lógica adicional para asignar
    };

    const openLink = () => {
      if (form.link) {
        window.open(form.link, "_blank");
      } else {
        SwalService.error('No link provided!');
      }
    };

    onMounted(async () => {
      loadListDetails();
      await asignationStore.loadAsignations(props.id);
      await userStore.loadUsers();
    });

    return {
      form,
      loading,
      submitForm,
      assignForm,
      ListType,
      openLink
    };
  },
});
</script>
