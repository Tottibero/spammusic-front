<!-- ReunionManager.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Formulario de creación (modal) -->
    <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="toggleForm">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-lg font-semibold mb-4">Crear Reunión</h2>
        <form @submit.prevent="createReunion" class="space-y-4">
          <div>
            <label for="title" class="block font-medium">Título</label>
            <input v-model="formData.title" type="text" id="title" class="w-full p-2 border border-gray-300 rounded-lg"
              required />
          </div>
          <div>
            <label for="date" class="block font-medium">Fecha</label>
            <input v-model="formData.date" type="datetime-local" id="date"
              class="w-full p-2 border border-gray-300 rounded-lg" required />
          </div>
          <div class="flex justify-end space-x-4">
            <button type="button" @click="toggleForm"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              Cancelar
            </button>
            <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              Crear Reunión
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Contenido principal: Scroll vertical -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Reuniones Actuales -->
      <div class="mb-8">
        <ReunionTable title="Reuniones Actuales" :reuniones="reunionesPresentes" @edit="openEditModal"
          @update="handleReunionUpdate" />
      </div>

      <!-- Reuniones Pasadas -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">Reuniones Pasadas</h2>
          <span class="text-sm text-gray-500">{{ reunionesPasadas.length }} reuniones</span>
        </div>

        <!-- Navegación por selects -->
        <div v-if="reunionesPasadas.length > 0">
          <!-- Selects de Año y Mes -->
          <div class="flex gap-3 mb-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <select v-model="selectedYear" class="select select-bordered w-full">
                <option :value="null">Selecciona un año</option>
                <option v-for="ano in anosDisponibles" :key="ano" :value="ano">
                  {{ ano }}
                </option>
              </select>
            </div>

            <div class="flex-1" v-if="selectedYear">
              <label class="block text-sm font-medium text-gray-700 mb-1">Mes</label>
              <select v-model="selectedMonth" class="select select-bordered w-full">
                <option :value="null">Selecciona un mes</option>
                <option v-for="mes in mesesDisponibles" :key="mes" :value="mes">
                  {{ getNombreMes(mes) }}
                </option>
              </select>
            </div>
          </div>

          <!-- Reuniones del mes seleccionado -->
          <div v-if="selectedMonth !== null" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="reunion in reunionesFiltradas" :key="reunion.id"
              class="border border-gray-300 rounded-lg p-4 bg-white hover:shadow-lg cursor-pointer transition-all"
              @click="openEditModal(reunion.id)">
              <h4 class="font-bold text-gray-900">{{ reunion.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ formatDate(reunion.date) }}</p>
              <div v-if="reunion.points && reunion.points.length > 0" class="mt-2 pt-2 border-t border-gray-200">
                <p class="text-xs text-gray-500 mb-1">{{ reunion.points.length }} puntos</p>
                <div class="flex gap-1">
                  <span v-for="point in reunion.points.slice(0, 5)" :key="point.id">
                    <i class="fa-solid fa-check text-green-600 text-xs" v-if="point.done"></i>
                    <i class="fa-regular fa-circle text-gray-400 text-xs" v-else></i>
                  </span>
                  <span v-if="reunion.points.length > 5" class="text-xs text-gray-500">+{{ reunion.points.length - 5
                    }}</span>
                </div>
              </div>
              <button
                class="w-full mt-3 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center justify-center gap-2">
                <i class="fa-solid fa-eye"></i>
                <span>Ver Detalle</span>
              </button>
            </div>
          </div>

          <div v-else-if="selectedYear" class="text-center py-8 text-gray-400">
            <i class="fa-solid fa-calendar-xmark text-4xl mb-2"></i>
            <p>Selecciona un mes para ver las reuniones</p>
          </div>

          <div v-else class="text-center py-8 text-gray-400">
            <i class="fa-solid fa-calendar text-4xl mb-2"></i>
            <p>Selecciona un año para comenzar</p>
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-400">
          <i class="fa-solid fa-inbox text-4xl mb-2"></i>
          <p>No hay reuniones pasadas</p>
        </div>
      </div>
    </div>

    <!-- Modal de edición -->
    <ReunionEditModal :show="showEditModal" :reunionId="selectedReunionId" @close="closeEditModal"
      @updated="handleReunionUpdated" />
  </div>
</template>

<script>
import ReunionTable from "./components/ReunionTable.vue";
import ReunionEditModal from "./components/ReunionEditModal.vue";
import { postReunion, getReunions } from "@services/reunions/reunions";
import SwalService from "@services/swal/SwalService";

export default {
  components: { ReunionTable, ReunionEditModal },
  data() {
    return {
      showForm: false,
      showEditModal: false,
      selectedReunionId: null,
      formData: { title: "", date: "" },
      reuniones: [],
      selectedYear: null,
      selectedMonth: null,
    };
  },
  computed: {
    reunionesPresentes() {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      return this.reuniones.filter((r) => {
        const fechaReunion = new Date(r.date);
        fechaReunion.setHours(0, 0, 0, 0);
        return fechaReunion >= hoy;
      });
    },

    reunionesPasadas() {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      return this.reuniones.filter((r) => {
        const fechaReunion = new Date(r.date);
        fechaReunion.setHours(0, 0, 0, 0);
        return fechaReunion < hoy;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    anosDisponibles() {
      const anos = new Set();
      this.reunionesPasadas.forEach(r => {
        anos.add(new Date(r.date).getFullYear());
      });
      return Array.from(anos).sort((a, b) => b - a);
    },

    mesesDisponibles() {
      if (!this.selectedYear) return [];

      const meses = new Set();
      this.reunionesPasadas.forEach(r => {
        const fecha = new Date(r.date);
        if (fecha.getFullYear() === this.selectedYear) {
          meses.add(fecha.getMonth());
        }
      });
      return Array.from(meses).sort((a, b) => b - a);
    },

    reunionesFiltradas() {
      if (this.selectedYear === null || this.selectedMonth === null) return [];

      return this.reunionesPasadas.filter(r => {
        const fecha = new Date(r.date);
        return fecha.getFullYear() === this.selectedYear && fecha.getMonth() === this.selectedMonth;
      });
    }
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    getNombreMes(mesIndex) {
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return meses[mesIndex];
    },
    openEditModal(id) {
      this.selectedReunionId = id;
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.selectedReunionId = null;
    },
    handleReunionUpdated() {
      this.fetchReuniones();
    },
    handleReunionUpdate(updatedReunion) {
      const index = this.reuniones.findIndex(r => r.id === updatedReunion.id);
      if (index !== -1) {
        // Usamos splice para asegurar la reactividad en Vue 2/3
        this.reuniones.splice(index, 1, updatedReunion);
      }
    },
    toggleForm() {
      this.showForm = !this.showForm;
    },
    async createReunion() {
      try {
        const response = await postReunion({
          title: this.formData.title,
          date: this.formData.date,
        });
        await this.reuniones.push(response);
        this.formData.title = "";
        this.formData.date = "";
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

        // Auto-seleccionar el año más reciente si hay reuniones pasadas
        if (this.anosDisponibles.length > 0 && !this.selectedYear) {
          this.selectedYear = this.anosDisponibles[0];
        }
      } catch (error) {
        console.error("Error al cargar reuniones:", error);
        SwalService.error("No se pudieron obtener las reuniones.");
      }
    },
  },
  watch: {
    selectedYear(newYear) {
      // Reset mes cuando cambia el año
      this.selectedMonth = null;
      // Auto-seleccionar el mes más reciente
      if (this.mesesDisponibles.length > 0) {
        this.selectedMonth = this.mesesDisponibles[0];
      }
    }
  },
  mounted() {
    this.fetchReuniones();
  }
};
</script>

<style scoped>
/* Estilos personalizados si son necesarios */
</style>
