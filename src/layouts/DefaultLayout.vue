<template>
    <div class="flex min-h-screen">
      <!-- Barra lateral -->
      <aside class="w-64 bg-gray-800 text-white flex flex-col">
        <div class="p-4 text-xl font-bold border-b border-gray-700">
          Navigation
        </div>
        <nav class="flex-1 p-4 space-y-2">
          <router-link
            to="/"
            class="block px-4 py-2 rounded hover:bg-gray-700"
            active-class="bg-gray-700"
          >
            Home
          </router-link>
          <router-link
            to="/page1"
            class="block px-4 py-2 rounded hover:bg-gray-700"
            active-class="bg-gray-700"
          >
            Page 1
          </router-link>
          <router-link
            to="/page2"
            class="block px-4 py-2 rounded hover:bg-gray-700"
            active-class="bg-gray-700"
          >
            Page 2
          </router-link>
        </nav>
      </aside>
  
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
  