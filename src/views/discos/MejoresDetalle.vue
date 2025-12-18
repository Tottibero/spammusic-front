<template>
  <div class="p-6">
    <button @click="goBack" class="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2">
      <i class="fa-solid fa-arrow-left"></i>
      Volver
    </button>

    <div v-if="disco" class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Portada -->
          <div>
            <div class="aspect-square bg-gray-200 rounded-lg flex items-center justify-center relative">
              <img v-if="disco.cover" :src="disco.cover" :alt="disco.title" class="w-full h-full object-cover rounded-lg" />
              <i v-else class="fa-solid fa-compact-disc text-gray-400 text-9xl"></i>
              <div v-if="disco.rating" class="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-full text-xl font-bold">
                ⭐ {{ disco.rating }}/10
              </div>
            </div>
          </div>

          <!-- Información -->
          <div>
            <h1 class="text-3xl font-bold mb-2">{{ disco.title }}</h1>
            <p class="text-xl text-gray-600 mb-4">{{ disco.artist }}</p>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-calendar text-gray-500"></i>
                <span>{{ formatDate(disco.releaseDate) }}</span>
              </div>
              <div v-if="disco.genre" class="flex items-center gap-2">
                <i class="fa-solid fa-music text-gray-500"></i>
                <span>{{ disco.genre }}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-star text-yellow-500"></i>
                <span class="font-bold">Valoración: {{ disco.rating }}/10</span>
              </div>
            </div>

            <div v-if="disco.description" class="mt-6">
              <h3 class="font-bold text-lg mb-2">Descripción</h3>
              <p class="text-gray-700">{{ disco.description }}</p>
            </div>

            <div v-if="disco.review" class="mt-6">
              <h3 class="font-bold text-lg mb-2">Reseña</h3>
              <p class="text-gray-700">{{ disco.review }}</p>
            </div>

            <div class="mt-6 flex gap-2">
              <button @click="showEditModal = true"
                class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2">
                <i class="fa-solid fa-edit"></i>
                Editar
              </button>
              <button @click="confirmDelete"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                <i class="fa-solid fa-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-400">
      <i class="fa-solid fa-spinner fa-spin text-6xl mb-4"></i>
      <p>Cargando...</p>
    </div>

    <!-- Modal de edición -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showEditModal = false">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-lg font-semibold mb-4">Editar Disco</h2>
        <form @submit.prevent="updateDisco" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Título</label>
            <input v-model="editForm.title" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Artista</label>
            <input v-model="editForm.artist" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Valoración (1-10)</label>
            <input v-model.number="editForm.rating" type="number" min="1" max="10" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Reseña</label>
            <textarea v-model="editForm.review" rows="4" class="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="showEditModal = false"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
              Cancelar
            </button>
            <button type="submit"
              class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const disco = ref<any>(null);
const showEditModal = ref(false);
const editForm = ref({
  title: '',
  artist: '',
  rating: 5,
  review: ''
});

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function goBack() {
  router.push('/discos/mejores');
}

async function loadDisco() {
  // TODO: Implementar llamada a API
  const id = route.params.id;
  console.log('Loading disco:', id);
  // Mock data
  disco.value = {
    id,
    title: 'Mejor Disco de Ejemplo',
    artist: 'Artista de Ejemplo',
    releaseDate: '2024-12-01',
    rating: 9,
    description: 'Descripción del disco...',
    review: 'Reseña detallada del disco...'
  };
  editForm.value = { ...disco.value };
}

async function updateDisco() {
  // TODO: Implementar llamada a API
  console.log('Update disco:', editForm.value);
  showEditModal.value = false;
}

async function confirmDelete() {
  if (confirm('¿Estás seguro de que deseas eliminar este disco?')) {
    // TODO: Implementar llamada a API
    console.log('Delete disco');
    goBack();
  }
}

onMounted(() => {
  loadDisco();
});
</script>
