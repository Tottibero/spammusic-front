<template>
  <div
    :class="{ 'menu-open': menuVisible }"
    class="max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8"
  >
    <h1 class="text-4xl font-bold mb-8 text-center text-gray-900">
      Calendario
    </h1>

    <!-- Filtros -->
    <DiscFilters
      v-model:searchQuery="searchQuery"
      v-model:selectedGenre="selectedGenre"
      :genres="genres"
      :showWeekPicker="false"
      @reset-and-fetch="resetAndFetch"
    />

    <div>
      <div class="flex flex-wrap justify-center gap-2 mb-6 overflow-x-auto">
        <button
          v-for="(month, index) in months"
          :key="index"
          @click="selectMonth(index)"
          :class="{
            'bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-[#211d1d] font-semibold':
              selectedMonth === index,
            'bg-gray-200 text-gray-800 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-[#211d1d]':
              selectedMonth !== index,
          }"
          class="px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap shadow-md mb-1 font-semibold text-gray-900"
        >
          {{ month }}
        </button>
      </div>

      <!-- Lista de discos agrupados -->
      <div
        v-for="(group, index) in filteredGroupedDiscs"
        :key="group.releaseDate"
        class="mb-8"
      >
        <div
          class="flex justify-between items-center px-5 py-3 rounded-full cursor-pointer bg-gray-200 transition-all duration-300 shadow-md"
          :class="
            groupState[index]
              ? 'bg-gradient-to-r from-gray-900 to-gray-700'
              : 'hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300 bg-gray-100'
          "
          @click="toggleGroup(index)"
        >
          <h3
            class="text-xl sm:text-2xl font-semibold transition-colors duration-300"
            :style="{ color: groupState[index] ? 'white' : '#1f2937' }"
          >
            {{ formatDate(group.releaseDate) }}
          </h3>

          <button
            class="transition-transform duration-300"
            :class="{ 'rotate-180': groupState[index] }"
          >
            <i
              class="fas fa-chevron-down transition-colors duration-300"
              :style="{ color: groupState[index] ? 'white' : '#4b5563' }"
            ></i>
          </button>
        </div>

        <!-- Contenido del grupo desplegable -->
        <transition name="fade-slide" mode="out-in">
          <div v-if="groupState[index]" class="mt-4 overflow-x-auto">
            <!-- Contenedor de botones centrado -->
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-center gap-2 mt-4 w-full"
            >
              <button
                v-if="new Date(group.releaseDate) < new Date()"
                @click="buscarEnlacesSpotify(group.discs)"
                class="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-all duration-300 w-full max-w-[300px] sm:max-w-none sm:w-auto text-center self-center"
              >
                Buscar enlaces en Spotify
              </button>

              <span class="hidden sm:inline-block w-4"></span>

              <button
                @click="exportarHtml(group)"
                class="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-all duration-300 w-full max-w-[300px] sm:max-w-none sm:w-auto text-center self-center"
              >
                Exportar HTML de esta semana
              </button>
            </div>

            <!-- Lista de discos -->
            <ul class="w-full">
              <li
                v-for="disc in group.discs"
                :key="disc.id"
                class="flex flex-col md:flex-row md:justify-between p-4 border-b w-full"
              >
                <DiscComponent
                  :disc="disc"
                  :genres="genres"
                  @disc-deleted="removeDisc"
                  @date-changed="handleDateChange"
                />
              </li>
            </ul>
          </div>
        </transition>
      </div>
    </div>

    <!-- Cargar más -->
    <div ref="loadMore" class="text-center py-6">
      <span v-if="loading" class="text-gray-600">Cargando discos...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { updateDisc, deleteDisc, getDiscsDated } from "@services/discs/discs";
import { getGenres } from "@services/genres/genres";
import DiscComponent from "./components/DiscComponent.vue";
import {
  obtenerTokenSpotify,
  buscarEnlacesSpotify as buscarEnlacesSpotifyHelper,
} from "@helpers/SpotifyFunctions.ts"; // Importa funciones de Spotify
import DiscFilters from "@components/DiscFilters.vue";

const menuVisible = ref(false); //  Eliminar si no se usa
const groupedDiscs = ref<any[]>([]);
const groupState = reactive({});

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const selectedMonth = ref(new Date().getMonth());

// --- Filtros ---
const searchQuery = ref("");
const selectedGenre = ref("");

// Paginación
const limit = ref(200);
const offset = ref(0);
const totalItems = ref(0);
const hasMore = ref(true);
const loading = ref(false);

const loadMore = ref<HTMLDivElement | null>(null);
const genres = ref<any[]>([]);

// Computed property para filtrar discos
const filteredGroupedDiscs = computed(() => {
  return groupedDiscs.value
    .map((group) => ({
      ...group,
      discs: group.discs.filter((disc) => {
        const matchesSearch =
          disc.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          disc.artist.name
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase());
        const matchesGenre =
          !selectedGenre.value || disc.genre?.id === selectedGenre.value;
        return matchesSearch && matchesGenre;
      }),
    }))
    .filter((group) => group.discs.length > 0);
});

const selectMonth = async (monthIndex: number) => {
  selectedMonth.value = monthIndex;
  offset.value = 0;
  groupedDiscs.value = [];
  await fetchDiscsByDateRange();
};

const fetchDiscsByDateRange = async () => {
  loading.value = true;
  try {
    const year = new Date().getFullYear();
    const startDate = new Date(
      Date.UTC(year, selectedMonth.value, 1)
    ).toISOString();
    const endDate = new Date(
      year,
      selectedMonth.value + 1,
      0,
      23,
      59,
      59,
      999
    ).toISOString();

    const response = await getDiscsDated(limit.value, offset.value, [
      startDate,
      endDate,
    ]);

    // Inicializa groupState ANTES de asignar los nuevos grupos
    response.data.forEach((group, index) => {
      groupState[index] = false;
    });

    groupedDiscs.value = response.data;
    totalItems.value = response.totalItems;
    offset.value += limit.value;
    hasMore.value = offset.value < totalItems.value;
  } catch (error) {
    console.error("Error fetching discs by date range:", error);
  } finally {
    loading.value = false;
  }
};

const toggleGroup = (index: number) => {
  groupState[index] = !groupState[index];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const optionsDate: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const formattedDate = date.toLocaleDateString("es-ES", optionsDate);

  return `${formattedDate}`;
};

const fetchGenres = async () => {
  try {
    const genresResponse = await getGenres(150, 0);
    genres.value = genresResponse.data.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  } catch (error) {
    console.error("Error fetching genres:", error);
  }
};

const buscarEnlacesSpotify = async (discs: any[]) => {
  const updatedDiscs = await buscarEnlacesSpotifyHelper(discs);
  if (updatedDiscs) {
    for (const disc of updatedDiscs) {

      const originalDisc = groupedDiscs.value
        .flatMap((group) => group.discs)
        .find((d) => d.id === disc.id);

      const alreadyHadValidLink =
        originalDisc?.link &&
        originalDisc.link !== "No se encontró el álbum" &&
        originalDisc.link !== "Error al realizar la búsqueda";

      if (
        disc.link &&
        disc.link !== "No se encontró el álbum" &&
        disc.link !== "Error al realizar la búsqueda" &&
        disc.image &&
        !alreadyHadValidLink
      ) {
        await updateDisc(disc.id, {
          link: disc.link,
          image: disc.image,
          verified: true,
        });
      }
    }
  }
};

const exportarHtml = (group: any) => {
  let html = `
  <figure class="wp-block-table is-style-stripes">
    <table>
      <tbody>`;

  group.discs.forEach((disc: any) => {
    const genreName =
      genres.value.find((genre) => genre.id === disc.genreId)?.name ||
      "Sin género";
    if (disc.link) {
      html += `
          <tr>
            <td class="has-text-align-left" data-align="left">${genreName}</td>
            <td><strong><a href="${disc.link}" target="_blank" rel="noreferrer noopener">${disc.artist.name} - ${disc.name}</a></strong></td>
          </tr>`;
    } else {
      html += `
          <tr>
            <td class="has-text-align-left" data-align="left">${genreName}</td>
            <td><strong>${disc.artist.name} - ${disc.name}</strong></td>
          </tr>`;
    }
  });

  html += `
      </tbody>
    </table>
  </figure>`;

  const blob = new Blob([html], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `discs_${group.releaseDate}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const resetAndFetch = () => {
  offset.value = 0;
  fetchDiscsByDateRange();
};

const removeDisc = (discId: number) => {
  // Encuentra y elimina el disco de groupedDiscs
  groupedDiscs.value = groupedDiscs.value
    .map((group) => ({
      ...group,
      discs: group.discs.filter((disc) => disc.id !== discId),
    }))
    .filter((group) => group.discs.length > 0); // Elimina grupos vacíos si es necesario.

  deleteDisc(discId);
};

const handleDateChange = async (updatedDisc) => {
  // Actualizar la fecha
  await updateDisc(updatedDisc.id, { release_date: updatedDisc.release_date });

  // 1. Eliminar el disco del grupo actual
  removeDisc(updatedDisc.id);

  // 2. Volver a cargar los datos (esto es un poco ineficiente, podrías refactorizar para insertar directamente,
  //     pero para casos simples y sin grandes volúmenes de datos, recargar es más fácil y menos propenso a errores)
  offset.value = 0;
  groupedDiscs.value = [];
  await fetchDiscsByDateRange();
};

onMounted(() => {
  selectMonth(new Date().getMonth());
  fetchGenres();

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value && !loading.value) {
      fetchDiscsByDateRange();
    }
  });

  if (loadMore.value) {
    observer.observe(loadMore.value);
  }
});
</script>

<style scoped>
h3 {
  color: #4a5568;
}

li {
  border-bottom: 1px solid #e2e8f0;
}

img {
  border-radius: 4px;
  object-fit: cover;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.6s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-15px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
