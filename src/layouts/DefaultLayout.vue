<template>
    <div class="flex flex-col md:flex-row" style="height: auto; min-height: 100%;">
      <!-- Barra lateral -->
      <aside class="w-64 bg-gray-800 text-white hidden md:flex flex-col">
        <div class="p-4 text-xl font-bold border-b border-gray-700">
          Navigation
        </div>
        <nav class="flex-1 p-4 space-y-2">
          <router-link
            to="/"
            class="block px-4 py-2 rounded hover:bg-gray-700"
            active-class="bg-gray-700"
          >
            Discos
          </router-link>
          <router-link
            to="/page1"
            class="block px-4 py-2 rounded hover:bg-gray-700"
            active-class="bg-gray-700"
          >
            Calendario de discos
          </router-link>
          <router-link
            to="/page2"
            class="block px-4 py-2 rounded hover:bg-gray-700"
            active-class="bg-gray-700"
          >
            Scrapping Discos
          </router-link>
        </nav>
      </aside>
  
      <!-- Menú hamburguesa para móvil -->
      <button class="menu-hamburguesa bg-gray-800 text-white px-4 py-2 flex md:hidden">
        ☰ Menu
      </button>
  
      <!-- Contenido principal -->
      <main class="flex-1 bg-gray-100 p-6">
        <slot />
      </main>
    </div>
  </template>
  
  <script lang="ts">
  export default {
    name: 'DefaultLayout',
  };
  </script>

  <style>
  @media (max-width: 768px) {
    aside {
      display: none; /* Ocultar barra lateral en pantallas pequeñas */
    }
    .menu-hamburguesa {
      display: block; /* Mostrar botón hamburguesa */
    }
  }
  </style>
