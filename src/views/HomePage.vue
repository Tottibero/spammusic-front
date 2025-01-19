<template>
    <div class="max-w-[100rem] mx-auto mt-10 px-4">
      <!-- Mensaje con estadísticas -->
      <div class="text-center mb-6">
        <h1 class="text-4xl font-bold">Estadísticas de Álbumes</h1>
        <p class="text-lg mt-2">Total de Álbumes: {{ stats.totalDiscs }} | Total de Votos: {{ stats.totalVotes }}</p>
      </div>
  
      <!-- Listado de álbumes -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="disc in discs" :key="disc.id"
          class="card border p-4 rounded shadow-lg flex flex-col md:flex-row bg-white">
          <!-- Imagen del disco -->
          <div class="mb-4 md:mb-0 md:mr-4 flex-shrink-0">
            <img :src="disc.image && disc.image.length > 3 ? disc.image : 'https://via.placeholder.com/150'"
              :alt="disc.name" class="w-48 h-48 object-cover rounded mx-auto md:mx-0" />
          </div>
          <div class="flex flex-col justify-between flex-1">
            <div>
              <h2 class="text-xl font-semibold">{{ disc.name }}</h2>
              <p class="text-gray-600">{{ disc.artist.name }}</p>
              <p class="text-sm text-gray-500">{{ disc.releaseDate }}</p>
            </div>
            <div class="mt-4">
              <p class="text-sm font-bold">Promedio Rate: {{ disc.averageRate?.toFixed(2) || 'N/A' }}</p>
              <p class="text-sm font-bold">Promedio Cover: {{ disc.averageCover?.toFixed(2) || 'N/A' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from "vue";
  import { getTopRatedOrFeaturedAndStats, Disc, DiscsStatsResponse } from "../services/discs";
  
  export default defineComponent({
    setup() {
      const discs = ref<Disc[]>([]);
      const stats = ref<{ totalDiscs: number; totalVotes: number }>({
        totalDiscs: 0,
        totalVotes: 0,
      });
  
      const fetchDiscs = async () => {
        try {
          const response: DiscsStatsResponse = await getTopRatedOrFeaturedAndStats();
          discs.value = response.discs;
          stats.value.totalDiscs = response.totalDiscs;
          stats.value.totalVotes = response.totalVotes;
        } catch (error) {
          console.error("Error fetching discs and stats:", error);
        }
      };
  
      onMounted(() => {
        fetchDiscs();
      });
  
      return {
        discs,
        stats,
      };
    },
  });
  </script>
  
  <style>
  .grid {
    display: grid;
    gap: 1.5rem;
  }
  
  .card {
    display: flex;
    flex-direction: column;
    background-color: white;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .card img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
  }
  
  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  </style>
  