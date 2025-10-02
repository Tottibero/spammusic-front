<template>
  <div :class="{ 'menu-open': menuVisible }" class="max-w-[100rem] mx-auto mt-10 px-4">
    <div class="bg-white shadow-lg rounded-lg p-4 sm:p-6 mb-10 max-w-[90vw] md:max-w-[100rem] mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <!-- Estadísticas de la App -->
        <div class="text-center md:border-r border-gray-200 pb-4 md:pb-0 md:pr-4 text-sm sm:text-base md:text-lg">
          <h3 class="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
            Estadísticas de discos
          </h3>
          <p class="text-lg md:text-xl text-gray-900">
            Total de discos:
            <span class="font-semibold text-gray-900">{{ stats.totalDiscs }}</span>
          </p>
          <p class="text-lg mt-2">
            Total de votos:
            <span class="font-semibold text-gray-900">{{ stats.totalVotes }}</span>
          </p>
          <!-- Aquí insertamos el gráfico de barras -->
          <div class="mt-6 w-full max-w-[90%] sm:max-w-full mx-auto overflow-hidden">
            <RatingBarChart :rating-distribution="ratingDistribution" />
          </div>
        </div>
        <!-- Top Usuarios -->
        <div class="text-center">
          <h3 class="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Top usuarios</h3>
          <div class="mb-4">
            <h4 class="text-lg md:text-2xl font-semibold mb-2 text-gray-900">
              Más discos votados
            </h4>
            <ul class="list-none">
              <li v-for="(user, index) in topUsersByRates" :key="user.user.id"
                class="flex items-center justify-center mb-2 text-sm md:text-base">
                <span class="mr-2" v-html="getTrophyIcon(index)"></span>
                <span class="font-medium">{{ user.user.username }}</span>
                <span class="ml-2 text-gray-600">- {{ user.rateCount }} votos</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg md:text-2xl font-semibold mb-2 text-gray-900">
              Más portadas votadas
            </h4>
            <ul class="list-none">
              <li v-for="(user, index) in topUsersByCover" :key="user.user.id"
                class="flex items-center justify-center mb-2">
                <span class="mr-2" v-html="getTrophyIcon(index)"></span>
                <span class="font-medium">{{ user.user.username }}</span>
                <span class="ml-2 text-gray-600">- {{ user.totalCover }} votos</span>
              </li>
            </ul>
          </div>
          <!-- Botón para abrir estadísticas detalladas -->
          <div class="mt-8">
            <button @click="showDetailedStats = true" class="inline-flex items-center text-[#211d1d] font-semibold px-4 py-2 rounded-full shadow transition duration-100
           bg-gray-100 hover:bg-gradient-to-r hover:from-[#fcee21] hover:to-[#d9e021] hover:text-[#211d1d]">
              <i class="fa-solid fa-chart-bar text-md mr-2"></i>
              Estadísticas detalladas
            </button>
            <StatsModal v-if="showDetailedStats" @close="showDetailedStats = false" />
          </div>

        </div>

      </div>
    </div>

    <h2 class="text-2xl md:text-3xl font-bold text-gray-900 text-center justify-center py-8">Mejores discos</h2>

    <!-- Columna 1: Selector de género -->

    <div>
      <DiscFilters :selectedGenre="selectedGenre" :selectedWeek="null" :genres="genres" :showWeekPicker="false"
        :showSearchQuery="false" selectClass="w-full" wrapperClass="w-full"
        @update:selectedGenre="selectedGenre = $event" @resetAndFetch="fetchDiscs" />
    </div>
    

    <!-- Columna 2: Botones de periodo + selector de rango como pill -->
    <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-5 mt-6 mb-8">

      <button @click="selectedPeriod = 'week'"
        :class="selectedPeriod === 'week'
          ? 'bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-gray-800 font-semibold'
          : 'bg-gray-200 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-gray-800 hover:font-semibold'"
        class="px-4 py-1.5 rounded-full shadow-md text-md">
        Semana
      </button>

      <button @click="selectedPeriod = 'month'"
        :class="selectedPeriod === 'month'
          ? 'bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-gray-800 font-semibold'
          : 'bg-gray-200 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-gray-800 hover:font-semibold'"
        class="px-4 py-1.5 rounded-full shadow-md text-md">
        Mes
      </button>

      <button @click="selectedPeriod = 'year'"
        :class="selectedPeriod === 'year'
          ? 'bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-gray-800 font-semibold'
          : 'bg-gray-200 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-gray-800 hover:font-semibold'"
        class="px-4 py-1.5 rounded-full shadow-md text-md">
        Año
      </button>

      <button @click="{ selectedPeriod = 'all'; fetchDiscs(); }"
        :class="selectedPeriod === 'all'
          ? 'bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-gray-800 font-semibold'
          : 'bg-gray-200 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-gray-800 hover:font-semibold'"
        class="px-4 py-1.5 rounded-full shadow-md text-md">
        Todos
      </button>

      <div v-if="selectedPeriod !== 'all'" class="relative">
        <select v-model="selectedOption" @change="fetchDiscs" class="min-w-[12rem] px-4 pr-9 py-1.5 rounded-full shadow-md text-md font-semibold
           text-gray-800 appearance-none
           bg-gradient-to-r from-[#d9e021] to-[#fcee21]
           focus:outline-none focus:ring-2 focus:ring-[#d9e021]/50 cursor-pointer">
          <option v-for="option in optionsForSelect" :key="option.label" :value="option">
            {{ option.label }}
          </option>
        </select>

        <!-- caret -->
        <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-800/80"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>


    <!-- Grid de Discos -->
    <div class="grid gap-6">
      <DiscCard v-for="disc in discs" :key="disc.id" :id="disc.id" :ep="disc.ep" :image="disc.image" :name="disc.name"
        :releaseDate="disc.releaseDate" :artistName="disc.artist?.name" :genreName="disc.genre?.name"
        :genreColor="disc.genre?.color" :link="disc.link" :averageRate="disc.averageRate"
        :averageCover="disc.averageCover" :rate="disc.userRate?.rate" :cover="disc.userRate?.cover"
        :isNew="!disc.userRate" :userDiscRate="disc.userRate?.id" :favoriteId="disc.userFavoriteId"
        :pendingId="disc.pendingId" :comment-count="disc.commentCount" :rateCount="disc.voteCount"
        :artistCountry="disc.artist?.country" />
    </div>
  </div>

</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from "vue";
import { getTopRatedOrFeaturedAndStats } from "@services/discs/discs";
import type { Disc, DiscsStatsResponse } from "@services/discs/disc";
import { getGenres } from "@services/genres/genres";
import DiscCard from "@components/DiscCardComponent.vue";
import RatingBarChart from "./components/RatingBarChar.vue";
import StatsModal from "@components/StatsModal.vue";
import DiscFilters from "@components/DiscFilters.vue";

export default defineComponent({
  components: {
    DiscCard,
    RatingBarChart,
    StatsModal,
    DiscFilters,
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
    const showDetailedStats = ref(false);

    // Período seleccionado: 'week' (por defecto), 'month', 'year' o 'all'
    const selectedPeriod = ref("week");
    // Almacena el rango seleccionado mediante el <select>
    const selectedOption = ref<{ start: string; end: string; label: string } | null>(null);

    // Filtros
    const searchQuery = ref("");
    const selectedGenre = ref("");
    const genres = ref<any[]>([]);

    // Función para obtener los géneros
    const fetchGenres = async () => {
      try {
        const response = await getGenres(150, 0);
        genres.value = response.data.sort((a, b) => a.name.localeCompare(b.name));
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    // Función auxiliar para formatear la fecha en formato local (YYYY-MM-DD)
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // -------------------------
    // Opciones para el <select>
    // -------------------------

    // Opciones para "Semana": generar semanas (de viernes a jueves) desde el primer viernes del año hasta la semana actual
    const weekOptions = computed(() => {
      const options: Array<{ start: string; end: string; label: string }> = [];
      const currentYear = new Date().getFullYear();
      // Buscar el primer viernes del año
      let firstFriday = new Date(currentYear, 0, 1);
      while (firstFriday.getDay() !== 5) {
        firstFriday.setDate(firstFriday.getDate() + 1);
      }
      // Calcular el inicio de la semana actual (último viernes)
      const today = new Date();
      const offset = (today.getDay() - 5 + 7) % 7;
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - offset);

      const monthNames = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];

      let current = new Date(firstFriday);
      while (current <= currentWeekStart) {
        const startDate = new Date(current);
        const endDate = new Date(current);
        endDate.setDate(current.getDate() + 6);
        const startStr = formatLocalDate(startDate);
        const endStr = formatLocalDate(endDate);
        // Etiqueta: "díaInicio-díaFin mes" (por ejemplo, "3-9 enero")
        const label = `${startDate.getDate()}-${endDate.getDate()} ${monthNames[startDate.getMonth()]}`;
        options.push({ start: startStr, end: endStr, label });
        current.setDate(current.getDate() + 7);
      }
      return options;
    });

    // Opciones para "Mes": se agrega una opción por defecto de "30 días naturales"
    // y a continuación se incluyen las opciones de meses calendario
    const monthOptions = computed(() => {
      const options: Array<{ start: string; end: string; label: string }> = [];
      const today = new Date();
      // Opción "30 días naturales": últimos 30 días (incluyendo hoy)
      const naturalStart = new Date(today);
      naturalStart.setDate(today.getDate() - 29);
      options.push({
        start: formatLocalDate(naturalStart),
        end: formatLocalDate(today),
        label: "30 días naturales",
      });
      // Opciones para cada mes calendario hasta el mes actual
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      for (let month = 0; month <= currentMonth; month++) {
        const startDate = new Date(currentYear, month, 1);
        const endDate = new Date(currentYear, month + 1, 0);
        const startStr = formatLocalDate(startDate);
        const endStr = formatLocalDate(endDate);
        const label = `${monthNames[month]} (${startDate.getDate()}-${endDate.getDate()})`;
        options.push({ start: startStr, end: endStr, label });
      }
      return options;
    });

    // Opciones para "Año": sólo el año actual
    const yearOptions = computed(() => {
      const options: Array<{ start: string; end: string; label: string }> = [];
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1);
      const endDate = new Date(currentYear, 11, 31);
      const startStr = formatLocalDate(startDate);
      const endStr = formatLocalDate(endDate);
      options.push({ start: startStr, end: endStr, label: `${currentYear}` });
      return options;
    });

    // Computed que devuelve las opciones según el período seleccionado
    const optionsForSelect = computed(() => {
      if (selectedPeriod.value === "week") return weekOptions.value;
      if (selectedPeriod.value === "month") return monthOptions.value;
      if (selectedPeriod.value === "year") return yearOptions.value;
      return [];
    });

    // ---------------------------------
    // Función para obtener los discos y stats
    // ---------------------------------
    const fetchDiscs = async () => {
      try {
        let dateRange;
        if (selectedPeriod.value === "all") {
          dateRange = undefined;
        } else if (selectedOption.value) {
          dateRange = [selectedOption.value.start, selectedOption.value.end];
        } else {
          dateRange = undefined;
        }
        console.log('Fetching discs with genre:', selectedGenre.value);
        const response: DiscsStatsResponse = await getTopRatedOrFeaturedAndStats(
          dateRange,
          selectedGenre.value ? selectedGenre.value : undefined
        );
        discs.value = response.discs.map((disc) => ({
          ...disc,
          artist: {
            ...disc.artist,
            country: disc.artist?.country ?? null,
          },
        }));
        stats.value.totalDiscs = response.totalDiscs;
        stats.value.totalVotes = response.totalVotes;
        topUsersByRates.value = response.topUsersByRates;
        topUsersByCover.value = response.topUsersByCover;
        ratingDistribution.value = response.ratingDistribution;
      } catch (error) {
        console.error("Error fetching discs and stats:", error);
      }
    };

    // ---------------------------------
    // Actualiza la opción seleccionada cuando cambia el período
    // ---------------------------------
    watch([selectedPeriod, selectedGenre], () => {
      console.log('Period or Genre changed:', { period: selectedPeriod.value, genre: selectedGenre.value });
      if (selectedPeriod.value === "week") {
        selectedOption.value = weekOptions.value[weekOptions.value.length - 1];
      } else if (selectedPeriod.value === "month") {
        selectedOption.value = monthOptions.value[0];
      } else if (selectedPeriod.value === "year") {
        selectedOption.value = yearOptions.value[0];
      }
      fetchDiscs();
    });

    // ---------------------------------
    // Función para devolver el icono de trofeo según posición
    // ---------------------------------
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

    onMounted(async () => {
      console.log('HomePage mounting...');
      await fetchGenres();

      if (selectedPeriod.value === "week" && weekOptions.value.length) {
        selectedOption.value = weekOptions.value[weekOptions.value.length - 1];
      }

      await fetchDiscs();
    });

    return {
      discs,
      stats,
      topUsersByRates,
      topUsersByCover,
      ratingDistribution,
      selectedPeriod,
      selectedOption,
      optionsForSelect,
      fetchDiscs,
      getTrophyIcon,
      showDetailedStats,
      // Filter related
      searchQuery,
      selectedGenre,
      genres
    };
  },
});
</script>

<style scoped>
.grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

@media (max-width: 393px) {
  .max-w-\[100rem\] {
    max-width: 393px !important;
    margin: 0 auto;
  }

  .bg-white {
    padding: 1rem !important;
  }
}
</style>