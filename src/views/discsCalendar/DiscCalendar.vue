<template>
  <div class="max-w-7xl mx-auto mt-10">
    <h1 class="text-4xl font-bold mb-8 text-center">Discs by Release Date</h1>
    <div>
      <div class="flex justify-center mb-6">
        <button
          v-for="(month, index) in months"
          :key="index"
          @click="selectMonth(index)"
          :class="{
            'bg-blue-500 text-white': selectedMonth === index,
            'bg-gray-200 text-gray-800': selectedMonth !== index,
          }"
          class="px-4 py-2 mx-1 rounded transition-all duration-300"
        >
          {{ month }}
        </button>
      </div>

      <!-- Lista de discos agrupados -->
      <div
        v-for="(group, index) in groupedDiscs"
        :key="group.releaseDate"
        class="mb-8"
      >
        <!-- Encabezado del grupo con botón de toggle -->
        <div
          class="flex justify-between items-center bg-gray-200 px-4 py-2 rounded cursor-pointer"
          @click="toggleGroup(index)"
        >
          <h3 class="text-2xl font-bold">{{ group.releaseDate }}</h3>
          <button v-if="groupState[index]">
            <i
              :class="
                groupState[index] ? 'fas fa-chevron-up' : 'fas fa-chevron-down'
              "
            ></i>
          </button>
        </div>

        <!-- Contenido del grupo desplegable -->
        <transition name="fade-slide" mode="out-in">
          <div v-if="groupState[index]" class="mt-4">
            <button
              v-if="new Date(group.releaseDate) < new Date()"
              @click="buscarEnlacesSpotify(group.discs)"
              class="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            >
              Buscar Enlaces en Spotify
            </button>
            <button
              @click="exportarHtml(group)"
              class="bg-green-500 text-white px-4 py-2 rounded mt-4 ml-3"
            >
              Exportar HTML de esta semana
            </button>

            <ul>
              <li
                v-for="disc in group.discs"
                :key="disc.id"
                class="flex flex-col md:flex-row md:justify-between p-4 border-b"
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
      <span v-if="loading" class="text-gray-600">Loading more discs...</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, reactive } from "vue";
import axios from "axios";
import { updateDisc, deleteDisc, getDiscsDated } from "@services/discs/discs";
import { getGenres } from "@services/genres/genres";
import DiscComponent from "./components/DiscComponent.vue";
import { obtenerTokenSpotify } from "@helpers/SpotifyFunctions.ts";

export default defineComponent({
  components: { DiscComponent },
  name: "DiscsList",
  setup() {
    // Lista agrupada de discos
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

    const selectedMonth = ref(new Date().getMonth()); // Mes actual por defecto

    const selectMonth = async (monthIndex: number) => {
      console.log("index: " + monthIndex);
      selectedMonth.value = monthIndex;

      // Calcular el rango de fechas del mes seleccionado
      const year = new Date().getFullYear();
      const startDate = new Date(Date.UTC(year, monthIndex, 1)).toISOString();
      console.log("startDate: " + startDate);
      const endDate = new Date(
        year,
        monthIndex + 1,
        0,
        23,
        59,
        59,
        999
      ).toISOString();

      offset.value = 0; // Reinicia la página
      groupedDiscs.value = []; // Limpia los discos cargados

      // Llamar al servicio con el nuevo rango de fechas
      await fetchDiscsByDateRange(startDate, endDate);
    };

    const fetchDiscsByDateRange = async (
      startDate: string,
      endDate: string
    ) => {
      loading.value = true;
      groupedDiscs.value = []; // Limpia los discos cargados
      try {
        const response = await getDiscsDated(limit.value, offset.value, [
          startDate,
          endDate,
        ]);

        response.data.forEach((newGroup: any) => {
          newGroup.discs.forEach((disc: any) => {
            disc.genreId = disc.genre?.id || "";
          });
        });

        console.log("grouped Disc final", groupedDiscs.value);
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

    // Paginación
    const limit = ref(200);

    const offset = ref(0);
    const totalItems = ref(0);
    const hasMore = ref(true);

    // Estado de carga
    const loading = ref(false);

    // Referencia para scroll infinito
    const loadMore = ref<HTMLDivElement | null>(null);

    // Lista de géneros
    const genres = ref<any[]>([]);
    const genres2 = ref<any[]>([]);
    genres2.value = ["list", "of", "options"];

    // ---------------------------
    // Función para obtener discos
    // ---------------------------

    const fetchDiscs = async () => {
      if (loading.value || !hasMore.value) return;

      loading.value = true;

      try {
        // Calcular el rango de fechas del mes seleccionado
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

        // Realizar la solicitud con el rango de fechas
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

    // --------------------------------
    // Función para obtener todos los géneros
    // --------------------------------
    const fetchGenres = async () => {
      try {
        const genresResponse = await getGenres(50, 0);
        genres.value = genresResponse.data.sort((a, b) => a.name.localeCompare(b.name));
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
            disc.image = album.images?.[0]?.url || null; // Obtiene la URL de la imagen
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

    // Función para obtener el token de Spotify

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

      // Crear un blob con el HTML y descargarlo
      const blob = new Blob([html], { type: "text/html" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `discs_${group.releaseDate}.html`;
      link.click();
      URL.revokeObjectURL(link.href);
    };


    // ----------------
    // onMounted
    // ----------------
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

/* Transición más fluida para el desplegable */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.6s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-15px);
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
