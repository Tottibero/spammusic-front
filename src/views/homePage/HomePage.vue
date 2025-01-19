<template>
    <div class="max-w-[100rem] mx-auto mt-10 px-4">
      <div class="text-center mb-6">
        <h3 class="text-4xl font-bold">Estadísticas de Álbumes</h3>
        <p class="text-lg mt-2">
          Total de Álbumes: {{ stats.totalDiscs }} | Total de Votos:
          {{ stats.totalVotes }}
        </p>
      </div>
  
      <div class="text-center mb-6">
        <h3 class="text-4xl font-bold">Álbumes de la semana</h3>
      </div>
  
      <div class="grid gap-6">
        <DiscCard
          v-for="disc in discs"
          :key="disc.id"
          :id="disc.id"
          :image="disc.image"
          :name="disc.name"
          :releaseDate="disc.releaseDate"
          :artistName="disc.artistName || 'Desconocido'"
          :genreName="disc.genre?.name"
          :genreColor="disc.genre?.color"
          :link="disc.link"
          :averageRate="disc.averageRate"
          :averageCover="disc.averageCover"
          :rate="disc.userRate?.rate"
          :cover="disc.userRate?.cover"
          :isNew="!disc.userRate"
          :userDiscRate="disc.userRate?.id"
        />
      </div>
    </div>
  </template>
    
  <script lang="ts">
  import { defineComponent, ref, onMounted } from "vue";
  import { getTopRatedOrFeaturedAndStats } from "@services/discs/discs";
  import type { Disc, DiscsStatsResponse } from "@services/discs/disc";
  import DiscCard from "@components/DiscCardComponent.vue"; // Importa el componente reutilizable
  
  export default defineComponent({
    components: {
      DiscCard, // Registra el componente
    },
    setup() {
      const discs = ref<Disc[]>([]);
      const stats = ref<{ totalDiscs: number; totalVotes: number }>({
        totalDiscs: 0,
        totalVotes: 0,
      });
  
      const fetchDiscs = async () => {
        try {
          const response: DiscsStatsResponse =
            await getTopRatedOrFeaturedAndStats();
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
  /* Para pantallas pequeñas */
  .grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
  }
  
  /* Para tablets */
  @media (min-width: 640px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  /* Para pantallas grandes */
  @media (min-width: 1024px) {
    .grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  </style>
  