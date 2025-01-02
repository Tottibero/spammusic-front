<template>
    <div class="flex min-h-screen bg-gray-100">
      <main class="m-auto p-6 bg-white shadow-md rounded">
        <slot />
      </main>
    </div>
  </template>
  
  <script lang="ts">
  export default {
    name: 'LoginLayout',
  };
  </script>
  