<template>
  <div class="max-w-7xl mx-auto mt-10">
    <h1 class="text-4xl font-bold mb-8 text-center">Discs by Release Date</h1>
    <div>
      <!-- Lista de discos agrupados -->
      <div
        v-for="group in groupedDiscs"
        :key="group.releaseDate"
        class="mb-8"
      >
        <h3 class="text-2xl font-bold mb-4">{{ group.releaseDate }}</h3>
        <ul>
          <li
            v-for="disc in group.discs"
            :key="disc.id"
            class="flex justify-between p-4 border-b"
          >
            <span class="font-medium">{{ disc.artist.name }}</span>
            <span>-</span>
            <span>{{ disc.name }}</span>
          </li>
        </ul>
      </div>
    </div>
    <!-- Cargar más -->
    <div ref="loadMore" class="text-center py-6">
      <span v-if="loading" class="text-gray-600">Loading more discs...</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { getDiscsDated } from '../services/discDated';

export default defineComponent({
  name: 'DiscsList',
  setup() {
    const groupedDiscs = ref<any[]>([]); // Lista agrupada por fecha
    const limit = ref(30); // Número de discos por página
    const offset = ref(0); // Página actual
    const totalItems = ref(0); // Total de discos
    const loading = ref(false); // Estado de carga
    const hasMore = ref(true); // Si hay más discos para cargar
    const loadMore = ref<HTMLDivElement | null>(null); // Referencia al contenedor para scroll infinito

    // Cargar discos desde la API
    const fetchDiscs = async () => {
      if (loading.value || !hasMore.value) return;

      loading.value = true;

      try {
        const response = await getDiscsDated(limit.value, offset.value);

        response.data.forEach((newGroup: any) => {
          // Verificar si la fecha ya existe en groupedDiscs
          const existingGroup = groupedDiscs.value.find(
            (group) => group.releaseDate === newGroup.releaseDate
          );

          if (existingGroup) {
            // Si la fecha existe, agregar los discos nuevos al grupo existente
            existingGroup.discs.push(...newGroup.discs);
          } else {
            // Si la fecha no existe, agregar un nuevo grupo
            groupedDiscs.value.push(newGroup);
          }
        });

        totalItems.value = response.totalItems;
        offset.value += limit.value;

        hasMore.value = offset.value < totalItems.value;
      } catch (error) {
        console.error('Error fetching discs:', error);
      } finally {
        loading.value = false;
      }
    };

    // Observador para scroll infinito
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchDiscs();
      }
    });

    // Montar el observador
    onMounted(() => {
      if (loadMore.value) {
        observer.observe(loadMore.value);
      }

      // Cargar la primera página
      fetchDiscs();
    });

    return {
      groupedDiscs,
      loadMore,
      loading,
      hasMore,
    };
  },
});
</script>

<style scoped>
  h3 {
    color: #4a5568;
  }
  li {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #e2e8f0;
  }
</style>
