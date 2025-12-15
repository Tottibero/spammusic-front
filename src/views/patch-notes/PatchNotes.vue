<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="bg-white rounded-xl shadow-lg p-8 animate-fade-in-up">
      <h2 class="text-3xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-200">
        Notas de Parche
      </h2>
      
      <div class="prose max-w-none text-gray-600">
        <p class="text-lg">
          Ejemplo
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PatchNotes',
});
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
