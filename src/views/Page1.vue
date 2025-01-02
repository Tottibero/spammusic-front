<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-4">Data Fetcher</h1>

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

    <!-- Select de API -->
    <div class="mb-4">
      <label for="api" class="block text-sm font-medium text-gray-700 mb-2">Select API:</label>
      <select
        id="api"
        v-model="selectedApi"
        class="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
        <option value="">-- Select an API --</option>
        <option value="boolintunes">Boolintunes</option>
        <option value="heavymusichq">HeavyMusicHQ</option>
      </select>
    </div>

    <!-- Botón para enviar -->
    <div class="mt-4">
      <button
        @click="fetchData"
        :disabled="!selectedDate || !selectedApi"
        class="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
        Fetch Data
      </button>
    </div>

    <!-- Resultados -->
    <div v-if="responseData" class="mt-6">
      <h2 class="text-xl font-semibold mb-4">Response Data:</h2>
      <pre class="bg-gray-100 p-4 rounded-md overflow-auto">{{ responseData }}</pre>
    </div>

    <div v-if="error" class="mt-6 text-red-500">
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { fetchScrapingData } from '../services/scraping';

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
  name: 'DataFetcher',
  setup() {
    const selectedDate = ref('');
    const selectedApi = ref('');
    const responseData = ref(null);
    const error = ref('');

    const fetchData = async () => {
      error.value = '';
      responseData.value = null;

      try {
        const [year, month, day] = selectedDate.value.split('-');
        const monthName = MONTHS[parseInt(month, 10) - 1]; // Convertir número de mes a nombre
        const response = await fetchScrapingData(
          selectedApi.value,
          monthName,
          day ? parseInt(day, 10) : undefined
        );
        responseData.value = response;
      } catch (err) {
        error.value = err.response?.data?.message || 'An error occurred while fetching data.';
      }
    };

    return {
      selectedDate,
      selectedApi,
      fetchData,
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
