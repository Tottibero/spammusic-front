<template>
  <div
    class="p-4 border rounded-md flex flex-wrap items-center justify-between"
    :style="{ backgroundColor: getGenreColor(disc.genreId) }"
    :class="{ 'text-white': getGenreColor(disc.genreId) !== 'transparent' }"
  >
    <!-- Imagen del disco -->
    <img
      v-if="disc.image"
      :src="disc.image"
      alt="Disc cover"
      class="w-16 h-16 mr-4 rounded-md flex-shrink-0"
    />

    <!-- Información principal -->
    <div class="flex flex-col flex-grow mr-4">
      <!-- Nombre del artista: al hacer clic se muestra/oculta el formulario -->
      <h3
        class="font-bold text-lg truncate cursor-pointer"
        @click="toggleArtistForm"
      >
        {{ disc.artist.name }}
      </h3>
      <!-- Formulario de edición del artista (inicialmente oculto) -->
      <div v-if="artistFormVisible" class="mt-2">
        <ArtistEditForm
          :artist="disc.artist"
          @update:artist="disc.artist = $event"
        />
      </div>

      <!-- Información del disco -->
      <p class="text-sm truncate">
        <span
          v-if="!editingName"
          @click="enableEditing('name')"
          class="cursor-pointer hover:underline"
        >
          {{ disc.name }}
        </span>
        <input
          v-else
          v-model="editedData.name"
          @keyup.enter="saveChanges('name')"
          @blur="saveChanges('name')"
          class="border rounded px-2 py-1 text-gray-600 w-full"
        />
      </p>
      <p class="text-sm mt-2">
        <a
          v-if="!editingLink && disc.link"
          :href="disc.link"
          target="_blank"
          class="text-blue-400 hover:underline truncate"
        >
          {{ getLinkText(disc.link) }}
        </a>
        <span v-else-if="!disc.link" class="text-gray-400">
          <SpotifyArtistButton :artistName="disc.artist.name" />
        </span>
        <input
          v-if="editingLink"
          v-model="editedData.link"
          @keyup.enter="saveChanges('link')"
          @blur="saveChanges('link')"
          class="border rounded px-2 py-1 text-gray-600 w-full"
        />
        <button
          @click="enableEditing('link')"
          class="ml-2 text-gray-400 hover:text-blue-400"
        >
          <i class="fas fa-link"></i>
        </button>
      </p>
      <p class="text-sm mt-2">
        <button
          @click="enableEditing('releaseDate')"
          class="text-gray-400 hover:text-blue-400"
        >
          <i class="fas fa-calendar-alt"></i>
        </button>
        <input
          v-if="editingDate"
          type="date"
          v-model="editedData.releaseDate"
          @blur="saveChanges('releaseDate')"
          @keyup.enter="saveChanges('releaseDate')"
          class="border rounded px-2 py-1 text-gray-600 w-full"
        />
        <span v-else>{{ formattedDate }}</span>
      </p>
    </div>

    <!-- Opciones adicionales -->
    <div class="flex items-center space-x-4">
      <!-- Género -->
      <div class="flex items-center space-x-2">
        <select
          id="genreSelect"
          v-model="editedData.genreId"
          @change="saveChanges('genreId')"
          class="border rounded px-3 py-2 text-gray-700 focus:outline-none"
        >
          <option value="" disabled>Seleccione un género</option>
          <option v-for="genre in genres" :key="genre.id" :value="genre.id">
            {{ genre.name }}
          </option>
        </select>
      </div>

      <!-- Botones -->
      <div class="flex space-x-2">
        <button
          @click="toggleEp()"
          :class="{
            'bg-blue-500': disc.ep,
            'bg-gray-300': !disc.ep,
          }"
          class="text-white font-medium px-4 py-2 rounded shadow-md"
        >
          {{ disc.ep ? "EP" : "Álbum" }}
        </button>
        <button
          @click="toggleVerified()"
          :class="{
            'bg-yellow-500': disc.verified,
            'bg-gray-300': !disc.verified,
          }"
          class="text-white font-medium px-4 py-2 rounded shadow-md"
        >
          {{ disc.verified ? "Verificado" : "No Verificado" }}
        </button>
        <button
          @click="buscarGeneroSpotify(disc)"
          class="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded shadow-md"
        >
          Buscar Género
        </button>
        <button
          @click="confirmDelete(disc.id)"
          class="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded shadow-md"
        >
          Borrar
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";
import type { PropType } from "vue";
import { updateDisc, deleteDisc } from "@services/discs/discs"; // Ajusta según tu estructura
import Swal from "sweetalert2";
import axios from "axios";
import SpotifyArtistButton from "@components/SpotifyArtistButton.vue";
import ArtistEditForm from "./ArtistEditForm.vue";

export default defineComponent({
  name: "Disc",
  components: { SpotifyArtistButton, ArtistEditForm },
  props: {
    disc: {
      type: Object as PropType<{
        id: string;
        name: string;
        artist: { name: string };
        genreId: string;
        link: string | null;
        image: string | null;
        ep: boolean;
        verified: boolean;
        releaseDate: Date;
      }>,
      required: true,
    },
    // Se ha añadido opcionalmente la propiedad "color" a cada género para el fondo
    genres: {
      type: Array as PropType<{ id: string; name: string; color?: string }[]>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const editingName = ref(false);
    const editingLink = ref(false);
    const editingDate = ref(false);
    // Controla la visibilidad del formulario de edición del artista
    const artistFormVisible = ref(false);

    const editedData = reactive({
      name: props.disc.name,
      link: props.disc.link,
      genreId: props.disc.genreId,
      releaseDate: props.disc.releaseDate,
    });

    const formattedDate = computed(() => {
      return new Date(props.disc.releaseDate).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    });

    const enableEditing = (field: "name" | "link" | "releaseDate") => {
      if (field === "name") {
        editingName.value = true;
        // También se puede abrir el formulario del artista
        artistFormVisible.value = true;
      }
      if (field === "link") editingLink.value = true;
      if (field === "releaseDate") editingDate.value = true;
    };

    // Alterna la visibilidad del formulario de edición del artista
    const toggleArtistForm = () => {
      artistFormVisible.value = !artistFormVisible.value;
    };

    const saveChanges = async (
      field: "name" | "link" | "genreId" | "releaseDate"
    ) => {
      try {
        await updateDisc(props.disc.id, { [field]: editedData[field] });
        Object.assign(props.disc, { [field]: editedData[field] });
        if (field === "name") editingName.value = false;
        if (field === "link") editingLink.value = false;
        if (field === "releaseDate") {
          emit("date-changed", {
            ...props.disc,
            releaseDate: editedData.releaseDate,
          });
          editingDate.value = false;
        }

        Swal.fire({
          title: "¡Éxito!",
          text: `El ${field} del disco se ha actualizado correctamente.`,
          icon: "success",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      } catch (error) {
        console.error(`Error al actualizar ${field}:`, error);
        Swal.fire({
          title: "Error",
          text: `No se pudo actualizar el ${field}.`,
          icon: "error",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      }
    };

    const toggleEp = async () => {
      try {
        await updateDisc(props.disc.id, { ep: !props.disc.ep });
        props.disc.ep = !props.disc.ep;
      } catch (error) {
        console.error("Error al actualizar EP:", error);
      }
    };

    const toggleVerified = async () => {
      try {
        await updateDisc(props.disc.id, { verified: !props.disc.verified });
        props.disc.verified = !props.disc.verified;
      } catch (error) {
        console.error("Error al actualizar verificación:", error);
      }
    };

    const confirmDelete = async (discId: string) => {
      const confirm = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Esta acción no se puede deshacer!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminarlo",
        cancelButtonText: "Cancelar",
      });

      if (confirm.isConfirmed) {
        deleteDiscFunction(discId);
      }
    };

    const deleteDiscFunction = async (discId: string) => {
      try {
        await deleteDisc(discId);
        Swal.fire({
          title: "¡Eliminado!",
          text: "El disco se eliminó correctamente.",
          icon: "success",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
        emit("disc-deleted", props.disc.id); // Emitimos un evento al componente padre
      } catch (error) {
        console.error("Error al eliminar el disco:", error);
      }
    };

    const getGenreColor = (genreId: string) => {
      const genre = props.genres.find((g) => g.id === genreId);
      return genre?.color || "transparent";
    };

    const getLinkText = (link: string) => {
      if (link.includes("bandcamp.com")) return "Bandcamp";
      if (link.includes("youtube.com") || link.includes("youtu.be"))
        return "YouTube";
      if (link.includes("spotify.com")) return "Spotify";
      return "Enlace";
    };

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

    const buscarGeneroSpotify = async (disc: any) => {
      const token = await obtenerTokenSpotify();
      if (!token) {
        console.error("No se pudo obtener el token de Spotify");
        return;
      }

      try {
        // Paso 1: Busca el artista en Spotify
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

          // Paso 2: Obtén los álbumes/sencillos más recientes del artista
          const albumsResponse = await axios.get(
            `https://api.spotify.com/v1/artists/${artistId}/albums`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: {
                include_groups: "album,single",
                limit: 1,
              },
            }
          );

          if (albumsResponse.data.items.length > 0) {
            const genres = artist.genres; // Géneros asociados al artista

            if (genres.length > 0) {
              disc.genero = genres.join(", ");
              Swal.fire({
                title: "¡Éxito!",
                text: `El género del último track: ${disc.genero}`,
                icon: "success",
                position: "top-end",
                timer: 6000,
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

    return {
      editingName,
      editingLink,
      editedData,
      editingDate,
      formattedDate,
      enableEditing,
      saveChanges,
      toggleEp,
      toggleVerified,
      confirmDelete,
      getGenreColor,
      getLinkText,
      buscarGeneroSpotify,
      artistFormVisible,
      toggleArtistForm,
    };
  },
});
</script>

<style scoped>
.flex {
  display: flex;
}
.flex-wrap {
  flex-wrap: wrap;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.bg-gray-700 {
  background-color: #374151;
}
.text-gray-300 {
  color: #d1d5db;
}
.text-white {
  color: #ffffff;
}
.rounded-md {
  border-radius: 0.375rem;
}
.p-4 {
  padding: 1rem;
}
.w-16 {
  width: 4rem;
}
.h-16 {
  height: 4rem;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Clases adicionales para botones, inputs y otros estilos se pueden agregar o ajustar según necesidad */
</style>
