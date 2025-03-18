<template>
  <div
    :class="{ 'menu-open': menuVisible }"
    class="max-w-[100rem] mx-auto mt-10 px-4"
  >
    <h1 class="text-4xl font-bold mb-8 text-center text-gray-900">Discos</h1>

    <DiscFilters
      :searchQuery="searchQuery"
      :selectedGenre="selectedGenre"
      :selectedWeek="selectedWeek"
      :genres="genres"
      @update:searchQuery="searchQuery = $event"
      @update:selectedGenre="selectedGenre = $event"  
      @update:selectedWeek="selectedWeek = $event"
      @resetAndFetch="resetAndFetch"
    />

    <!-- Selección de tipo de vista (Estilo Chips) -->
    <div class="mb-6 flex justify-start space-x-2">
      <label class="px-4 py-2 rounded-full cursor-pointer text-sm shadow-lg font-medium transition-all duration-200"
        :class="viewMode === 'all'
          ? 'bg-gray-800 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ">
        <input type="radio" v-model="viewMode" value="all" class="hidden" />
        Todos los discos <span v-if="totalDisc !== ''">({{ totalDisc }})</span>
      </label>

      <label
        class="px-4 py-2 rounded-full cursor-pointer text-sm shadow-lg font-medium transition-all duration-200"
        :class="
          viewMode === 'rates'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'
        "
      >
        <input type="radio" v-model="viewMode" value="rates" class="hidden" />
        Mis votos <span v-if="totalRates !== ''">({{ totalRates }})</span>
      </label>

      <label
        class="px-4 py-2 rounded-full cursor-pointer text-sm shadow-lg font-medium transition-all duration-200"
        :class="
          viewMode === 'covers'
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'
        "
      >
        <input type="radio" v-model="viewMode" value="covers" class="hidden" />
        Mis portadas <span v-if="totalCovers !== ''">({{ totalCovers }})</span>
      </label>

      <label
        class="px-4 py-2 rounded-full cursor-pointer text-sm shadow-lg font-medium transition-all duration-200"
        :class="
          viewMode === 'favorites'
            ? 'bg-red-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        "
      >
        <input
          type="radio"
          v-model="viewMode"
          value="favorites"
          class="hidden"
        />
        Favoritos
        <span v-if="totalFavorites !== ''">({{ totalFavorites }})</span>
      </label>

      <label
        class="px-4 py-2 rounded-full cursor-pointer text-sm shadow-lg font-medium transition-all duration-200"
        :class="
          viewMode === 'pendientes'
            ? 'bg-yellow-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        "
      >
        <input
          type="radio"
          v-model="viewMode"
          value="pendientes"
          class="hidden"
        />
        Pendientes
        <span v-if="totalPendings !== ''">({{ totalPendings }})</span>
      </label>
    </div>

    <!-- Contenedor de cuadrícula para las tarjetas -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      <DiscCard
        v-for="disc in discs"
        :key="disc.id"
        :id="disc.id"
        :ep="disc.ep"
        :image="disc.image"
        :name="disc.name"
        :releaseDate="disc.releaseDate"
        :artistName="disc.artist?.name || 'Desconocido'"
        :genreName="disc.genre?.name"
        :genreColor="disc.genre?.color"
        :link="disc.link"
        :averageRate="disc.averageRate"
        :averageCover="disc.averageCover"
        :rate="disc.userRate?.rate"
        :cover="disc.userRate?.cover"
        :isNew="!disc.userRate"
        :userDiscRate="disc.userRate?.id"
        :favoriteId="disc.favoriteId"
        :pendingId="disc.pendingId"
        :comment-count="disc.commentCount"
        :rateCount="disc.rateCount"
      />
    </div>

    <!-- Elemento para disparar la carga adicional -->
    <div ref="loadMore" class="mt-10 text-center">
      <span v-if="loading" class="text-gray-600">Cargando más discos...</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, nextTick } from "vue";
import { getDiscs } from "@services/discs/discs";
import DiscCard from "@components/DiscCardComponent.vue";
import Datepicker from "@vuepic/vue-datepicker";
import { getGenres } from "@services/genres/genres";
import { getRatesByUser } from "@services/rates/rates";
import { getFavoritesByUser } from "@services/favorites/favorites";
import { getPendingsByUser } from "@services/pendings/pendings";
import DiscFilters from "@components/DiscFilters.vue";
// Importamos el componente SearchableSelect
import SearchableSelect from "@/components/SearchableSelect.vue";

export default defineComponent({
  components: {
    DiscCard,
    Datepicker,
    SearchableSelect,
    DiscFilters,
  },
  setup() {
    const discs = ref([]);
    const limit = ref(20);
    const offset = ref(0);
    const totalItems = ref(0);
    const loading = ref(false);
    const hasMore = ref(true);
    const viewMode = ref("all");
    const loadMore = ref(null);
    const totalDisc = ref("");
    const totalRates = ref("");
    const totalCovers = ref("");
    const totalFavorites = ref("");
    const totalPendings = ref("");

    //filtros
    const searchQuery = ref("");
    const selectedWeek = ref(null);
    const genres = ref<any[]>([]);
    const selectedGenre = ref("");

    const handleGenreChange = async (newValue: string) => {
      selectedGenre.value = newValue;
      console.log("selectedGenre" + selectedGenre.value);
      await nextTick(); // Espera a que Vue actualice el estado antes de continuar
    };

    const fetchGenres = async () => {
      try {
        const response = await getGenres(50, 0);
        genres.value = response.data;
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    const fetchData = async (reset = false) => {
      let type;
      if (loading.value) return;
      loading.value = true;
      console.log("selectedGenre.value", selectedGenre.value);
      try {
        if (reset) {
          discs.value = [];
          offset.value = 0;
          hasMore.value = true;
          totalCovers.value = "";
          totalDisc.value = "";
          totalFavorites.value = "";
          totalRates.value = "";
          totalPendings.value = "";
        }

        let response;
        if (viewMode.value === "rates") {
          type = "rate";
          response = await getRatesByUser(
            limit.value,
            offset.value,
            searchQuery.value,
            selectedWeek.value,
            selectedGenre.value,
            type
          );
          totalRates.value = response.totalItems;
          discs.value.push(
            ...response.data.map((rate) => ({
              ...rate.disc,
              userRate: {
                rate: rate.rate,
                cover: rate.cover,
                id: rate.id,
              },
            }))
          );
        } else if (viewMode.value === "covers") {
          type = "cover";
          response = await getRatesByUser(
            limit.value,
            offset.value,
            searchQuery.value,
            selectedWeek.value,
            selectedGenre.value,
            type
          );
          totalCovers.value = response.totalItems;
          discs.value.push(
            ...response.data.map((rate) => ({
              ...rate.disc,
              userRate: {
                rate: rate.rate,
                cover: rate.cover,
                id: rate.id,
              },
            }))
          );
        } else if (viewMode.value === "favorites") {
          response = await getFavoritesByUser(
            limit.value,
            offset.value,
            searchQuery.value,
            selectedWeek.value,
            selectedGenre.value
          );
          totalFavorites.value = response.totalItems;
          discs.value.push(
            ...response.data.map((favorite) => ({
              ...favorite.disc,
              favoriteId: favorite.id,
              pendingId: favorite.disc.userPending
                ? favorite.disc.userPending.id
                : null,
              userRate: favorite.disc.userRate
                ? {
                    id: favorite.disc.userRate.id,
                    rate: favorite.disc.userRate.rate,
                    cover: favorite.disc.userRate.cover,
                  }
                : null,
            }))
          );
          console.log("disc.value", discs.value);
        } else if (viewMode.value === "pendientes") {
          // Nueva rama para pendientes
          response = await getPendingsByUser(
            limit.value,
            offset.value,
            searchQuery.value,
            selectedWeek.value,
            selectedGenre.value
          );
          totalPendings.value = response.totalItems;
          console.log("response data", response.data[0]);
          discs.value.push(
            ...response.data.map((pending) => ({
              ...pending.disc,
              pendingId: pending.id,
              userRate: pending.disc.userRate
                ? {
                    id: pending.disc.userRate.id,
                    rate: pending.disc.userRate.rate,
                    cover: pending.disc.userRate.cover,
                  }
                : null,
            }))
          );
          console.log("disc.value", discs.value);
        } else if (viewMode.value === "pendientes") {
          // Nueva rama para pendientes
          response = await getPendingsByUser(
            limit.value,
            offset.value,
            searchQuery.value,
            selectedWeek.value,
            selectedGenre.value
          );
          totalPendings.value = response.totalItems;
          console.log("response data", response.data[0]);
          discs.value.push(
            ...response.data.map((pending) => ({
              ...pending.disc,
              pendingId: pending.id,
              userRate: pending.disc.userRate
                ? {
                    id: pending.disc.userRate.id,
                    rate: pending.disc.userRate.rate,
                    cover: pending.disc.userRate.cover,
                  }
                : null,
            }))
          );
          console.log("disc.value", discs.value);
        } else if (viewMode.value === "pendientes") {
          // Nueva rama para pendientes
          response = await getPendingsByUser(
            limit.value,
            offset.value,
            searchQuery.value,
            selectedWeek.value,
            selectedGenre.value
          );
          totalPendings.value = response.totalItems;
          console.log("response data", response.data[0]);
          discs.value.push(
            ...response.data.map((pending) => ({
              ...pending.disc,
              pendingId: pending.id,
              userRate: pending.disc.userRate
                ? {
                    id: pending.disc.userRate.id,
                    rate: pending.disc.userRate.rate,
                    cover: pending.disc.userRate.cover,
                  }
                : null,
            }))
          );
          console.log("disc.value", discs.value);
        } else if (viewMode.value === "pendientes") {
          // Nueva rama para pendientes
          response = await getPendingsByUser(
            limit.value,
            offset.value,
            searchQuery.value,
            selectedWeek.value,
            selectedGenre.value
          );
          totalPendings.value = response.totalItems;
          console.log("response data", response.data[0]);
          discs.value.push(
            ...response.data.map((pending) => ({
              ...pending.disc,
              pendingId: pending.id,
              userRate: pending.disc.userRate
                ? {
                    id: pending.disc.userRate.id,
                    rate: pending.disc.userRate.rate,
                    cover: pending.disc.userRate.cover,
                  }
                : null,
            }))
          );
        } else {
          response = await getDiscs(
            limit.value,
            offset.value,
            searchQuery.value,
            selectedWeek.value,
            selectedGenre.value
          );
          totalDisc.value = response.totalItems;
          discs.value.push(...response.data);
        }

        totalItems.value = response.totalItems;
        offset.value += limit.value;
        hasMore.value = offset.value < totalItems.value;
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        loading.value = false;
      }
    };

    const setupObserver = () => {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore.value) {
          fetchData();
        }
      });
      if (loadMore.value) {
        observer.observe(loadMore.value);
      }
    };

    watch([viewMode, searchQuery, selectedWeek, selectedGenre], () => { // Incluye selectedGenre en el watch
      resetAndFetch(); // Llama a resetAndFetch directamente
    });


    onMounted(() => {
      fetchGenres();
      fetchData();
      setupObserver();
    });

    const resetAndFetch = () => {
      offset.value = 0;
      fetchData(true);
    };

    return {
      discs,
      loading,
      searchQuery,
      selectedWeek,
      selectedGenre,
      genres,
      viewMode,
      loadMore,
      totalDisc,
      totalRates,
      totalCovers,
      totalFavorites,
      totalPendings,
      resetAndFetch,
      handleGenreChange,
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

.mb-6 {
  display: flex;
  flex-direction: column;
}

@media (min-width: 640px) {
  .mb-6 {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
}

.flex-[2] {
  display: flex;
  align-items: center;
  justify-content: start;
}

input[type="checkbox"] {
  margin-right: 0.5rem;
}

.custom-height-select .search_input_trigger {
  height: 26px;
  padding: 0.6rem 0.75rem;
  font-size: 1rem;
  font-weight: 500;
}

.search__input::placeholder {
  color: #9ca3af;
}
</style>
