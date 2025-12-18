<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Mejores Discos</h1>
      <button @click="showCreateModal = true"
        class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2">
        <i class="fa-solid fa-plus"></i>
        Añadir Disco
      </button>
    </div>

    <!-- Lista de discos -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="disco in discos" :key="disco.id"
        class="border border-gray-300 rounded-lg p-4 bg-white hover:shadow-lg cursor-pointer transition-all"
        @click="goToDetail(disco.id)">
        <div class="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center relative">
          <img v-if="disco.cover" :src="disco.cover" :alt="disco.title" class="w-full h-full object-cover rounded-lg" />
          <i v-else class="fa-solid fa-compact-disc text-gray-400 text-6xl"></i>
          <div v-if="disco.rating" class="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            ⭐ {{ disco.rating }}/10
          </div>
        </div>
        <h3 class="font-bold text-lg truncate">{{ disco.title }}</h3>
        <p class="text-sm text-gray-600 truncate">{{ disco.artist }}</p>
        <p class="text-xs text-gray-500 mt-2">{{ formatDate(disco.releaseDate) }}</p>
      </div>
    </div>

    <div v-if="discos.length === 0" class="text-center py-12 text-gray-400">
      <i class="fa-solid fa-star text-6xl mb-4"></i>
      <p>No hay discos destacados</p>
    </div>

    <!-- Modal de creación -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showCreateModal = false">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-lg font-semibold mb-4">Añadir Mejor Disco</h2>
        <form @submit.prevent="createDisco" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Título</label>
            <input v-model="newDisco.title" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Artista</label>
            <input v-model="newDisco.artist" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Fecha de Lanzamiento</label>
            <input v-model="newDisco.releaseDate" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Valoración (1-10)</label>
            <input v-model.number="newDisco.rating" type="number" min="1" max="10" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">URL de Portada (opcional)</label>
            <input v-model="newDisco.cover" type="url" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="showCreateModal = false"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
              Cancelar
            </button>
            <button type="submit"
              class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
              Añadir
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const discos = ref<any[]>([]);
const showCreateModal = ref(false);
const newDisco = ref({
  title: '',
  artist: '',
  releaseDate: '',
  cover: '',
  rating: 5,
  type: 'best'
});

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function goToDetail(id: string) {
  router.push(`/discos/mejores/${id}`);
}

async function createDisco() {
  // TODO: Implementar llamada a API
  console.log('Crear disco:', newDisco.value);
  showCreateModal.value = false;
  newDisco.value = { title: '', artist: '', releaseDate: '', cover: '', rating: 5, type: 'best' };
}

async function loadDiscos() {
  // TODO: Implementar llamada a API
  discos.value = [];
}

onMounted(() => {
  loadDiscos();
});
</script>
