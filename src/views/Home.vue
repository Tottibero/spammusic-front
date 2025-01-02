<template>
    <div class="max-w-7xl mx-auto mt-10">
      <h1 class="text-4xl font-bold mb-8 text-center">Discs</h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="disc in discs"
          :key="disc.id"
          class="border p-4 rounded shadow-lg flex flex-col items-center"
        >
          <h2 class="text-xl font-semibold text-center">{{ disc.name }}</h2>
          <p class="text-gray-600 text-center">{{ disc.artist.name }}</p>
          <p class="text-sm text-gray-500 text-center">{{ disc.releaseDate }}</p>
          <div class="mt-4 space-y-2 w-full">
            <label class="block">
              <span class="text-sm text-gray-700">Rate:</span>
              <input
                type="number"
                :value="ratings[disc.id]?.rate || 5"
                @input="updateRating(disc.id, 'rate', $event.target.value)"
                min="1"
                max="10"
                class="w-full px-2 py-1 border rounded"
              />
            </label>
            <label class="block">
              <span class="text-sm text-gray-700">Cover:</span>
              <input
                type="number"
                :value="ratings[disc.id]?.cover || 5"
                @input="updateRating(disc.id, 'cover', $event.target.value)"
                min="1"
                max="10"
                class="w-full px-2 py-1 border rounded"
              />
            </label>
            <button
              @click="submitRating(disc.id)"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <div ref="loadMore" class="text-center py-6">
        <span v-if="loading" class="text-gray-600">Loading more discs...</span>
      </div>
    </div>
  </template>
      
    <script lang="ts">
    import { defineComponent, ref, reactive, onMounted } from 'vue';
    import { getDiscs  } from '../services/discs';
    import { postRate } from '../services/rates';
    
    export default defineComponent({
      setup() {
        const discs = ref<any[]>([]);
        const ratings = reactive<Record<string, { rate: number; cover: number }>>({});
        const limit = ref(20); // Cambiado el límite a 20
        const offset = ref(1);
        const totalItems = ref(0);
        const loading = ref(false);
        const hasMore = ref(true);
        const loadMore = ref<HTMLDivElement | null>(null);
    
        const fetchDiscs = async () => {
          if (loading.value || !hasMore.value) return;
    
          loading.value = true;
    
          try {
            const response = await getDiscs(limit.value, offset.value);
            discs.value.push(...response.data);
            totalItems.value = response.totalItems;
    
            // Incrementa el offset
            offset.value += limit.value;
    
            // Inicializa valores predeterminados para rate y cover
            response.data.forEach((disc) => {
              if (!ratings[disc.id]) {
                ratings[disc.id] = { rate: 0, cover: 0 }; // Valores por defecto
              }
            });
    
            // Verifica si hay más discos por cargar
            hasMore.value = offset.value < totalItems.value;
          } catch (error) {
            console.error('Error fetching discs:', error);
          } finally {
            loading.value = false;
          }
        };
    
        const updateRating = (discId: string, field: 'rate' | 'cover', value: string) => {
          if (!ratings[discId]) {
            ratings[discId] = { rate: 5, cover: 5 }; // Inicializa el objeto si no existe
          }
          ratings[discId][field] = parseInt(value, 10); // Actualiza el campo correspondiente
        };
    
        const submitRating = async (discId: string) => {
          const { rate, cover } = ratings[discId];
          const payload: any = { discId, rate, cover };
    
          try {
            await postRate(payload);
            alert('Rating submitted successfully!');
          } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating.');
          }
        };
    
        // Configuración del Intersection Observer para detectar scroll
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            fetchDiscs();
          }
        });
    
        onMounted(() => {
          if (loadMore.value) {
            observer.observe(loadMore.value);
          }
    
          // Carga inicial
          fetchDiscs();
        });
    
        return {
          discs,
          loadMore,
          loading,
          hasMore,
          ratings,
          updateRating,
          submitRating,
        };
      },
    });
    </script>
    