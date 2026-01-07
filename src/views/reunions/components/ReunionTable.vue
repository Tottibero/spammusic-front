// ReunionTable.vue
<template>
  <div>
    <h2 class="text-xl font-bold mb-4">{{ title }}</h2>
    <div class="space-y-4">
      <div v-for="reunion in reuniones" :key="reunion.id"
        class="border border-gray-300 rounded-lg p-4 bg-white shadow-md">
        <!-- Header de la tarjeta -->
        <div class="flex justify-between items-center mb-3 cursor-pointer" @click="toggleReunion(reunion.id)">
          <div class="flex items-baseline gap-3">
            <i class="fa-solid fa-chevron-down transition-transform duration-300 text-gray-400"
              :class="{ 'rotate-180': !isReunionCollapsed(reunion.id) }"></i>
            <strong class="text-lg">{{ reunion.title }}</strong>
            <p class="text-sm text-gray-600">{{ formatDate(reunion.date) }}</p>
          </div>
          <div class="flex gap-2">
            <button @click.stop="openAddPointModal(reunion.id)"
              class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
              title="Añadir punto">
              <i class="fa-solid fa-plus"></i>
              <span>Añadir</span>
            </button>
            <button @click.stop="reloadReunion(reunion.id)"
              class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
              title="Recargar">
              <i class="fa-solid fa-rotate-right"></i>
              <span>Recargar</span>
            </button>
          </div>
        </div>

        <!-- Lista de puntos -->
        <div v-show="!isReunionCollapsed(reunion.id)" class="space-y-2">
          <div v-for="point in reunion.points" :key="point.id"
            class="border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors">
            <div class="flex items-start gap-2">
              <!-- Checkbox de completado -->
              <input type="checkbox" :checked="point.done" @change="togglePointDone(reunion.id, point)"
                class="mt-1 rounded cursor-pointer" title="Marcar como completado" />

              <!-- Título (expandible) -->
              <div class="flex-1 cursor-pointer" @click="togglePoint(point.id)">
                <p class="text-sm font-medium text-gray-900">{{ point.titulo }}</p>
              </div>

              <!-- Botón editar -->
              <button @click.stop="openEditPointModal(reunion.id, point)"
                class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center gap-1"
                title="Editar punto">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button @click.stop="confirmDeletePoint(reunion.id, point)"
                class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 flex items-center gap-1"
                title="Eliminar punto">
                <i class="fa-solid fa-trash"></i>
              </button>

              <!-- Icono expandir/contraer -->
              <i class="fa-solid text-gray-400 text-xs mt-1 cursor-pointer"
                :class="expandedPoint === point.id ? 'fa-chevron-up' : 'fa-chevron-down'"
                @click="togglePoint(point.id)"></i>
            </div>

            <!-- Contenido expandido -->
            <div v-if="expandedPoint === point.id" class="mt-2 pt-2 border-t border-gray-200 ml-6">
              <p v-html="formatContent(point.content)" class="text-xs text-gray-700"></p>
            </div>
          </div>

          <div v-if="!reunion.points || reunion.points.length === 0" class="text-center py-4 text-gray-400 text-sm">
            No hay puntos
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para añadir/editar punto -->
    <div v-if="showPointModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closePointModal">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">{{ editingPoint ? 'Editar Punto' : 'Añadir Punto' }}</h3>
        <form @submit.prevent="savePoint" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Título</label>
            <input v-model="pointForm.titulo" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2"
              required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Contenido</label>
            <textarea v-model="pointForm.content" rows="4"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="pointForm.done" type="checkbox" id="pointDone" class="rounded" />
            <label for="pointDone" class="text-sm font-medium">Completado</label>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="closePointModal"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
              Cancelar
            </button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              {{ editingPoint ? 'Guardar' : 'Añadir' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { getReunionDetails } from '@services/reunions/reunions';
import { deletePoint, postPoint, updatePoint } from '@services/points/point';
import SwalService from '@services/swal/SwalService';

export default {
  props: {
    title: String,
    reuniones: Array,
  },
  data() {
    return {
      expandedPoint: null,
      showPointModal: false,
      editingPoint: null,
      currentReunionId: null,
      pointForm: {
        titulo: '',
        content: '',
        done: false,
      },
      collapsedReunions: {}, // Map of reunionId -> boolean (true = collapsed)
    };
  },
  watch: {
    reuniones: {
      handler(newVal) {
        this.initializeCollapsedState();
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    initializeCollapsedState() {
      // Collapse all except the first one (closest to today)
      // Assuming 'reuniones' is already sorted or we rely on the order passed
      // If not sorted, user requirement "first one that is the next closest" usually implies 
      // the list is sorted by date ascending for future events.
      if (!this.reuniones || this.reuniones.length === 0) return;

      this.collapsedReunions = {};
      this.reuniones.forEach((reunion, index) => {
        // Expand first item (index 0), collapse others
        this.collapsedReunions[reunion.id] = index !== 0;
      });
    },
    toggleReunion(reunionId) {
      this.collapsedReunions[reunionId] = !this.collapsedReunions[reunionId];
    },
    isReunionCollapsed(reunionId) {
      // If key doesn't exist, default to collapsed (true) except if logic failed? 
      // But we initialize headers. Let's make it robust.
      // Default true (collapsed) if undefined
      return this.collapsedReunions[reunionId] === undefined ? true : this.collapsedReunions[reunionId];
    },
    togglePoint(pointId) {
      this.expandedPoint = this.expandedPoint === pointId ? null : pointId;
    },
    async togglePointDone(reunionId, point) {
      try {
        await updatePoint(point.id, { done: !point.done });
        // Actualizar localmente
        point.done = !point.done;
        SwalService.success('Estado actualizado');
      } catch (error) {
        console.error('Error al actualizar estado:', error);
        SwalService.error('No se pudo actualizar el estado');
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatContent(text) {
      return text ? text.replace(/\n/g, "<br>") : '';
    },
    async reloadReunion(reunionId) {
      try {
        const updatedReunion = await getReunionDetails(reunionId);
        this.$emit('update', updatedReunion);
        SwalService.success('Reunión actualizada');
      } catch (error) {
        console.error('Error al recargar reunión:', error);
        SwalService.error('No se pudo recargar la reunión');
      }
    },
    openAddPointModal(reunionId) {
      this.currentReunionId = reunionId;
      this.editingPoint = null;
      this.pointForm = {
        titulo: '',
        content: '',
        done: false,
      };
      this.showPointModal = true;
    },
    openEditPointModal(reunionId, point) {
      this.currentReunionId = reunionId;
      this.editingPoint = point;
      this.pointForm = {
        titulo: point.titulo,
        content: point.content,
        done: point.done,
      };
      this.showPointModal = true;
    },
    closePointModal() {
      this.showPointModal = false;
      this.editingPoint = null;
      this.currentReunionId = null;
      this.pointForm = {
        titulo: '',
        content: '',
        done: false,
      };
    },
    async savePoint() {
      try {
        if (this.editingPoint) {
          // Editar punto existente
          await updatePoint(this.editingPoint.id, this.pointForm);
          SwalService.success('Punto actualizado');
        } else {
          // Crear nuevo punto
          await postPoint({
            titulo: this.pointForm.titulo,
            content: this.pointForm.content,
            reunionId: this.currentReunionId
          });
          SwalService.success('Punto añadido');
        }

        // Recargar la reunión
        await this.reloadReunion(this.currentReunionId);
        this.closePointModal();
      } catch (error) {
        console.error('Error al guardar punto:', error);
        SwalService.error('No se pudo guardar el punto');
      }
    },
    async confirmDeletePoint(reunionId, point) {
      const result = await SwalService.confirm(
        '¿Eliminar punto?',
        `¿Estás seguro de que quieres eliminar "${point.titulo}"?`
      );

      if (result.isConfirmed) {
        try {
          await deletePoint(point.id);
          SwalService.success('Punto eliminado');
          // Recargar la reunión para actualizar la lista
          await this.reloadReunion(reunionId);
        } catch (error) {
          console.error('Error al eliminar punto:', error);
          SwalService.error('No se pudo eliminar el punto');
        }
      }
    },
  },
};
</script>
