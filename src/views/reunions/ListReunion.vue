<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Botón para mostrar el formulario -->
    <div class="flex justify-end mb-4">
      <button
        @click="toggleForm"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Añadir Reunión
      </button>
    </div>

    <!-- Formulario para crear reuniones -->
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
            placeholder="Ingresa el título de la reunión"
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

    <!-- Listado de reuniones -->
    <div>
      <h2 class="text-xl font-bold mb-4">Listado de Reuniones</h2>
      <ul class="space-y-4">
        <li
          v-for="reunion in reuniones"
          :key="reunion.id"
          class="border border-gray-300 rounded-lg p-4 bg-white shadow-md"
        >
          <div class="flex justify-between items-center">
            <div>
              <button
                @click="navigateToEditReunion(reunion.id)"
                class="mr-5 px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <strong class="text-lg">{{ reunion.titulo }}</strong>
              <p class="text-sm text-gray-600">
                {{ formatDate(reunion.fecha) }}
              </p>
            </div>
            <button
              @click="togglePoints(reunion.id)"
              class="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {{
                expandedReunion === reunion.id ? "Ocultar Puntos" : "Ver Puntos"
              }}
            </button>
          </div>
          <!-- Puntos de la reunión -->
          <ul
            v-if="expandedReunion === reunion.id"
            class="mt-4 space-y-2 border-t border-gray-200 pt-4"
          >
            <li
              v-for="point in reunion.points"
              :key="point.id"
              class="bg-gray-100 p-3 rounded-lg"
            >
              <div class="flex justify-between items-center">
                <div>
                  <input class="mr-5" :checked="point.done" type="checkbox" name="done" id="done" disabled>
                  <strong>{{ point.titulo }}</strong>
                </div>
                <button
                  @click="toggleContent(point.id)"
                  class="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  {{
                    expandedPoint === point.id
                      ? "Ocultar Contenido"
                      : "Ver Contenido"
                  }}
                </button>
              </div>
              <!-- Contenido del punto -->
              <div
                v-if="expandedPoint === point.id"
                class="mt-2 p-2 bg-white border border-gray-300 rounded-lg"
              >
                {{ point.content }}
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";

export default {
  name: "ReunionManager",
  data() {
    return {
      showForm: false, // Estado para mostrar/ocultar el formulario
      expandedReunion: null, // ID de la reunión expandida para ver puntos
      expandedPoint: null, // ID del punto expandido para ver contenido
      formData: {
        titulo: "",
        fecha: "",
      },
      reuniones: [],
    };
  },
  methods: {
    navigateToEditReunion(id) {
      this.$router.push({ name: "EditReunion", params: { id } });
    },
    toggleForm() {
      this.showForm = !this.showForm;
    },
    togglePoints(reunionId) {
      this.expandedReunion =
        this.expandedReunion === reunionId ? null : reunionId;
    },
    toggleContent(pointId) {
      this.expandedPoint = this.expandedPoint === pointId ? null : pointId;
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    async createReunion() {
      try {
        const payload = {
          ...this.formData,
          fecha: new Date(this.formData.fecha), // Convertir fecha a objeto Date
        };
        const response = await axios.post(
          "http://localhost:3000/api/reunions",
          payload
        );
        this.reuniones.push(response.data); // Agregar la reunión a la lista
        this.formData.titulo = "";
        this.formData.fecha = "";
        this.toggleForm(); // Ocultar el formulario después de crear la reunión
        alert("Reunión creada con éxito.");
      } catch (error) {
        console.error("Error al crear la reunión:", error);
        alert("No se pudo crear la reunión.");
      }
    },
    async fetchReuniones() {
      try {
        const response = await axios.get("http://localhost:3000/api/reunions");
        this.reuniones = response.data;
      } catch (error) {
        console.error("Error al obtener las reuniones:", error);
        alert("No se pudieron obtener las reuniones.");
      }
    },
  },
  mounted() {
    this.fetchReuniones();
  },
};
</script>

<style>
.container {
  font-family: Arial, sans-serif;
}
</style>
