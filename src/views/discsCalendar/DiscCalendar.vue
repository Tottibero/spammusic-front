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
import Swal from "sweetalert2";
import DiscComponent from "./components/DiscComponent.vue";

export default defineComponent({
  components: { DiscComponent },
  name: "DiscsList",
  setup() {
    // Lista agrupada de discos
    const groupedDiscs = ref<any[]>([]);
    const editing = reactive<Record<string, boolean>>({});
    const editingDate: Record<string, boolean> = reactive({});
    const editingLink = reactive<Record<string, boolean>>({});
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
    const limit = ref(90);

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

    // -------------------------------------------------
    // Función que se ejecuta al cambiar de género un disco
    // -------------------------------------------------
    const onGenreChange = async (disc: any, genreId: string) => {
      try {
        await updateDisc(disc.id, {
          name: disc.name,
          genreId,
        });
        Swal.fire({
          title: "¡Éxito!",
          text: "Genero cambiado correctamente",
          icon: "success",
          position: "top-end",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
        });
      } catch (err) {
        console.log("err", err);
      }
    };

    // Función para buscar enlaces de Spotify para un grupo de discos
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
    const obtenerTokenSpotify = async () => {
      const client_id = import.meta.env.VITE_CLIENT_ID;
      const client_secret = import.meta.env.VITE_CLIENT_SECRET;
      const credentials = btoa(`${client_id}:${client_secret}`);

      try {
        const response = await axios.post(
          "https://accounts.spotify.com/api/token",
          "grant_type=client_credentials",
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${credentials}`,
            },
          }
        );
        return response.data.access_token;
      } catch (error) {
        console.error("Error al obtener el token de Spotify:", error);
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

      // Crear un blob con el HTML y descargarlo
      const blob = new Blob([html], { type: "text/html" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `discs_${group.releaseDate}.html`;
      link.click();
      URL.revokeObjectURL(link.href);
    };

    const buscarGeneroSpotify = async (disc: any) => {
      const token = await obtenerTokenSpotify();
      if (!token) {
        console.error("No se pudo obtener el token de Spotify");
        return;
      }

      try {
        // Paso 1: Busca el artista
        const query = encodeURIComponent(`artist:${disc.artist.name}`);
        const response = await axios.get(
          `https://api.spotify.com/v1/search?q=${query}&type=artist&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.artists.items.length > 0) {
          const artist = response.data.artists.items[0];
          const artistId = artist.id;

          // Paso 2: Obtén los álbumes/tracks más recientes del artista
          const albumsResponse = await axios.get(
            `https://api.spotify.com/v1/artists/${artistId}/albums`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: {
                include_groups: "album,single", // Solo álbumes y sencillos
                limit: 1, // Solo el lanzamiento más reciente
              },
            }
          );

          if (albumsResponse.data.items.length > 0) {
            const genres = artist.genres; // Géneros asociados al artista

            if (genres.length > 0) {
              disc.genero = genres.join(", "); // Agrega los géneros al disco
              Swal.fire({
                title: "¡Éxito!",
                text: `El género del último track: ${disc.genero}`,
                icon: "success",
                position: "top-end",
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
                toast: true,
              });
            } else {
              Swal.fire({
                title: "Sin géneros",
                text: `No se encontraron géneros asociados al artista "${disc.artist.name}".`,
                icon: "warning",
                position: "top-end",
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
                toast: true,
              });
            }
          } else {
            Swal.fire({
              title: "No se encontraron lanzamientos",
              text: `No se encontraron tracks recientes para el artista "${disc.artist.name}".`,
              icon: "warning",
              position: "top-end",
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false,
              toast: true,
            });
          }
        } else {
          Swal.fire({
            title: "Artista no encontrado",
            text: `No se encontró información para el artista "${disc.artist.name}" en Spotify.`,
            icon: "warning",
            position: "top-end",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
          });
        }
      } catch (error) {
        console.error("Error al buscar el género por último track:", error);
        Swal.fire({
          title: "Error",
          text: "Ocurrió un error al buscar el género del último track.",
          icon: "error",
          position: "top-end",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
        });
      }
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

    const findDiscById = (discId: string) => {
      for (const group of groupedDiscs.value) {
        const disc = group.discs.find((d: any) => d.id === discId);
        if (disc) return disc;
      }
      return null;
    };

    const enableEditing = (discId: string) => {
      const disc = findDiscById(discId);
      if (disc) {
        editing[discId] = true;
        disc.newName = disc.name; // Almacena el nombre actual como punto de partida
      }
    };

    const saveNameChange = async (disc: any) => {
      const newName = disc.newName || disc.name;
      editing[disc.id] = false;

      // Evita guardar si el nombre no cambió
      if (newName === disc.name) return;

      try {
        await updateDisc(disc.id, { name: newName, genreId: disc.genreId });
        disc.name = newName; // Actualiza el nombre en la interfaz

        Swal.fire({
          title: "¡Éxito!",
          text: "El nombre del disco se ha actualizado correctamente.",
          icon: "success",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al actualizar el nombre:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar el nombre del disco.",
          icon: "error",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      }
    };

    const enableDateEditing = (discId: any) => {
      editingDate[discId] = true;
    };

    const saveDateChange = async (disc: any) => {
      const newDate = new Date(disc.newDate);
      editingDate[disc.id] = false;

      if (newDate === disc.releaseDate) return;

      try {
        await updateDisc(disc.id, { releaseDate: newDate });
        disc.releaseDate = newDate;
        window.location.reload();
        Swal.fire({
          title: "¡Éxito!",
          text: "La fecha del disco se ha actualizado correctamente.",
          icon: "success",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al actualizar la fecha:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar la fecha del disco.",
          icon: "error",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      }
    };

    const getGenreColor = (genreId: string) => {
      const genre = genres.value.find((g) => g.id === genreId);
      return genre?.color || "transparent"; // Devuelve el color o un valor predeterminado
    };

    const truncateText = (text: string, maxLength: number) => {
      if (!text) return ""; // Si el texto está vacío, devuelve una cadena vacía
      return text.length > maxLength
        ? text.slice(0, maxLength) + "..." // Trunca y añade "..."
        : text; // Devuelve el texto sin cambios si no excede el límite
    };

    const handleDeleteDisc = async (discId: string, group: any) => {
      const confirm = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Esta acción no se puede deshacer!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminarlo",
      });

      if (!confirm.isConfirmed) return;

      try {
        // Llama al servicio de eliminación
        await deleteDisc(discId);

        // Elimina el disco del grupo
        const discIndex = group.discs.findIndex(
          (disc: any) => disc.id === discId
        );
        if (discIndex > -1) {
          group.discs.splice(discIndex, 1);
        }

        Swal.fire({
          title: "Eliminado",
          text: "El disco se eliminó correctamente.",
          icon: "success",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al eliminar el disco:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el disco.",
          icon: "error",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      }
    };

    const toggleEditingLink = (disc: any) => {
      // Si no está en modo edición, inicializa el enlace editable
      if (!editingLink[disc.id]) {
        disc.newLink = disc.link || ""; // Establece el enlace existente o una cadena vacía
      }
      // Cambia el estado de edición
      editingLink[disc.id] = !editingLink[disc.id];
    };

    const saveLinkChange = async (disc: any) => {
      const newLink = disc.newLink || disc.link;

      // Evita guardar si el enlace no cambió
      if (newLink === disc.link) return;

      try {
        await updateDisc(disc.id, { link: newLink });
        disc.link = newLink; // Actualiza el enlace en la interfaz

        Swal.fire({
          title: "¡Éxito!",
          text: "El enlace se ha actualizado correctamente.",
          icon: "success",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al actualizar el enlace:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar el enlace.",
          icon: "error",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      }
    };

    const getLinkText = (link: string) => {
      if (link.includes("bandcamp.com")) return "Abrir en Bandcamp";
      if (link.includes("youtube.com") || link.includes("youtu.be"))
        return "Abrir en YouTube";
      if (link.includes("spotify.com")) return "Abrir en Spotify";
      return "Abrir enlace";
    };

    const toggleVerified = async (disc: any) => {
      if (disc.link) return; // No permitir cambiar verified si tiene link

      disc.verified = !disc.verified;
      try {
        await updateDisc(disc.id, { verified: disc.verified });
        Swal.fire({
          title: "¡Éxito!",
          text: "Disco verificado.",
          icon: "success",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al actualizar verified:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar el disco.",
          icon: "error",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      }
    };

    const toggleEp = async (disc: any) => {
      disc.ep = !disc.ep;
      try {
        await updateDisc(disc.id, { ep: disc.ep });
        Swal.fire({
          title: "¡Éxito!",
          text: "Disco modificado.",
          icon: "success",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al actualizar ep:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar el disco.",
          icon: "error",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      }
    };

    const removeDisc = (discId) => {
      groupedDiscs.value.forEach((group) => {
        group.discs = group.discs.filter((disc) => disc.id !== discId);
      });
    };

    const handleDateChange = (updatedDisc) => {
      // Encuentra el grupo actual
      const currentGroup = groupedDiscs.value.find((group) =>
        group.discs.some((disc) => disc.id === updatedDisc.id)
      );

      if (currentGroup) {
        // Elimina el disco del grupo actual
        currentGroup.discs = currentGroup.discs.filter(
          (disc) => disc.id !== updatedDisc.id
        );
      }

      // Encuentra o crea el grupo para la nueva fecha
      let newGroup = groupedDiscs.value.find(
        (group) => group.releaseDate === updatedDisc.releaseDate
      );

      if (!newGroup) {
        // Si no existe, crea un nuevo grupo
        newGroup = {
          releaseDate: updatedDisc.releaseDate,
          discs: [],
        };
        groupedDiscs.value.push(newGroup);
        groupedDiscs.value.sort((a, b) =>
          new Date(a.releaseDate) > new Date(b.releaseDate) ? 1 : -1
        );
      }

      // Añade el disco al nuevo grupo
      newGroup.discs.push(updatedDisc);
    };

    return {
      groupedDiscs,
      groupState,
      genres,
      loadMore,
      loading,
      hasMore,
      onGenreChange,
      buscarEnlacesSpotify,
      exportarHtml,
      buscarGeneroSpotify,
      editing,
      enableEditing,
      saveNameChange,
      getGenreColor,
      truncateText,
      editingDate,
      enableDateEditing,
      saveDateChange,
      handleDeleteDisc,
      saveLinkChange,
      getLinkText,
      toggleEditingLink, // Agregado
      editingLink, // Agregado
      toggleVerified,
      toggleEp,
      toggleGroup,
      months,
      selectedMonth,
      selectMonth,
      removeDisc,
      handleDateChange 
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
