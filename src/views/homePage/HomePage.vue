<template>
  <div class="max-w-[100rem] mx-auto mt-10 px-4">
    <div class="bg-white shadow-lg rounded-lg p-6 mb-10">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Estadísticas de la App -->
        <div class="text-center border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-4">
          <h3 class="text-3xl font-bold mb-4">Estadísticas de Álbumes</h3>
          <p class="text-lg">
            Total de Álbumes:
            <span class="font-semibold">{{ stats.totalDiscs }}</span>
          </p>
          <p class="text-lg mt-2">
            Total de Votos:
            <span class="font-semibold">{{ stats.totalVotes }}</span>
          </p>
          <!-- Aquí insertamos el gráfico de barras -->
          <div class="mt-6">
            <RatingBarChart :rating-distribution="ratingDistribution" />
          </div>
        </div>
        <!-- Top Usuarios -->
        <div class="text-center">
          <h3 class="text-3xl font-bold mb-4">Top Usuarios</h3>
          <div class="mb-4">
            <h4 class="text-2xl font-semibold mb-2">Más votos a discos</h4>
            <ul class="list-none">
              <li
                v-for="(user, index) in topUsersByRates"
                :key="user.user.id"
                class="flex items-center justify-center mb-2"
              >
                <span class="mr-2" v-html="getTrophyIcon(index)"></span>
                <span class="font-medium">{{ user.user.username }}</span>
                <span class="ml-2 text-gray-600">- {{ user.rateCount }} rates</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="text-2xl font-semibold mb-2">Más votos a portadas</h4>
            <ul class="list-none">
              <li
                v-for="(user, index) in topUsersByCover"
                :key="user.user.id"
                class="flex items-center justify-center mb-2"
              >
                <span class="mr-2" v-html="getTrophyIcon(index)"></span>
                <span class="font-medium">{{ user.user.username }}</span>
                <span class="ml-2 text-gray-600">- {{ user.totalCover }} cover</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de álbumes mejor valorados -->
    <div class="text-center mb-6">
      <h3 class="text-4xl font-bold">Álbumes mejor valorados</h3>
    </div>
    <div class="grid gap-6">
      <DiscCard
        v-for="disc in discs"
        :key="disc.id"
        :id="disc.id"
        :ep="disc.ep"
        :image="disc.image"
        :name="disc.name"
        :releaseDate="disc.releaseDate"
        :artistName="disc.artist?.name"
        :genreName="disc.genre?.name"
        :genreColor="disc.genre?.color"
        :link="disc.link"
        :averageRate="disc.averageRate"
        :averageCover="disc.averageCover"
        :rate="disc.userRate?.rate"
        :cover="disc.userRate?.cover"
        :isNew="!disc.userRate"
        :userDiscRate="disc.userRate?.id"
        :favoriteId="disc.userFavoriteId"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { getTopRatedOrFeaturedAndStats } from "@services/discs/discs";
import type { Disc, DiscsStatsResponse } from "@services/discs/disc";
import DiscCard from "@components/DiscCardComponent.vue";
import RatingBarChart from "./components/RatingBarChar.vue"; // Importa el componente de gráfico

export default defineComponent({
  components: {
    DiscCard,
    RatingBarChart,
  },
  setup() {
    const discs = ref<Disc[]>([]);
    const stats = ref<{ totalDiscs: number; totalVotes: number }>({
      totalDiscs: 0,
      totalVotes: 0,
    });
    const topUsersByRates = ref<any[]>([]);
    const topUsersByCover = ref<any[]>([]);
    const ratingDistribution = ref<Array<{ rate: number; count: number }>>([]);

    const fetchDiscs = async () => {
      try {
        const response: DiscsStatsResponse = await getTopRatedOrFeaturedAndStats();
        discs.value = response.discs;
        stats.value.totalDiscs = response.totalDiscs;
        stats.value.totalVotes = response.totalVotes;
        topUsersByRates.value = response.topUsersByRates;
        topUsersByCover.value = response.topUsersByCover;
        ratingDistribution.value = response.ratingDistribution; // Asignamos la distribución de ratings
      } catch (error) {
        console.error("Error fetching discs and stats:", error);
      }
    };

    /**
     * Devuelve el icono de trofeo correspondiente según la posición.
     * Se usa FontAwesome y se le asigna un color distinto:
     *  - 1°: Oro (text-yellow-500)
     *  - 2°: Plata (text-gray-400)
     *  - 3°: Bronce (text-yellow-700)
     */
    const getTrophyIcon = (index: number) => {
      if (index === 0) {
        return `<i class="fas fa-trophy text-yellow-500"></i>`;
      } else if (index === 1) {
        return `<i class="fas fa-trophy text-gray-400"></i>`;
      } else if (index === 2) {
        return `<i class="fas fa-trophy text-yellow-700"></i>`;
      } else {
        return "";
      }
    };

    onMounted(() => {
      fetchDiscs();
    });

    return {
      discs,
      stats,
      topUsersByRates,
      topUsersByCover,
      ratingDistribution,
      getTrophyIcon,
    };
  },
});
</script>

<style>
/* Estilos para el grid de los álbumes (DiscCard) */
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
