<!-- ReunionManager.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-end mb-4">
      <button
        @click="toggleForm"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Añadir Reunión
      </button>
    </div>

    <div v-if="showForm" class="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
      <h2 class="text-lg font-semibold mb-4">Crear Reunión</h2>
      <form @submit.prevent="createReunion" class="space-y-4">
        <div>
          <label for="titulo" class="block font-medium">Título</label>
          <input
            v-model="formData.titulo"
            type="text"
            id="titulo"
            class="w-full p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label for="fecha" class="block font-medium">Fecha</label>
          <input
            v-model="formData.fecha"
            type="datetime-local"
            id="fecha"
            class="w-full p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="toggleForm"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Crear Reunión
          </button>
        </div>
      </form>
    </div>

    <ReunionTable
      title="Reuniones Actuales"
      :reuniones="reunionesPresentes"
      @edit="navigateToEditReunion"
    />

    <div class="mt-6">
      <button
        @click="togglePast"
        class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        {{ showPast ? "Ocultar Pasadas" : "Ver Pasadas" }}
      </button>
      <div v-if="showPast" class="mt-4">
        <ReunionTable
          title="Reuniones Pasadas"
          :reuniones="reunionesPasadas"
          @edit="navigateToEditReunion"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ReunionTable from "./components/ReunionTable.vue";
import { postReunion, getReunions } from "@services/reunions/reunions";
import SwalService from "@services/swal/SwalService";

export default {
  components: { ReunionTable },
  data() {
    return {
      showForm: false,
      showPast: false,
      formData: { titulo: "", fecha: "" },
      reuniones: [],
    };
  },
  computed: {
    reunionesPresentes() {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Establecer a la medianoche para comparar solo la fecha

      return this.reuniones.filter((r) => {
        const fechaReunion = new Date(r.fecha);
        fechaReunion.setHours(0, 0, 0, 0);
        return fechaReunion >= hoy;
      });
    },

    reunionesPasadas() {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Establecer a la medianoche para comparar solo la fecha

      return this.reuniones.filter((r) => {
        const fechaReunion = new Date(r.fecha);
        fechaReunion.setHours(0, 0, 0, 0);
        return fechaReunion < hoy;
      });
    },
  },
  methods: {
    navigateToEditReunion(id) {
      this.$router.push({ name: "EditReunion", params: { id } });
    },
    toggleForm() {
      this.showForm = !this.showForm;
    },
    togglePast() {
      this.showPast = !this.showPast;
    },
    async createReunion() {
      try {
        const response = await postReunion({
          ...this.formData,
          fecha: new Date(this.formData.fecha),
        });
        await this.reuniones.push(response.data);
        this.formData.titulo = "";
        this.formData.fecha = "";
        this.toggleForm();
        SwalService.success("Reunión creada con éxito.");
        this.fetchReuniones();
      } catch (error) {
        SwalService.error("No se pudo crear la reunión.");
      }
    },
    async fetchReuniones() {
      try {
        const response = await getReunions();
        this.reuniones = response;
      } catch (error) {
        SwalService.error("No se pudieron obtener las reuniones.");
      }
    },
  },
  mounted() {
    this.fetchReuniones();
  },
};
</script>
