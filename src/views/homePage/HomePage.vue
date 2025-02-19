<template>
  <div :class="{ 'menu-open': menuVisible }" class="w-full max-w-[90%] sm:max-w-full mx-auto mt-10">
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
        </div>
      </div>
    </div>

    <h2 class="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-6">Mejores discos</h2>
    <!-- Sección de álbumes mejor valorados -->
    <div class="flex justify-center gap-4 mb-6 font-semibold">
      <button @click="selectedPeriod = 'week'"
        :class="selectedPeriod === 'week'
          ? 'bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-gray-800 font-semibold'
          : 'bg-gray-200 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-gray-800 hover:font-semibold'"
        class="px-5 py-2 rounded-full shadow-md">
        Semana
      </button>
      <button @click="selectedPeriod = 'month'"
        :class="selectedPeriod === 'month'
          ? 'bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-gray-800 font-semibold'
          : 'bg-gray-200 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-gray-800 hover:font-semibold'"
        class="px-5 py-2 rounded-full shadow-md">
        Mes
      </button>
      <button @click="selectedPeriod = 'year'"
        :class="selectedPeriod === 'year'
          ? 'bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-gray-800 font-semibold'
          : 'bg-gray-200 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-gray-800 hover:font-semibold'"
        class="px-5 py-2 rounded-full shadow-md">
        Año
      </button>
      <button @click="{
        selectedPeriod = 'all';
        fetchDiscs();
      }"
        :class="selectedPeriod === 'all'
          ? 'bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-gray-800 font-semibold'
          : 'bg-gray-200 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-gray-800 hover:font-semibold'"
        class="px-5 py-2 rounded-full shadow-md">
        Todos
      </button>
    </div>

    <!-- Select para elegir el rango (solo para semana, mes o año) -->
    <div v-if="selectedPeriod !== 'all'" class="mb-6 flex justify-center">
      <div class="relative w-44">
        <select v-model="selectedOption" @change="fetchDiscs"
          class="appearance-none w-full px-4 py-3 border font-semibold bg-gradient-to-r from-[#d9e021] to-[#fcee21] border-[#d9e021] rounded-full shadow-md bg-white text-gray-800">
          <option v-for="option in optionsForSelect" :key="option.label" :value="option">
            {{ option.label }}
          </option>
        </select>
        <!-- Icono de flecha -->
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>


    <!-- Grid de Discos -->
    <div class="grid gap-6">
      <DiscCard v-for="disc in discs" :key="disc.id" :id="disc.id" :ep="disc.ep" :image="disc.image" :name="disc.name"
        :releaseDate="disc.releaseDate" :artistName="disc.artist?.name" :genreName="disc.genre?.name"
        :genreColor="disc.genre?.color" :link="disc.link" :averageRate="disc.averageRate"
        :averageCover="disc.averageCover" :rate="disc.userRate?.rate" :cover="disc.userRate?.cover"
        :isNew="!disc.userRate" :userDiscRate="disc.userRate?.id" :favoriteId="disc.userFavoriteId"
        :pendingId="disc.pendingId" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from "vue";
import { getTopRatedOrFeaturedAndStats } from "@services/discs/discs";
import type { Disc, DiscsStatsResponse } from "@services/discs/disc";
import DiscCard from "@components/DiscCardComponent.vue";
import RatingBarChart from "./components/RatingBarChar.vue"; // Componente del gráfico

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
    // Almacena el rango seleccionado mediante el <select>
    const selectedOption = ref<{ start: string; end: string; label: string } | null>(null);

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
        const response: DiscsStatsResponse = await getTopRatedOrFeaturedAndStats(dateRange);
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

    // ---------------------------------
    // Actualiza la opción seleccionada cuando cambia el período
    // ---------------------------------
    watch(selectedPeriod, (newPeriod) => {
      if (newPeriod === "week") {
        selectedOption.value = weekOptions.value[weekOptions.value.length - 1];
      } else if (newPeriod === "month") {
        // Por defecto se asigna la opción "30 días naturales" (índice 0)
        selectedOption.value = monthOptions.value[0];
      } else if (newPeriod === "year") {
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

    onMounted(() => {
      if (selectedPeriod.value === "week" && weekOptions.value.length) {
        selectedOption.value = weekOptions.value[weekOptions.value.length - 1];
      }
      fetchDiscs();
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
