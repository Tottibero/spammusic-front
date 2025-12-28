<template>
  <div class="p-6 min-h-screen bg-gray-50/50">
    <div class="max-w-7xl mx-auto">
      <!-- Header Navegación -->
      <button @click="goBack"
        class="mb-6 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 shadow-sm flex items-center gap-2 transition-colors">
        <i class="fa-solid fa-arrow-left"></i>
        Volver a Nuevos Discos
      </button>

      <div v-if="loading" class="text-center py-12">
        <i class="fa-solid fa-spinner fa-spin text-4xl text-indigo-500 mb-4"></i>
        <p class="text-gray-500">Cargando detalles de la semana...</p>
      </div>

      <div v-else-if="list" class="space-y-8">
        <!-- Tarjeta Principal (Edición Inline) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6 md:p-8">
            <div class="flex flex-col gap-4 mb-6">
              <!-- Nombre Editable -->
              <input 
                v-model="list.name" 
                @change="updateField('name', list.name)"
                class="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors w-full p-1"
                placeholder="Nombre de la lista"
              />
              <!-- Descripción Editable -->
              <input 
                v-model="list.description" 
                @change="updateField('description', list.description)"
                class="text-gray-600 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors w-full p-1"
                placeholder="Añade una descripción..."
              />
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- ESTADO (Editable) -->
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-100 group hover:border-indigo-200 transition-colors">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-2">
                   Estado
                   <i class="fa-solid fa-pen text-[10px] opacity-0 group-hover:opacity-50"></i>
                </p>
                <select 
                  v-model="list.status" 
                  @change="updateField('status', list.status)"
                  class="bg-transparent font-medium text-sm border-none focus:ring-0 cursor-pointer w-full p-0 text-gray-800"
                  :class="getStatusColor(list.status)"
                >
                    <option value="new">Nueva</option>
                    <option value="assigned">Asignada</option>
                    <option value="published">Publicada</option>
                </select>
              </div>

              <!-- FECHA LISTA (Editable) -->
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-100 group hover:border-indigo-200 transition-colors">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-2">
                  Fecha Lista
                  <i class="fa-solid fa-pen text-[10px] opacity-0 group-hover:opacity-50"></i>
                </p>
                <div class="flex items-center gap-2">
                  <i class="fa-regular fa-calendar text-gray-400"></i>
                  <input 
                    type="date" 
                    :value="formatDateForInput(list.listDate)"
                    @change="(e) => updateField('listDate', (e.target as HTMLInputElement).value)"
                    class="bg-transparent border-none p-0 text-gray-800 font-semibold focus:ring-0 cursor-pointer w-full"
                  />
                </div>
              </div>

              <!-- FECHA CIERRE (Editable) -->
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-100 group hover:border-indigo-200 transition-colors">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-2">
                  Fecha Cierre
                  <i class="fa-solid fa-pen text-[10px] opacity-0 group-hover:opacity-50"></i>
                </p>
                <div class="flex items-center gap-2">
                  <i class="fa-regular fa-clock text-gray-400"></i>
                  <input 
                    type="date" 
                    :value="formatDateForInput(list.closeDate)"
                     @change="(e) => updateField('closeDate', (e.target as HTMLInputElement).value)"
                    class="bg-transparent border-none p-0 text-gray-800 font-semibold focus:ring-0 cursor-pointer w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Componentes de Gestión -->
        <div class="space-y-8">
          <!-- Lista de Asignaciones (Radares) -->
          <div>
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-users-viewfinder text-indigo-500"></i>
              Asignaciones y Radares
            </h2>
            <AsignationList :type="list.type" />
          </div>

          <!-- Buscador de Discos -->
          <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-compact-disc text-indigo-500"></i>
              Listado de Discos por Fecha
            </h2>
            <DiscsByDate 
              v-if="list.listDate"
              :date="list.listDate" 
              :type="list.type" 
              :list-id="list.id" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getListDetails, updateList } from '@services/list/list';
import SwalService from '@services/swal/SwalService';
import { useAsignationStore } from '@stores/asignation/asignation';
import { useUserStore } from '@stores/user/users';
import DiscsByDate from '../list/components/DiscByDate.vue';
import AsignationList from '../list/components/AsignationList.vue';

const route = useRoute();
const router = useRouter();
const asignationStore = useAsignationStore();
const userStore = useUserStore();

const list = ref<any>(null);
const loading = ref(true);

function formatDateForInput(dateString: string) {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
}

function getStatusColor(status: string) {
  // Solo devolvemos color de texto para el select
  const colors: Record<string, string> = {
    'new': 'text-blue-700',
    'assigned': 'text-amber-700',
    'published': 'text-purple-700',
  };
  return colors[status] || 'text-gray-700';
}

function goBack() {
  router.push('/discos/radar');
}

async function loadData() {
  loading.value = true;
  try {
    const id = route.params.id as string;
    
    // Cargar detalles básicos
    const data = await getListDetails(id);
    list.value = data;
    
    // Cargar stores para componentes
    await Promise.all([
      asignationStore.loadAsignations(id),
      userStore.loadRvUsers()
    ]);
    
  } catch (error) {
    console.error('Error loading list details:', error);
    SwalService.error('No se pudieron cargar los detalles de la lista');
  } finally {
    loading.value = false;
  }
}

async function updateField(field: string, value: any) {
  try {
    // Preparar payload solo con el campo cambiado (o todo el objeto merged, la API suele necesitar parcial o todo)
    // Asumimos que updateList acepta un objeto parcial
    const payload = {
        [field]: value
    };

    // Si es fecha, asegurar que no mandamos null inválido si el input está vacío
    if ((field === 'listDate' || field === 'closeDate') && !value) {
        // Manejo específico si la API rechaza strings vacíos para fechas
        // payload[field] = null; 
    }

    await updateList(list.value.id, payload);
    
    // Opcional: Feedback muy sutil, como un pequeño check o toast instantáneo
    // SwalService.success('Actualizado', '', false); // sin modal mejor
    
    // Actualizar referencia local por si el backend normalizó algo, pero para inputs suele ser mejor mantener el valor del usuario para no causar saltos
    // Pero si es crítico, reload silencioso
  } catch (error) {
    console.error(`Error updating ${field}:`, error);
    SwalService.error('No se pudo guardar el cambio');
    // Revertir cambio local si falla? Sería ideal.
    // Por ahora simplificado.
  }
}

onMounted(() => {
  loadData();
});
</script>
