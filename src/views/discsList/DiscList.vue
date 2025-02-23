<template>
  <div :class="{ 'menu-open': menuVisible }" class="max-w-[100rem] mx-auto mt-10 px-4">
    <h1 class="text-4xl font-bold mb-8 text-center text-gray-900">Discos</h1>

    <!-- Filtros -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
      <input v-model="searchQuery" type="text" placeholder="Buscar álbum o artista..."
        class="flex-[3] p-2 shadow-md rounded-md mb-4 sm:mb-0" />

      <SearchableSelect v-model="selectedGenre" :options="genres" placeholder="Seleccione un género" title="name"
        trackby="id" :max="150" @update:modelValue="resetAndFetch"
        class="flex-[2] px-3 py-2 w-full rounded-md bg-white rounded shadow-md custom-height-select placeholder-gray-400" />


      <Datepicker v-model="selectedWeek" :weekPicker="true" placeholder="Selecciona una semana"
        class="flex-[2] px-3 py-2 w-full rounded-lg border-white mt-2 pl-1" />
    </div>
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

      <label class="px-4 py-2 rounded-full cursor-pointer text-sm shadow-lg font-medium transition-all duration-200"
        :class="viewMode === 'rates'
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 hover:bg-gray-300'
          ">
        <input type="radio" v-model="viewMode" value="rates" class="hidden" />
        Mis votos <span v-if="totalRates !== ''">({{ totalRates }})</span>
      </label>

      <label class="px-4 py-2 rounded-full cursor-pointer text-sm shadow-lg font-medium transition-all duration-200"
        :class="viewMode === 'covers'
          ? 'bg-green-500 text-white'
          : 'bg-gray-200 hover:bg-gray-300'
          ">
        <input type="radio" v-model="viewMode" value="covers" class="hidden" />
        Mis portadas <span v-if="totalCovers !== ''">({{ totalCovers }})</span>
      </label>

      <label class="px-4 py-2 rounded-full cursor-pointer text-sm shadow-lg font-medium transition-all duration-200"
        :class="viewMode === 'favorites'
          ? 'bg-red-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ">
        <input type="radio" v-model="viewMode" value="favorites" class="hidden" />
        Favoritos
        <span v-if="totalFavorites !== ''">({{ totalFavorites }})</span>
      </label>

      <label class="px-4 py-2 rounded-full cursor-pointer text-sm shadow-lg font-medium transition-all duration-200"
        :class="viewMode === 'pendientes'
          ? 'bg-yellow-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ">
        <input type="radio" v-model="viewMode" value="pendientes" class="hidden" />
        Pendientes
        <span v-if="totalPendings !== ''">({{ totalPendings }})</span>
      </label>
    </div>

    <!-- Contenedor de cuadrícula para las tarjetas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <DiscCard v-for="disc in discs" :key="disc.id" :id="disc.id" :ep="disc.ep" :image="disc.image" :name="disc.name"
        :releaseDate="disc.releaseDate" :artistName="disc.artist?.name || 'Desconocido'" :genreName="disc.genre?.name"
        :genreColor="disc.genre?.color" :link="disc.link" :averageRate="disc.averageRate"
        :averageCover="disc.averageCover" :rate="disc.userRate?.rate" :cover="disc.userRate?.cover"
        :isNew="!disc.userRate" :userDiscRate="disc.userRate?.id" :favoriteId="disc.favoriteId"
        :pendingId="disc.pendingId" :comment-count="disc.commentCount" />
    </div>

    <!-- Elemento para disparar la carga adicional -->
    <div ref="loadMore" class="mt-10 text-center">
      <span v-if="loading" class="text-gray-600">Cargando más discos...</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from "vue";
import { getDiscs } from "@services/discs/discs";
import DiscCard from "@components/DiscCardComponent.vue";
import Datepicker from "@vuepic/vue-datepicker";
import { getGenres } from "@services/genres/genres";
import { getRatesByUser } from "@services/rates/rates";
import { getFavoritesByUser } from "@services/favorites/favorites";
import { getPendingsByUser } from "@services/pendings/pendings";

// Importamos el componente SearchableSelect
import SearchableSelect from "@/components/SearchableSelect.vue";

export default defineComponent({
  components: {
    DiscCard,
    Datepicker,
    SearchableSelect,
  },
  setup() {
    const discs = ref([]);
    const limit = ref(20);
    const offset = ref(0);
    const totalItems = ref(0);
    const loading = ref(false);
    const hasMore = ref(true);
    const searchQuery = ref("");
    const selectedWeek = ref(null);
    const genres = ref<any[]>([]);
    const selectedGenre = ref("");
    const viewMode = ref("all");
    const loadMore = ref(null);
    const totalDisc = ref("");
    const totalRates = ref("");
    const totalCovers = ref("");
    const totalFavorites = ref("");
    const totalPendings = ref("");

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

    watch([viewMode, searchQuery, selectedGenre, selectedWeek], () => {
      offset.value = 0;
      fetchData(true);
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
