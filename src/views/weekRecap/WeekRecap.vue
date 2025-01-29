<template>
    <div class="p-6 bg-gray-100 min-h-screen grid grid-cols-1 gap-6 items-start">
      <!-- Información de la semana -->
      <div class="bg-white p-4 rounded-2xl shadow-md">
        <h3 class="text-lg font-bold mb-4">Información de la semana</h3>
        <h4 class="text-base font-semibold mb-4">Listas</h4>
        <WeekList />
        <h4 class="text-base font-semibold mb-4 mt-4">Articulos</h4>
      </div>
  
      <!-- En marcha -->
      <div class="bg-white p-6 rounded-2xl shadow-md">
        <h3 class="text-lg font-bold mb-4">En marcha</h3>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from "vue";
  import WeekList from "./components/WeekLists.vue"; // Asegúrate de que la ruta sea correcta
  
  export default defineComponent({
    name: "Dashboard",
    components: {
        WeekList,
    },
  });
  </script>
  