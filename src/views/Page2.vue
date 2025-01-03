<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-4">Manual Data Input</h1>

    <!-- Input de fecha -->
    <div class="mb-4">
      <label for="date" class="block text-sm font-medium text-gray-700 mb-2">Select Date:</label>
      <input
        id="date"
        type="date"
        v-model="selectedDate"
        class="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
      />
    </div>

    <!-- Textarea para los discos -->
    <div class="mb-4">
      <label for="albums" class="block text-sm font-medium text-gray-700 mb-2">Enter Albums:</label>
      <textarea
        id="albums"
        v-model="albumText"
        placeholder="Canaan – Some Last Echo (Eibon)\nDecrepid – Suffered Existence Re-Release (Brutal)"
        rows="8"
        class="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"></textarea>
    </div>

    <!-- Botón para enviar -->
    <div class="mt-4">
      <button
        @click="processData"
        :disabled="!selectedDate || !albumText.trim()"
        class="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
        Process Data
      </button>
    </div>

    <!-- Resultados -->
    <div v-if="responseData" class="mt-6">
      <h2 class="text-xl font-semibold mb-4">Processed Data</h2>
      <pre class="bg-gray-100 p-4 rounded-md">{{ responseData }}</pre>
    </div>

    <div v-if="error" class="mt-6 text-red-500">
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { fetchManualData } from '../services/scraping';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default defineComponent({
  name: 'DataFetcherWithTextarea',
  setup() {
    const selectedDate = ref('');
    const albumText = ref('');
    const responseData = ref<string | null>(null);
    const error = ref('');

    const processData = async () => {
      error.value = '';
      responseData.value = null;

      try {
        const [year, month, day] = selectedDate.value.split('-');
        const monthName = MONTHS[parseInt(month, 10) - 1];
        const formattedDate = `${monthName} ${parseInt(day, 10)}, ${year}`;
        const albums = albumText.value.split('\n').map((line) => line.trim()).filter(Boolean);

        const response = await fetchManualData(formattedDate, albums);
        responseData.value = JSON.stringify(response, null, 2);
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An unexpected error occurred.';
      }
    };

    return {
      selectedDate,
      albumText,
      processData,
      responseData,
      error,
    };
  },
});
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>