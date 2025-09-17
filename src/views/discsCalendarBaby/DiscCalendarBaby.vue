<template>
  <div :class="{ 'menu-open': menuVisible }" class="max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
    <h1 class="text-4xl font-bold mb-8 text-center text-gray-900">
      Calendario
    </h1>

    <!-- Filtros -->
    <DiscFilters :searchQuery="searchQuery" :selectedGenre="selectedGenre" :genres="genres" :showWeekPicker="false"
      @update:searchQuery="searchQuery = $event" @update:selectedGenre="selectedGenre = $event"
    selectClass="w-[280px] sm:w-[300px]"
      @reset-and-fetch="resetAndFetch" />

    <div>
      <div class="flex flex-wrap justify-center gap-2 mb-6 overflow-x-auto">
        <button v-for="(month, index) in months" :key="index" @click="selectMonth(index)" :class="{
          'bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-[#211d1d] font-semibold':
            selectedMonth === index,
          'bg-gray-200 text-gray-800 hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] hover:text-[#211d1d]':
            selectedMonth !== index,
        }"
          class="px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap shadow-md mb-1 font-semibold text-gray-900">
          {{ month }}
        </button>
      </div>

      <!-- Lista de discos agrupados (resto del template) -->
      <div v-for="(group, index) in filteredGroupedDiscs" :key="group.releaseDate" class="mb-8">
        <!-- ... (resto del contenido del v-for, incluyendo el encabezado del grupo, el botón de toggle, etc.) ... -->
        <div
          class="flex justify-between items-center px-5 py-3 rounded-full cursor-pointer bg-gray-200 transition-all duration-300 shadow-md"
          :class="groupState[index]
              ? 'bg-gradient-to-r from-gray-900 to-gray-700'
              : 'hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300 bg-gray-100'
            " @click="toggleGroup(index)">
          <h3 class="text-xl sm:text-2xl font-semibold transition-colors duration-300"
            :style="{ color: groupState[index] ? 'white' : '#1f2937' }">
            {{ formatDate(group.releaseDate) }}
          </h3>

          <button class="transition-transform duration-300" :class="{ 'rotate-180': groupState[index] }">
            <i class="fas fa-chevron-down transition-colors duration-300"
              :style="{ color: groupState[index] ? 'white' : '#4b5563' }"></i>
          </button>
        </div>

        <!-- Contenido del grupo desplegable -->
        <transition name="fade-slide" mode="out-in">
          <div v-if="groupState[index]" class="mt-4 overflow-x-auto">

            <!-- Lista de discos -->
            <ul class="w-full">
              <li v-for="disc in group.discs" :key="disc.id"
                class="flex flex-col md:flex-row md:justify-between p-4 border-b w-full">
                <DiscComponent :disc="disc" :genres="genres" :artistCountry="disc.artist?.country"
                  @disc-deleted="removeDisc" @date-changed="handleDateChange" />
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

<script lang="ts">
import { defineComponent, ref, onMounted, reactive, computed, nextTick } from "vue";
import axios from "axios";
import { updateDisc, deleteDisc, getDiscsDated } from "@services/discs/discs";
import { getGenres } from "@services/genres/genres";
import DiscComponentBaby from "./components/DiscComponentBaby.vue";
import { obtenerTokenSpotify } from "@helpers/SpotifyFunctions.ts";
import DiscFilters from "@components/DiscFilters.vue"; 

export default defineComponent({
  components: { DiscComponent: DiscComponentBaby, DiscFilters },
  name: "DiscsList",
  setup() {
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
    const selectedWeek = ref<Date | null>(null); 

    const filteredGroupedDiscs = computed(() => {
      return groupedDiscs.value
        .map((group) => ({
          ...group,
          discs: group.discs.filter((disc) => {
            const matchesSearch =
              disc.name
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase()) ||
              disc.artist.name
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase());
            const matchesGenre =
              !selectedGenre.value || disc.genre?.id === selectedGenre.value;


            if (selectedWeek.value) {
              const discDate = new Date(disc.releaseDate);
              const weekStart = new Date(selectedWeek.value); 
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6); 

              return (
                matchesSearch &&
                matchesGenre &&
                discDate >= weekStart &&
                discDate <= weekEnd
              );
            }

            return matchesSearch && matchesGenre; 
          }),
        }))
        .filter((group) => group.discs.length > 0); 
    });

    const fetchAllPagesForMonth = async () => {

      try { if (loadMore.value) observer.unobserve(loadMore.value); } catch { }

      while (hasMore.value) {
        await fetchDiscs();  
        await nextTick();    
      }

      try { if (loadMore.value) observer.observe(loadMore.value); } catch { }
    };

    const selectMonth = async (monthIndex: number) => {
      selectedMonth.value = monthIndex;
      const year = new Date().getFullYear();
      const startDate = new Date(Date.UTC(year, monthIndex, 1)).toISOString();
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999).toISOString();

      offset.value = 0;
      groupedDiscs.value = [];

      await fetchDiscsByDateRange(startDate, endDate); 
      await fetchAllPagesForMonth();                  
    };

    const fetchDiscsByDateRange = async (
      startDate: string,
      endDate: string
    ) => {
      loading.value = true;

      try {
        const response = await getDiscsDated(limit.value, offset.value, [
          startDate,
          endDate,
        ]);

        response.data.forEach((group, index) => {
          groupState[index] = false;
        });

        groupedDiscs.value = response.data; 
        totalItems.value = response.totalItems;
        offset.value = limit.value;
        hasMore.value = offset.value < totalItems.value;
      } catch (error) {
        console.error("Error fetching discs by date range:", error);
      } finally {
        loading.value = false;
      }
    };

    const toggleGroup = (index) => {
      groupState[index] = !groupState[index];
    };

    const limit = ref(200);

    const offset = ref(0);
    const totalItems = ref(0);
    const hasMore = ref(true);


    const loading = ref(false);

    const loadMore = ref<HTMLDivElement | null>(null);

    const genres = ref<any[]>([]);
    const genres2 = ref<any[]>([]);
    genres2.value = ["list", "of", "options"];

    const fetchDiscs = async () => {
      if (loading.value || !hasMore.value) return;

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

        response.data.forEach((newGroup: any) => {
          newGroup.discs.forEach((disc: any) => {
            disc.genreId = disc.genre?.id || "";
          });

          const existingGroup = groupedDiscs.value.find(
            (group: any) => group.releaseDate === newGroup.releaseDate
          );
          if (existingGroup) {
            existingGroup.discs.push(...newGroup.discs);
          } else {
            groupedDiscs.value.push(newGroup);
          }
        });

        totalItems.value = response.totalItems;
        offset.value += limit.value;
        hasMore.value = offset.value < totalItems.value;
      } catch (error) {
        console.error("Error fetching discs:", error);
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const optionsDate: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      const optionsWeekday: Intl.DateTimeFormatOptions = {
        weekday: "long",
      };

      const formattedDate = date.toLocaleDateString("es-ES", optionsDate);

      const formattedWeekday = date.toLocaleDateString("es-ES", optionsWeekday);

      return `${formattedDate}, ${formattedWeekday}`;
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
      const token = await obtenerTokenSpotify();
      if (!token) {
        console.error("No se pudo obtener el token de Spotify");
        return;
      }

      for (const disc of discs) {
        try {
          const query = encodeURIComponent(
            `album:${disc.name} artist:${disc.artist.name}`
          );
          const response = await axios.get(
            `https://api.spotify.com/v1/search?q=${query}&type=album&limit=1`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.albums.items.length > 0) {
            const album = response.data.albums.items[0];
            disc.link = album.external_urls.spotify;
            disc.image = album.images?.[0]?.url || null;
            console.log("disc.image", disc.image);

            console.log("Datos enviados al backend:", {
              link: disc.link,
              image: disc.image,
            });

            await updateDisc(disc.id, {
              link: disc.link,
              image: disc.image,
              verified: true,
            });
          } else {
            disc.link = "No se encontró el álbum";
          }
        } catch (error) {
          console.error(`Error al buscar el álbum ${disc.name}:`, error);
          disc.link = "Error al realizar la búsqueda";
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

      fetchDiscs(); 
    };

    onMounted(() => {
      if (loadMore.value) {
        observer.observe(loadMore.value);
      }

      selectMonth(new Date().getMonth());
      fetchGenres();
    });

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchDiscs();
      }
    });

    return {
      groupedDiscs,
      groupState,
      genres,
      loadMore,
      loading,
      hasMore,
      buscarEnlacesSpotify,
      exportarHtml,
      toggleGroup,
      months,
      selectedMonth,
      selectMonth,
      formatDate,
      searchQuery,
      selectedGenre,
      selectedWeek,
      resetAndFetch,
      filteredGroupedDiscs, 
    };
  },
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
