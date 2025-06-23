<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-2">Sugerir discos</h1>
    <p class="text-center font-serif text-gray-500 text-md mb-4">
      Puedes sugerir nuevos discos completando los campos de abajo (tanto fecha como datos del disco).<br />
      El equipo de Spam Music los revisará y aceptará en caso de que sean válidos.
    </p>

    <!-- Input de fecha -->
    <div class="mb-4 md:mb-6">
      <label for="date" class="block text-sm font-medium text-gray-700 mb-1">
        Selecciona fecha:
      </label>
      <input
        id="date"
        type="date"
        v-model="selectedDate"
        class="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
      />
    </div>

    <!-- Textarea para los discos -->
    <div class="mb-4 md:mb-6">
      <label for="albums" class="block text-sm font-medium text-gray-700 mb-1">
        Introduce los discos:
      </label>
<textarea
  id="albums"
  v-model="albumText"
  placeholder="Lauren Babic – Too Much and Never Enough (EP)
Decrepid – Suffered Existence"
  rows="6"
  class="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
></textarea>
    </div>

    <!-- Botón para enviar -->
    <div class="mb-6 md:mb-8 flex justify-center">
      <button
        @click="sendEmail"
        :disabled="!selectedDate || !albumText.trim()"
        class="px-5 py-2 md:px-6 md:py-3 bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-black font-semibold rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        Solicitar
      </button>
    </div>

    <!-- Mensaje de confirmación -->
<div v-if="emailSent" class="text-green-600 text-center font-semibold text-lg space-y-2">
  <p>¡Listo! Ahora se te abrirá Outlook o algún gestor para crear un nuevo correo y que puedas enviarnos tu solicitud.</p>
  <p class="text-yellow-600 text-sm"><span class="mr-1">⚠️</span>Este sistema será temporal ya que estamos trabajando en una moderación de solicitudes interna.</p>
</div>

    <!-- Mensaje de error -->
    <div v-if="error" class="mt-4 md:mt-6">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {{ error }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'SuggestPage',
  setup() {
    const selectedDate = ref('');
    const albumText = ref('');
    const error = ref('');
    const emailSent = ref(false);

    const sendEmail = async () => {
      try {
        emailSent.value = false;
        error.value = '';

        const subject = encodeURIComponent('Petición disco Spam Music app');
        const body = encodeURIComponent(`Fecha sugerida: ${selectedDate.value}\n\nDiscos sugeridos:\n${albumText.value}`);

        const mailtoLink = `mailto:contacto@riffvalley.es?subject=${subject}&body=${body}`;

        window.location.href = mailtoLink;
        emailSent.value = true;
      } catch (err) {
        error.value = 'No se pudo generar el correo.';
      }
    };

    return {
      selectedDate,
      albumText,
      sendEmail,
      error,
      emailSent,
    };
  },
});
</script>

<style scoped>
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
