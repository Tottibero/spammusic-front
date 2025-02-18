<template>
  <div
    :class="{ 'menu-open': menuVisible }"
    class="max-w-[100rem] mx-auto mt-10 px-4"
  >
    <div class="bg-white shadow-lg rounded-lg p-6 mb-10">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Estadísticas de la App -->
        <div
          class="text-center border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-4"
        >
          <h3 class="text-3xl font-bold mb-4 text-gray-900">
            Estadísticas de discos
          </h3>
          <p class="text-lg text-gray-900">
            Total de discos:
            <span class="font-semibold text-gray-900">{{
              stats.totalDiscs
            }}</span>
          </p>
          <p class="text-lg mt-2">
            Total de votos:
            <span class="font-semibold text-gray-900">{{
              stats.totalVotes
            }}</span>
          </p>
          <!-- Aquí insertamos el gráfico de barras -->
          <div class="mt-6">
            <RatingBarChart :rating-distribution="ratingDistribution" />
          </div>
        </div>
        <!-- Top Usuarios -->
        <div class="text-center">
          <h3 class="text-3xl font-bold mb-4 text-gray-900">Top usuarios</h3>
          <div class="mb-4">
            <h4 class="text-2xl font-semibold mb-2 text-gray-900">
              Más discos votados
            </h4>
            <ul class="list-none">
              <li
                v-for="(user, index) in topUsersByRates"
                :key="user.user.id"
                class="flex items-center justify-center mb-2"
              >
                <span class="mr-2" v-html="getTrophyIcon(index)"></span>
                <span class="font-medium">{{ user.user.username }}</span>
                <span class="ml-2 text-gray-600"
                  >- {{ user.rateCount }} votos</span
                >
              </li>
            </ul>
          </div>
          <div>
            <h4 class="text-2xl font-semibold mb-2 text-gray-900">
              Más portadas votadas
            </h4>
            <ul class="list-none">
              <li
                v-for="(user, index) in topUsersByCover"
                :key="user.user.id"
                class="flex items-center justify-center mb-2"
              >
                <span class="mr-2" v-html="getTrophyIcon(index)"></span>
                <span class="font-medium">{{ user.user.username }}</span>
                <span class="ml-2 text-gray-600"
                  >- {{ user.totalCover }} votos</span
                >
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de álbumes mejor valorados -->
    <div class="text-center mb-6">
      <h3 class="text-4xl font-bold text-gray-900">Discos mejor valorados</h3>
    </div>
    <!-- Botones de filtro por fecha -->
    <div class="flex justify-center space-x-4 mb-6">
      <button
        @click="
          selectedPeriod = 'week';
          fetchDiscs();
        "
        :class="
          selectedPeriod === 'week'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700'
        "
        class="px-4 py-2 rounded"
      >
        Semana
      </button>
      <button
        @click="
          selectedPeriod = 'month';
          fetchDiscs();
        "
        :class="
          selectedPeriod === 'month'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700'
        "
        class="px-4 py-2 rounded"
      >
        Mes
      </button>
      <button
        @click="
          selectedPeriod = 'year';
          fetchDiscs();
        "
        :class="
          selectedPeriod === 'year'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700'
        "
        class="px-4 py-2 rounded"
      >
        Año
      </button>
      <button
        @click="
          selectedPeriod = 'all';
          fetchDiscs();
        "
        :class="
          selectedPeriod === 'all'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700'
        "
        class="px-4 py-2 rounded"
      >
        Todos
      </button>
    </div>

    <!-- Grid de Discos -->
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
        :pendingId="disc.pendingId"
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

    // Período seleccionado: 'week' (por defecto), 'month', 'year' o 'all'
    const selectedPeriod = ref("week");

    // Función que calcula el dateRange según el período seleccionado.
    // Para "all" no se enviará ningún filtro.
    const getDateRange = (period: string): [string, string] | undefined => {
      const today = new Date();
      if (period === "all") {
        return undefined;
      }

      if (period === "week") {
        // Últimos 7 días
        const startDate = new Date();
        startDate.setDate(today.getDate() - 7);
        return [
          startDate.toISOString().split("T")[0],
          today.toISOString().split("T")[0],
        ];
      }

      if (period === "month") {
        const today = new Date();

        // Primer día del mes actual
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);

        // Último día del mes actual (día 0 del mes siguiente)
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        return [
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0],
        ];
      }

      if (period === "year") {
        // Año natural: desde el 1 de enero hasta el 31 de diciembre del año actual
        const startDate = new Date(today.getFullYear(), 0, 1);
        const endDate = new Date(today.getFullYear(), 11, 31);
        return [
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0],
        ];
      }

      // Si por alguna razón no coincide, devuelve los últimos 7 días
      const defaultStart = new Date();
      defaultStart.setDate(today.getDate() - 7);
      return [
        defaultStart.toISOString().split("T")[0],
        today.toISOString().split("T")[0],
      ];
    };

    // Función para obtener los discos y estadísticas según el filtro de fechas
    const fetchDiscs = async () => {
      try {
        const dateRange = getDateRange(selectedPeriod.value);
        const response: DiscsStatsResponse =
          await getTopRatedOrFeaturedAndStats(dateRange);
        discs.value = response.discs;
        stats.value.totalDiscs = response.totalDiscs;
        stats.value.totalVotes = response.totalVotes;
        topUsersByRates.value = response.topUsersByRates;
        topUsersByCover.value = response.topUsersByCover;
        ratingDistribution.value = response.ratingDistribution;
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
      selectedPeriod,
      fetchDiscs,
      getTrophyIcon,
    };
  },
});
</script>

<style>
.grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
</style>
