<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white rounded-3xl shadow-xl max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto p-6 relative">
      <button @click="$emit('close')"
        class="absolute top-2 right-2 text-white hover:text-[#d9e021] bg-gray-700 hover:bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all">
        <i class="fas fa-times"></i>
      </button>
      <h2 class="text-xl font-bold mb-4 text-center text-gray-800">Estadísticas detalladas</h2>

      <!-- Aquí va tu contenido -->
      <p class="text-center text-sm text-gray-600">Contenido en construcción...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Este modal no tiene lógica aún, solo muestra un contenedor.
</script>
