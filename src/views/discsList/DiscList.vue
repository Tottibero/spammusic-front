<template>
  <div class="max-w-[100rem] mx-auto mt-10 px-4">
    <h1 class="text-4xl font-bold mb-8 text-center">Álbumes</h1>

    <!-- Filtros -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por álbum o artista..."
        class="flex-[3] p-2 border border-gray-300 rounded mb-4 sm:mb-0"
      />
      <select
        id="genreSelect"
        v-model="selectedGenre"
        @change="fetchDiscs(true)"
        class="flex-[2] border rounded px-3 py-2 text-gray-700 focus:outline-none"
      >
        <option value="">Seleccione un género</option>
        <option v-for="genre in genres" :key="genre.id" :value="genre.id">
          {{ genre.name }}
        </option>
      </select>
      <Datepicker
        v-model="selectedWeek"
        :weekPicker="true"
        placeholder="Selecciona una semana"
        class="flex-[2] p-2 border border-gray-300 rounded"
      />
    </div>

    <!-- Selección de tipo de vista (Radio Buttons) -->
    <!-- Selección de tipo de vista (Estilo Chips) -->
    <!-- Selección de tipo de vista (Estilo Chips) -->
    <div class="mb-6 flex justify-start space-x">
      <label
        class="px-4 py-2 rounded-full cursor-pointer text-sm font-medium transition-all duration-200"
        :class="
          viewMode === 'all'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        "
      >
        <input type="radio" v-model="viewMode" value="all" class="hidden" />
        Todos los discos
      </label>

      <label
        class="px-4 py-2 rounded-full cursor-pointer text-sm font-medium transition-all duration-200"
        :class="
          viewMode === 'rates'
            ? 'bg-yellow-500 text-white'
            : 'bg-gray-200  hover:bg-yellow-500'
        "
      >
        <input type="radio" v-model="viewMode" value="rates" class="hidden" />
        Mis votos
      </label>


      <label
        class="px-4 py-2 rounded-full cursor-pointer text-sm font-medium transition-all duration-200"
        :class="
          viewMode === 'favorites'
            ? 'bg-red-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-red-500'
        "
      >
        <input
          type="radio"
          v-model="viewMode"
          value="favorites"
          class="hidden"
        />
        Favoritos
      </label>

    </div>

    <!-- Contenedor de cuadrícula para las tarjetas -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      <!-- Iteración de discos -->
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
      />
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

export default defineComponent({
  components: {
    DiscCard,
    Datepicker,
  },
  setup() {
    const discs = ref([]); // Lista de discos
    const limit = ref(20);
    const offset = ref(0);
    const totalItems = ref(0);
    const loading = ref(false);
    const hasMore = ref(true);
    const loadMore = ref(null);
    const searchQuery = ref("");
    const selectedWeek = ref(null);
    const genres = ref<any[]>([]);
    const selectedGenre = ref("");

    const viewMode = ref("all"); // "all" | "favorites" | "rates"

    const fetchDiscs = async (reset = false) => {
      if (loading.value) return;
      loading.value = true;

      try {
        if (reset) {
          discs.value = [];
          offset.value = 0;
          hasMore.value = true;
        }

        const response = await getDiscs(
          limit.value,
          offset.value,
          searchQuery.value,
          selectedWeek.value,
          selectedGenre.value
        );
        discs.value.push(...response.data);
        totalItems.value = response.totalItems;
        offset.value += limit.value;
        hasMore.value = offset.value < totalItems.value;
      } catch (error) {
        console.error("Error fetching discs:", error);
      } finally {
        loading.value = false;
      }
    };

    const fetchRates = async () => {
      if (loading.value) return;
      loading.value = true;

      try {
        const response = await getRatesByUser(
          limit.value,
          offset.value,
          searchQuery.value,
          selectedWeek.value,
          selectedGenre.value
        );
        if (offset.value === 0) {
          discs.value = [];
        }
        discs.value.push(
          ...response.data.map((rate) => ({
            ...rate.disc,
            userRate: { rate: rate.rate, cover: rate.cover, id: rate.id },
          }))
        );
        totalItems.value = response.totalItems;
        offset.value += limit.value;
        hasMore.value = offset.value < totalItems.value;
      } catch (error) {
        console.error("Error fetching rates:", error);
      } finally {
        loading.value = false;
      }
    };

    const fetchFavorites = async () => {
      if (loading.value) return;
      loading.value = true;

      try {
        const response = await getFavoritesByUser(
          limit.value,
          offset.value,
          searchQuery.value,
          selectedWeek.value,
          selectedGenre.value
        );
        if (offset.value === 0) {
          discs.value = [];
        }
        discs.value.push(
          ...response.data.map((favorite) => ({
            ...favorite.disc,
            favoriteId: favorite.id, // Agregar ID del favorito
            userRate: favorite.userRate
              ? {
                  id: favorite.userRate.id,
                  rate: favorite.userRate.rate,
                  cover: favorite.userRate.cover,
                }
              : null,
          }))
        );
        totalItems.value = response.totalItems;
        offset.value += limit.value;
        hasMore.value = offset.value < totalItems.value;
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        loading.value = false;
      }
    };

    watch(viewMode, () => {
      offset.value = 0;
      discs.value = [];
      if (viewMode.value === "rates") fetchRates();
      else if (viewMode.value === "favorites") fetchFavorites();
      else fetchDiscs(true);
    });

    onMounted(() => {
      fetchDiscs();
    });

    return {
      discs,
      loadMore,
      loading,
      searchQuery,
      selectedWeek,
      selectedGenre,
      genres,
      viewMode,
    };
  },
});
</script>

<style>
/* Estilos para el diseño de cuadrícula */

/* Pantallas pequeñas (1 columna) */
.grid {
  grid-template-columns: 1fr;
}

/* Tablets (2 columnas) */
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Escritorios medianos (3 columnas) */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Escritorios grandes (4 columnas) */
@media (min-width: 1280px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
.mb-6 {
  display: flex;
  flex-direction: column;
}

@media (min-width: 640px) {
  .mb-6 {
    flex-direction: row;
    align-items: center;
    gap: 1rem; /* Espacio horizontal entre los filtros */
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
</style>
