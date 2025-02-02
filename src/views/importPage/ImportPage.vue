<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Entrada Manual de Datos</h1>

    <!-- Input de fecha -->
    <div class="mb-6">
      <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
        Selecciona Fecha:
      </label>
      <input
        id="date"
        type="date"
        v-model="selectedDate"
        class="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
      />
    </div>

    <!-- Textarea para los discos -->
    <div class="mb-6">
      <label for="albums" class="block text-sm font-medium text-gray-700 mb-2">
        Introduce los Discos:
      </label>
      <textarea
        id="albums"
        v-model="albumText"
        placeholder="Canaan – Some Last Echo (Eibon)
Decrepid – Suffered Existence Re-Release (Brutal)"
        rows="8"
        class="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
      ></textarea>
    </div>

    <!-- Botón para enviar -->
    <div class="mb-8">
      <button
        @click="processData"
        :disabled="!selectedDate || !albumText.trim()"
        class="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Procesar Datos
      </button>
    </div>

    <!-- Card de resultados -->
    <div v-if="responseData" class="mb-8">
      <div class="bg-white shadow rounded-lg p-4">
        <!-- Encabezado con título y fecha -->
        <div class="mb-4 border-b pb-2">
          <h2 class="text-2xl font-bold text-gray-800">Resultados</h2>
          <p class="text-gray-600">
            Fecha: <span class="font-medium">{{ displayDate }}</span>
          </p>
        </div>

        <!-- Fila de discos importados -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">
            Discos Importados
          </h3>
          <div class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
            <template v-if="importedDiscsParsed.length">
              <div
                v-for="(disc, index) in importedDiscsParsed"
                :key="'imported-' + index"
                class="bg-green-100 text-green-800 px-2 py-2 rounded min-h-[80px] flex flex-col justify-center"
              >
                <p class="font-semibold truncate">Artista: {{ disc.artist }}</p>
                <p class="truncate">Disco: {{ disc.disc }}</p>
              </div>
            </template>
            <template v-else>
              <div class="col-span-full bg-green-100 text-green-800 px-2 py-2 rounded text-center">
                No hay discos importados.
              </div>
            </template>
          </div>
        </div>

        <!-- Fila de discos no importados -->
        <div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">
            Discos No Importados
          </h3>
          <div class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
            <template v-if="nonImportedDiscsParsed.length">
              <div
                v-for="(disc, index) in nonImportedDiscsParsed"
                :key="'non-imported-' + index"
                class="bg-red-100 text-red-800 px-2 py-2 rounded min-h-[80px] flex flex-col justify-center"
              >
                <p class="font-semibold truncate">Artista: {{ disc.artist }}</p>
                <p class="truncate">Disco: {{ disc.disc }}</p>
              </div>
            </template>
            <template v-else>
              <div class="col-span-full bg-red-100 text-red-800 px-2 py-2 rounded text-center">
                No hay discos no importados.
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="mt-6">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {{ error }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { fetchManualData } from '@services/imports/imports';

export default defineComponent({
  name: 'DataFetcherWithTextarea',
  setup() {
    const selectedDate = ref('');
    const albumText = ref('');
    const responseData = ref<any>(null);
    const error = ref('');

    // Fecha en formato español (dd/mm/yyyy)
    const displayDate = computed(() => {
      if (!selectedDate.value) return '';
      const [year, month, day] = selectedDate.value.split('-');
      return `${day}/${month}/${year}`;
    });

    // Procesamos los discos importados
    const importedDiscsParsed = computed(() => {
      if (!responseData.value) return [];
      const discs: string[] = responseData.value.data.savedDiscs || [];
      return discs.map((disc: string) => {
        // Se espera el formato: Artist "Nombre Artista" => Disc "Nombre Disco"
        const regex = /Artist\s*"([^"]+)"\s*=>\s*Disc\s*"([^"]+)"/;
        const match = disc.match(regex);
        if (match) {
          return { artist: match[1], disc: match[2] };
        }
        return { artist: disc, disc: '' };
      });
    });

    // Procesamos los discos no importados
    const nonImportedDiscsParsed = computed(() => {
      if (!responseData.value) return [];
      const discs: string[] = responseData.value.data.existingDiscs || [];
      return discs.map((disc: string) => {
        const regex = /Artist\s*"([^"]+)"\s*=>\s*Disc\s*"([^"]+)"/;
        const match = disc.match(regex);
        if (match) {
          return { artist: match[1], disc: match[2] };
        }
        return { artist: disc, disc: '' };
      });
    });

    const processData = async () => {
      error.value = '';
      responseData.value = null;
      try {
        const [year, month, day] = selectedDate.value.split('-');
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        // Formateamos la fecha para enviar a la API (por ejemplo: "February 7, 2025")
        const formattedDate = `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
        const albums = albumText.value
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean);
        const response = await fetchManualData(formattedDate, albums);
        responseData.value = response;
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      }
    };

    return {
      selectedDate,
      albumText,
      processData,
      responseData,
      error,
      displayDate,
      importedDiscsParsed,
      nonImportedDiscsParsed,
    };
  },
});
</script>

<style scoped>
/* Puedes ajustar más detalles si lo deseas */
</style>
