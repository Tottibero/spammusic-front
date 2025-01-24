<template>
  <div class="max-w-[100rem] mx-auto mt-10 px-4">
    <h1 class="text-4xl font-bold mb-8 text-center">Álbumes</h1>

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
      <div class="flex flex-[2] items-center space-x-2">
        <input
          type="checkbox"
          id="fetchRatesCheckbox"
          v-model="fetchRates"
          @change="handleFetchRates"
          class="w-5 h-5 border border-gray-300 rounded"
        />
        <label for="fetchRatesCheckbox" class="text-gray-700">Mis votos</label>
      </div>
    </div>
    <!-- Campo de búsqueda -->

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
      />
    </div>

    <!-- Elemento para disparar la carga adicional -->
    <div ref="loadMore" class="mt-10 text-center">
      <span v-if="loading" class="text-gray-600">Cargando más discos...</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from "vue";
import { getDiscs } from "@services/discs/discs";
import DiscCard from "@components/DiscCardComponent.vue";
import Datepicker from "@vuepic/vue-datepicker";
import { getGenres } from "@services/genres/genres";
import { getRatesByUser } from "@services/rates/rates";

export default defineComponent({
  components: {
    DiscCard,
    Datepicker,
  },
  setup() {
    const discs = ref([]); // Lista de discos
    const limit = ref(20); // Cantidad de discos por carga
    const offset = ref(0); // Offset para la paginación
    const totalItems = ref(0); // Número total de discos disponibles
    const loading = ref(false); // Estado de carga
    const hasMore = ref(true); // Si hay más discos para cargar
    const loadMore = ref(null); // Elemento para el observador
    const searchQuery = ref(""); // Valor de búsqueda
    const selectedWeek = ref(null); // Valor del selector de semana
    const genres = ref<any[]>([]); // Lista de géneros
    const selectedGenre = ref(""); // Género seleccionado
    const fetchRates = ref(false); // Estado del checkbox para votos

    /**
     * Función para cargar discos desde la API
     */
    const fetchDiscs = async (reset = false) => {
      if (loading.value) return;

      loading.value = true;

      try {
        if (reset) {
          // Si es un reinicio, resetea el estado
          discs.value = [];
          offset.value = 0;
          hasMore.value = true;
        }

        const response = await getDiscs(
          limit.value,
          offset.value,
          searchQuery.value,
          selectedWeek.value,
          selectedGenre.value // Agregar el género seleccionado al fetch
        );
        discs.value.push(...response.data);
        totalItems.value = response.totalItems;

        // Incrementar el offset
        offset.value += limit.value;

        // Determinar si hay más discos para cargar
        hasMore.value = offset.value < totalItems.value;
      } catch (error) {
        console.error("Error fetching discs:", error);
      } finally {
        loading.value = false;
      }
    };

    /**
     * Función para cargar discos votados por el usuario
     */
    const handleFetchRates = async () => {
      if (loading.value) return;

      loading.value = true;

      try {
        const response = await getRatesByUser(
          limit.value,
          offset.value,
          searchQuery.value,
          selectedWeek.value,
          selectedGenre.value // Agregar el género seleccionado al fetch
        );
        // Mapea los datos para que coincidan con el formato esperado
        if (offset.value === 0) {
          discs.value = []; // Reinicia los discos si es el primer fetch
        }
        discs.value.push(
          ...response.data.map((rate) => ({
            ...rate.disc,
            userRate: { rate: rate.rate, cover: rate.cover, id: rate.id },
          }))
        );
        totalItems.value = response.totalItems;

        // Incrementar offset para la carga perezosa
        offset.value += limit.value;

        // Determinar si hay más datos
        hasMore.value = offset.value < totalItems.value;
      } catch (error) {
        console.error("Error fetching rates:", error);
      } finally {
        loading.value = false;
      }
    };

    const fetchGenres = async () => {
      try {
        const genresResponse = await getGenres(50, 0);
        genres.value = genresResponse.data;
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    /**
     * Configurar IntersectionObserver para detectar cuando el usuario
     * llega al final de la lista y cargar más discos.
     */
    const setupObserver = () => {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore.value) {
          fetchRates.value ? handleFetchRates() : fetchDiscs();
        }
      });

      if (loadMore.value) {
        observer.observe(loadMore.value);
      }
    };

    /**
     * Observar cambios en fetchRates para alternar entre discos y votos
     */
    watch(fetchRates, (newValue) => {
      if (newValue) {
        // Reiniciar offset y limpiar discos al activar el checkbox
        offset.value = 0;
        discs.value = [];
        handleFetchRates(); // Cargar discos votados
      } else {
        // Reiniciar offset y limpiar discos al desactivar el checkbox
        offset.value = 0;
        discs.value = [];
        fetchDiscs(true); // Cargar discos normales
      }
    });

    /**
     * Observar cambios en el campo de búsqueda y refrescar los datos.
     */

    watch([searchQuery, selectedGenre, selectedWeek], () => {
      if (fetchRates.value) {
        // Si el checkbox está activado, utiliza handleFetchRates
        offset.value = 0;
        discs.value = [];
        handleFetchRates();
      } else {
        // Si el checkbox está desactivado, utiliza fetchDiscs
        fetchDiscs(true);
      }
    });

    /**
     * Montar el componente y cargar discos iniciales
     */
    onMounted(() => {
      fetchDiscs();
      fetchGenres();
      setupObserver();
    });

    return {
      discs,
      loadMore,
      loading,
      searchQuery,
      selectedWeek,
      selectedGenre,
      genres,
      fetchDiscs,
      handleFetchRates,
      fetchRates,
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
