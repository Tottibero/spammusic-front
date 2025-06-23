<template>
  <div
    class="p-4 border rounded-md flex flex-col sm:flex-row items-center justify-between w-full sm:w-1/2 bg-white shadow-md"
    :style="{ backgroundColor: getGenreColor(disc.genreId) }"
    :class="{ 'text-white': getGenreColor(disc.genreId) !== 'transparent' }">
    <!-- Columna izquierda: Imagen del disco -->
    <div class="flex items-center w-full sm:w-1/3 p-4 min-w-0">
      <button v-if="!disc.image" @click="openImageModal"
        class="bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-1 rounded shadow-md ml-2">
        <i class="fa-solid fa-image"></i>
      </button>
      <img v-if="disc.image" :src="disc.image" alt="Disc cover" class="w-28 h-28 rounded-md object-cover" />
      <div class="ml-6 flex flex-col text-center sm:text-left w-full min-w-0 overflow-hidden">
        <!-- Nombre de la banda -->
        <div class="flex items-center space-x-2">
          <h3 class="font-bold text-lg truncate min-w-0 overflow-hidden"
            :style="{ maxWidth: 'clamp(12ch, 65vw, 30ch)' }">
            <!-- Se añade @click para abrir ArtistDetail -->
            <a @click="openArtistDetail" class="block truncate w-full cursor-pointer hover:underline">
              {{ disc.artist.name }}
            </a>
          </h3>
        </div>
        <!-- Nombre del disco -->
        <div class="flex items-center space-x-2">
          <!-- Se añade @click para abrir DiscDetail -->
          <a @click="openDiscDetail" class="text-sm truncate min-w-0 cursor-pointer hover:underline"
            :style="{ maxWidth: 'clamp(12ch, 65vw, 30ch)' }">
            <span class="block truncate">
              {{ disc.name }}
            </span>
          </a>
        </div>
        <p class="text-sm mt-2 w-full flex items-center space-x-2">
          <a v-if="linkButtonData.visible" :href="disc.link" target="_blank" :class="[
            linkButtonData.color,
            linkButtonData.hover,
            'text-white px-2 py-1 rounded shadow-md inline-flex items-center space-x-1 text-sm',
          ]">
            <i :class="[linkButtonData.icon, 'text-base']"></i>
            <span>{{ linkButtonData.text }}</span>
          </a>
          <span v-else-if="!disc.link" class="text-gray-400">
            <SpotifyArtistButton :artistName="disc.artist.name" />
          </span>
        </p>
        <p class="mt-2 text-left sm:text-left">
          {{ formattedDate }}
        </p>
      </div>
    </div>

    <!-- Columna derecha: Botones de acción en dos columnas -->
    <div class="grid gap-2 w-full sm:w-2/3 p-2" :class="{ 'grid-cols-2': !isNarrow, 'grid-cols-1': isNarrow }">
      
<!-- Contenedor de los pills: Género + EP -->
<div class="flex items-center justify-center sm:justify-start gap-2 h-full">
  <p
    class="px-2 py-1 rounded-full text-xs font-medium text-white text-center shadow-sm"
    :style="{ backgroundColor: disc.genre?.color || 'grey' }"
  >
    {{ disc.genre?.name || "Sin género" }}
  </p>
  <p
    v-if="disc.ep"
    class="px-2 py-1 rounded-full text-xs font-medium text-white bg-blue-500 text-center shadow-sm"
  >
    EP
  </p>
</div>


      <!-- Botón -->
      <button @click="toggleBookmark()" :class="{ 'bg-yellow-500': pendingId, 'bg-gray-300': !pendingId }"
        class="text-white font-medium px-3 py-2 rounded shadow-md">
        {{ pendingId ? "Guardado" : "Añadir a pendientes" }}
      </button>
    </div>
  </div>

  <!-- Teleport para todos los modales -->
  <Teleport to="body">
    <!-- Modal para actualizar/crear artista (permanece para edición) -->
    <div v-if="showArtistModal" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-lg font-semibold mb-4">Actualizar o Crear Artista</h2>
        <label class="flex items-center mb-4">
          <input type="checkbox" v-model="creatingNewArtist" class="mr-2" />
          Crear nuevo artista
        </label>
        <input v-model="newArtistName" type="text" placeholder="Introduce el nombre del artista"
          class="border p-2 w-full rounded-md" />
        <div class="flex justify-end mt-4 space-x-2">
          <button @click="closeArtistModal" class="bg-gray-400 text-white px-4 py-2 rounded-md">
            Cancelar
          </button>
          <button @click="handleArtistUpdate" class="bg-blue-500 text-white px-4 py-2 rounded-md">
            Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para editar el nombre del disco -->
    <EditModal v-model:show="showNameModal" v-model="editedName" title="Editar Nombre del Disco"
      placeholder="Introduce el nombre del disco" @save="updateDiscName" />

    <!-- Modal para editar el link del disco -->
    <EditModal v-model:show="showLinkModal" v-model="editedLink" title="Editar Link del Disco"
      placeholder="Introduce el link del disco" @save="updateDiscLink" />

    <!-- Modal para cambiar la imagen del disco -->
    <EditModal v-model:show="showImageModal" v-model="newImageUrl" title="Cambiar Imagen del Disco"
      placeholder="Introduce la URL de la imagen" @save="updateImageUrl" />

    <!-- Modal para cambiar la fecha del disco -->
    <EditModal v-model:show="showDateModal" v-model="editedReleaseDate" title="Cambiar Fecha del Disco"
      placeholder="Selecciona la fecha" inputType="date" @save="updateDiscReleaseDate" />

    <!-- Modal para mostrar DiscDetail al hacer clic en el nombre del disco -->

    <!-- Modal para mostrar ArtistDetail al hacer clic en el nombre de la banda -->
  </Teleport>

  <div v-if="showDiscDetail" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded-lg p-4 relative max-w-3xl w-full">
      <button class="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl" @click="closeDiscDetail">
        &times;
      </button>
      <!-- Se pasa la información del disco -->
      <DiscDetail v-if="showDiscDetail" :disc="disc" @close="showDiscDetail = false" />
    </div>
  </div>

  <!-- Modal para mostrar ArtistDetail -->
  <div v-if="showArtistDetail" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded-lg p-4 relative max-w-3xl w-full">
      <button class="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl" @click="closeArtistDetail">
        &times;
      </button>
      <!-- Se pasa el nombre del artista al componente ArtistDetail -->
      <ArtistDetail v-if="showArtistDetail" :disc-name="disc.name" :artistName="disc.artist.name"
        @close="showArtistDetail = false" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  reactive,
  ref,
  onMounted,
  onUnmounted,
  watch,
} from "vue";
import type { PropType } from "vue";
import { updateDisc, deleteDisc } from "@services/discs/discs";
import { updateArtist, postArtist } from "@services/artist/artist";
import {
  postPendingService,
  deletePendingService,
} from "@services/pendings/pendings";
import Swal from "sweetalert2";
import axios from "axios";
import SpotifyArtistButton from "@components/SpotifyArtistButton.vue";
import { obtenerTokenSpotify } from "@helpers/SpotifyFunctions.ts";
import SearchableSelect from "@components/SearchableSelect.vue";
import EditModal from "./EditModal.vue";

// Se importan los componentes de detalle
import DiscDetail from "@components/DiscDetail.vue";
import ArtistDetail from "@components/ArtistDetail.vue";

export default defineComponent({
  name: "Disc",
  components: {
    SpotifyArtistButton,
    SearchableSelect,
    EditModal,
    DiscDetail,
    ArtistDetail,
  },
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
        pendingId: string;
      }>,
      required: true,
    },
    genres: {
      type: Array as PropType<{ id: string; name: string; color?: string }[]>,
      required: true,
    },
  },
  setup(props, { emit }) {
    // Para edición de género (se usa el SearchableSelect)
    const editedData = reactive({
      genreId: props.disc.genre.id,
    });

    // Watch para sincronizar editedData con props.disc
    watch(
      () => props.disc,
      (newDisc) => {
        editedData.genreId = newDisc.genre.id; // Actualiza genreId
      },
      { deep: true, immediate: true } // Observa cambios profundos e inmediatamente
    );

    const formattedDate = computed(() => {
      return new Date(props.disc.releaseDate).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    });

    const linkButtonData = computed(() => {
      const link = props.disc.link || "";
      if (link.includes("spotify.com")) {
        return {
          visible: true,
          color: "bg-green-500",
          hover: "hover:bg-green-600",
          icon: "fa-brands fa-spotify",
          text: "Spotify",
        };
      } else if (link.includes("youtube.com") || link.includes("youtu.be")) {
        return {
          visible: true,
          color: "bg-red-500",
          hover: "hover:bg-red-600",
          icon: "fa-brands fa-youtube",
          text: "YouTube",
        };
      } else if (link.includes("bandcamp.com")) {
        return {
          visible: true,
          color: "bg-blue-500",
          hover: "hover:bg-blue-600",
          icon: "fa-brands fa-bandcamp",
          text: "Bandcamp",
        };
      }
      return {
        visible: false,
        color: "",
        hover: "",
        icon: "",
        text: "",
      };
    });

    const saveChanges = async (field: any) => {
      try {
        await updateDisc(props.disc.id, { [field]: editedData[field] });
        Object.assign(props.disc, { [field]: editedData[field] });
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

    const pendingId = ref(props.disc.pendingId);

    const toggleBookmark = async () => {
      try {
        if (pendingId.value) {
          await deletePendingService(pendingId.value);
          pendingId.value = null;
          Swal.fire("Pendiente borrado exitosamente");
        } else {
          const pending = await postPendingService({ discId: props.disc.id });
          pendingId.value = pending.id;
          Swal.fire("Pendiente añadido exitosamente");
        }
      } catch (error) {
        console.error("Error al cambiar el estado de pendiente:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar el estado de pendiente.",
          icon: "error",
          position: "top-end",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
        });
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
        emit("disc-deleted", props.disc.id);
      } catch (error) {
        console.error("Error al eliminar el disco:", error);
      }
    };

    const getGenreColor = (genreId: string) => {
      const genre = props.genres.find((g) => g.id === genreId);
      return genre?.color || "transparent";
    };

    // Modal para cambiar la imagen
    const showImageModal = ref(false);
    const newImageUrl = ref(props.disc.image || "");
    const openImageModal = () => {
      newImageUrl.value = props.disc.image || "";
      showImageModal.value = true;
    };
    const updateImageUrl = async (newValue: string) => {
      try {
        await updateDisc(props.disc.id, { image: newValue });
        props.disc.image = newValue;
        Swal.fire({
          title: "¡Éxito!",
          text: "La imagen se ha actualizado correctamente.",
          icon: "success",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al actualizar la imagen:", error);
        Swal.fire("Error", "No se pudo actualizar la imagen.", "error");
      }
    };

    // Modal para editar el link
    const showLinkModal = ref(false);
    const editedLink = ref(props.disc.link || "");
    const updateDiscLink = async (newValue: string) => {
      try {
        await updateDisc(props.disc.id, { link: newValue });
        props.disc.link = newValue;
        Swal.fire({
          title: "¡Éxito!",
          text: "El Link del disco ha sido actualizado.",
          icon: "success",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al actualizar el link del disco:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar el Link del disco.",
          icon: "error",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      }
    };

    // Modal para editar el nombre
    const showNameModal = ref(false);
    const editedName = ref(props.disc.name);
    const updateDiscName = async (newValue: string) => {
      try {
        await updateDisc(props.disc.id, { name: newValue });
        props.disc.name = newValue;
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
        console.error("Error al actualizar el nombre del disco:", error);
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

    // Modal para editar la fecha con calendario
    const showDateModal = ref(false);
    const editedReleaseDate = ref(
      new Date(props.disc.releaseDate).toISOString().substr(0, 10)
    );
    const updateDiscReleaseDate = async (newValue: string) => {
      try {
        const newDate = new Date(newValue);
        await updateDisc(props.disc.id, {
          releaseDate: newDate,
        });
        props.disc.releaseDate = newDate;
        Swal.fire({
          title: "¡Éxito!",
          text: "La fecha del disco se ha actualizado correctamente",
          icon: "success",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al actualizar la fecha del disco:", error);
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

    const isNarrow = ref(window.innerWidth < 768);
    const updateSize = () => {
      isNarrow.value = window.innerWidth < 768;
    };

    const buscarGeneroSpotify = async (disc: any) => {
      const token = await obtenerTokenSpotify();
      if (!token) {
        console.error("No se pudo obtener el token de Spotify");
        return;
      }
      try {
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
            const genres = artist.genres;
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

    // Modal para actualizar/crear artista (edición)
    const showArtistModal = ref(false);
    const newArtistName = ref("");
    const creatingNewArtist = ref(false);
    const openArtistModal = () => {
      newArtistName.value = props.disc.artist.name;
      showArtistModal.value = true;
    };
    const closeArtistModal = () => {
      showArtistModal.value = false;
    };
    const handleArtistUpdate = async () => {
      try {
        if (creatingNewArtist.value) {
          const newArtist = await postArtist({ name: newArtistName.value });
          props.disc.artist = newArtist;
          await updateDisc(props.disc.id, { artistId: newArtist.id });
          emit("artist-created", newArtist.id, newArtist.name);
          Swal.fire(
            "¡Éxito!",
            "Nuevo artista creado correctamente.",
            "success"
          );
        } else {
          await updateArtist(props.disc.artist.id, {
            name: newArtistName.value,
          });
          props.disc.artist.name = newArtistName.value;
          emit("update-artist", props.disc.artist.id, newArtistName.value);
          Swal.fire(
            "¡Éxito!",
            "El nombre del artista se ha actualizado correctamente.",
            "success"
          );
        }
        closeArtistModal();
      } catch (error) {
        Swal.fire("Error", "No se pudo completar la acción.", "error");
      }
    };

    // NUEVAS VARIABLES y funciones para abrir los modales de detalle
    const showDiscDetail = ref(false);
    const showArtistDetail = ref(false);

    const openDiscDetail = () => {
      showDiscDetail.value = true;
    };

    const openArtistDetail = () => {
      showArtistDetail.value = true;
    };

    const closeDiscDetail = () => {
      showDiscDetail.value = false;
    };

    const closeArtistDetail = () => {
      showArtistDetail.value = false;
    };

    onMounted(() => {
      window.addEventListener("resize", updateSize);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", updateSize);
    });

    return {
      editedData,
      formattedDate,
      saveChanges,
      toggleEp,
      toggleVerified,
      confirmDelete,
      getGenreColor,
      linkButtonData,
      showImageModal,
      newImageUrl,
      openImageModal,
      updateImageUrl,
      isNarrow,
      buscarGeneroSpotify,
      toggleBookmark,
      pendingId,
      openArtistModal,
      handleArtistUpdate,
      closeArtistModal,
      showArtistModal,
      newArtistName,
      updateDiscLink,
      showLinkModal,
      editedLink,
      showNameModal,
      editedName,
      updateDiscName,
      showDateModal,
      editedReleaseDate,
      updateDiscReleaseDate,
      // Funciones para abrir los modales de detalle
      openDiscDetail,
      openArtistDetail,
      showDiscDetail,
      showArtistDetail,
      closeDiscDetail,
      closeArtistDetail,
    };
  },
});
</script>

<style scoped>
.p-4 {
  padding: 1rem;
}

.border {
  border: 1px solid #e5e7eb;
}

.rounded-md {
  border-radius: 0.375rem;
}

.text-white {
  color: #ffffff;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.w-full {
  width: 100%;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 1024px) {
  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .p-4 {
    padding: 0.5rem;
  }

  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .w-full {
    width: 100%;
  }

  img {
    width: 80px;
    height: 80px;
  }

  h3 {
    font-size: 1rem;
  }

  .sm\:flex-row {
    flex-direction: column;
    min-width: 0;
  }
}

@media (max-width: 430px) {
  .p-4 {
    padding: 0.25rem;
  }

  img {
    width: 70px;
    height: 70px;
  }

  h3 {
    font-size: 0.9rem;
  }

  .sm\:flex-row {
    flex-direction: column;
  }
}

@media (max-width: 300px) {
  img {
    width: 60px;
    height: 60px;
  }

  h3 {
    font-size: 0.8rem;
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999 !important;
  /* ✅ Mayor que el searchable select */
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  position: relative;
  z-index: 10000 !important;
  /* ✅ Asegura que esté aún más arriba */
  background: white;
  padding: 20px;
  border-radius: 8px;
  z-index: 1100 !important;
  /* ✅ Mayor que el searchable select */
  max-width: 90%;
  width: 400px;
}

.searchable__select {
  position: absolute;
  width: 100%;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  z-index: 500 !important;
  /* Reducimos el valor para que esté debajo del modal */
  margin-top: 0.25rem;
}

body {
  position: relative;
  overflow: visible !important;
}
</style>
