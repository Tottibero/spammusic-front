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
      :searchQuery="searchQuery"
      :selectedGenre="selectedGenre"
      :genres="genreOptions"
      :countries="countries"
      :showWeekPicker="false"
      @update:searchQuery="searchQuery = $event"
      @update:selectedGenre="selectedGenre = $event"
      selectClass="w-[280px] sm:w-[300px] w-full"
      @reset-and-fetch="resetAndFetch"
    />

    <div>
      <div
        class="flex flex-wrap justify-center gap-2 mb-6 mt-6 overflow-x-auto"
      >
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

      <!-- Lista de discos agrupados (resto del template) -->
      <div
        v-for="(group, index) in filteredGroupedDiscs"
        :key="group.releaseDate"
        class="mb-8"
      >
        <!-- ... (resto del contenido del v-for, incluyendo el encabezado del grupo, el botón de toggle, etc.) ... -->
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
                  :countries="countries"
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

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  reactive,
  computed,
  nextTick,
} from "vue";
import { updateDisc, getDiscsDated } from "@services/discs/discs";
import { getGenres } from "@services/genres/genres";
import { getCountries } from "@services/countries/countries";
import DiscComponent from "./components/DiscComponent.vue";
import { obtenerTokenSpotify } from "@helpers/SpotifyFunctions.ts";
import { searchSpotifyAlbum } from "@helpers/spotifySearch";
import DiscFilters from "@components/DiscFilters.vue";

export default defineComponent({
  components: { DiscComponent, DiscFilters },
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

    const norm = (s: string) =>
      s
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const filteredGroupedDiscs = computed(() => {
      const q = norm(searchQuery.value || "");
      return groupedDiscs.value
        .map((group) => ({
          ...group,
          discs: group.discs.filter((disc) => {
            const matchesSearch =
              !q ||
              norm(disc.name).includes(q) ||
              norm(disc.artist.name).includes(q);
            const matchesGenre =
              !selectedGenre.value ||
              String(disc.genre?.id ?? "") === String(selectedGenre.value);
            return matchesSearch && matchesGenre;
          }),
        }))
        .filter((g) => g.discs.length > 0);
    });

    const toDateKey = (value: string | Date | null | undefined) => {
      if (!value) return null;
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return date.toISOString().slice(0, 10);
    };

    const toIsoMidnight = (value: string | Date | null | undefined) => {
      const key = toDateKey(value);
      if (!key) return null;
      return new Date(`${key}T00:00:00.000Z`).toISOString();
    };

    const captureGroupState = () => {
      const snapshot = new Map<string, boolean>();
      groupedDiscs.value.forEach((group, index) => {
        const key = toDateKey(group.releaseDate);
        if (key) {
          snapshot.set(key, Boolean(groupState[index]));
        }
      });
      return snapshot;
    };

    const restoreGroupState = (snapshot: Map<string, boolean>) => {
      Object.keys(groupState).forEach((key) => {
        Reflect.deleteProperty(groupState, key);
      });
      groupedDiscs.value.forEach((group, index) => {
        const key = toDateKey(group.releaseDate);
        groupState[index] = key ? snapshot.get(key) ?? false : false;
      });
    };

    const fetchAllPagesForMonth = async () => {
      try {
        if (loadMore.value) observer.unobserve(loadMore.value);
      } catch {}

      while (hasMore.value) {
        await fetchDiscs();
        await nextTick();
      }

      try {
        if (loadMore.value) observer.observe(loadMore.value);
      } catch {}
    };

    const selectMonth = async (monthIndex: number) => {
      selectedMonth.value = monthIndex;
      const year = new Date().getFullYear();
      const startDate = new Date(Date.UTC(year, monthIndex, 1)).toISOString();
      const endDate = new Date(
        year,
        monthIndex + 1,
        0,
        23,
        59,
        59,
        999
      ).toISOString();

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
          group.discs.forEach((disc: any) => {
            disc.genreId = disc.genre?.id ?? "";
          });
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
    const genreOptions = computed(() =>
      (genres.value ?? [])
        .filter((g) => g && g.id)
        .map((g) => ({
          id: g.id,
          name: g.name && g.name.trim() ? g.name : "(Sin nombre)",
          color: g.color ?? null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    );

    const genres2 = ref<any[]>([]);
    const countries = ref<any[]>([]);

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

    const removeDisc = (discId: string) => {
      const snapshot = captureGroupState();
      let changed = false;
      const cleanedGroups = groupedDiscs.value
        .map((group) => {
          const discs = group.discs.filter((disc: any) => disc.id !== discId);
          if (discs.length === group.discs.length) return group;
          changed = true;
          return { ...group, discs };
        })
        .filter((group) => group.discs.length > 0);

      if (!changed) return;

      groupedDiscs.value = cleanedGroups;
      restoreGroupState(snapshot);
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

    const fetchCountries = async () => {
      try {
        const countriesResponse = await getCountries(250, 0);
        countries.value = countriesResponse.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    const handleDateChange = (payload: {
      discId: string;
      previousDate?: string | Date | null;
      newDate: string | Date | null;
      disc: any;
    }) => {
      const { discId, newDate, disc } = payload;
      const snapshot = captureGroupState();
      const isoDate = toIsoMidnight(newDate);
      if (!isoDate) return;

      const dateKey = toDateKey(isoDate);
      if (!dateKey) return;

      const targetMonth = new Date(isoDate).getUTCMonth();

      let nextGroups = groupedDiscs.value
        .map((group) => {
          const discs = group.discs.filter((item: any) => item.id !== discId);
          return discs.length === group.discs.length ? group : { ...group, discs };
        })
        .filter((group) => group.discs.length > 0);

      if (targetMonth === selectedMonth.value) {
        const discCopy = {
          ...disc,
          releaseDate: isoDate,
          artist: disc?.artist ? { ...disc.artist } : disc.artist,
          genre: disc?.genre ? { ...disc.genre } : disc.genre,
          genreId: disc?.genreId ?? disc?.genre?.id ?? "",
        };

        let inserted = false;
        nextGroups = nextGroups.map((group) => {
          if (toDateKey(group.releaseDate) !== dateKey) return group;
          inserted = true;
          const discs = [
            ...group.discs.filter((item: any) => item.id !== discCopy.id),
            discCopy,
          ];
          return { ...group, discs };
        });

        if (!inserted) {
          nextGroups = [
            ...nextGroups,
            {
              releaseDate: isoDate,
              discs: [discCopy],
            },
          ];
        }
      }

      nextGroups = [...nextGroups].sort(
        (a, b) =>
          new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
      );

      groupedDiscs.value = nextGroups;
      restoreGroupState(snapshot);

      if (targetMonth === selectedMonth.value) {
        const newIndex = groupedDiscs.value.findIndex(
          (group) => toDateKey(group.releaseDate) === dateKey
        );
        if (newIndex !== -1) {
          groupState[newIndex] = true;
        }
      }
    };

    const buscarEnlacesSpotify = async (discs: any[]) => {
      const token = await obtenerTokenSpotify();
      if (!token) {
        console.error("Unable to obtain Spotify token");
        return;
      }

      for (const disc of discs) {
        const hasExistingLink = Boolean(disc?.link);
        const hasExistingImage = Boolean(disc?.image);
        if (hasExistingLink || hasExistingImage) continue;

        try {
          const album = await searchSpotifyAlbum(
            token,
            disc.name,
            disc.artist?.name ?? ""
          );
          if (album) {
            disc.link = album.external_urls.spotify;
            disc.image = album.images?.[0]?.url || null;

            await updateDisc(disc.id, {
              link: disc.link,
              image: disc.image,
              verified: true,
              genreId: disc.genreId ?? disc.genre?.id ?? null,
            });
          } else {
            disc.link = "Album not found";
          }
        } catch (error) {
          console.error(`Error while searching album "${disc.name}" on Spotify:`, error);
          disc.link = "Error while performing search";
        }
      }
    };

    const exportarHtml = (group: any) => {
      const genreById = new Map(
        genres.value.map((g: any) => [String(g.id), g.name || "(Sin nombre)"])
      );

      let html = `
  <figure class="wp-block-table is-style-stripes">
    <table>
      <tbody>`;

      group.discs.forEach((disc: any) => {
        const genreName =
          genreById.get(String(disc.genreId ?? disc.genre?.id ?? "")) ||
          disc.genre?.name ||
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
      fetchCountries();
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
      removeDisc,
      handleDateChange,
      months,
      selectedMonth,
      selectMonth,
      formatDate,
      searchQuery,
      selectedGenre,
      selectedWeek,
      resetAndFetch,
      filteredGroupedDiscs,
      countries,
      genreOptions,
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
