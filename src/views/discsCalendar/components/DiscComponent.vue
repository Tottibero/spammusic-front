<template>
  <div
    class="p-4 border rounded-md flex flex-col sm:flex-row items-center justify-between w-full sm:w-1/2 bg-white shadow-md"
    :style="{ backgroundColor: getGenreColor(disc.genreId) }"
    :class="{ 'text-white': getGenreColor(disc.genreId) !== 'transparent' }"
  >
    <!-- Columna izquierda: Imagen del disco -->
    <div class="flex items-center w-full sm:w-1/3 p-4">
      <img
        v-if="disc.image"
        :src="disc.image"
        alt="Disc cover"
        class="w-28 h-28 rounded-md cursor-pointer object-cover"
        @click="openImageModal"
      />
      <div class="ml-6 flex flex-col text-center sm:text-left">
        <h3 class="font-bold text-lg truncate cursor-pointer w-full" @click="openArtistModal">
          {{ disc.artist.name }}
        </h3>
        <p class="text-sm truncate w-full">
          <span v-if="!editingName" @click="enableEditing('name')" class="cursor-pointer hover:underline">
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
        <p class="text-sm mt-2 w-full">
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
        </p>
        <p class="text-sm mt-2">{{ formattedDate }}</p>
      </div>
    </div>

    <!-- Columna derecha: Botones de acción en dos columnas -->
    <div class="grid gap-2 w-full sm:w-2/3 p-2" :class="{ 'grid-cols-2': !isNarrow, 'grid-cols-1': isNarrow }">
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
      <button
        @click="toggleEp()"
        :class="{ 'bg-blue-500': disc.ep, 'bg-gray-300': !disc.ep }"
        class="text-white font-medium px-3 py-2 rounded shadow-md"
      >
        {{ disc.ep ? "EP" : "Álbum" }}
      </button>
      <button
        @click="toggleVerified()"
        :class="{ 'bg-yellow-500': disc.verified, 'bg-gray-300': !disc.verified }"
        class="text-white font-medium px-3 py-2 rounded shadow-md"
      >
        {{ disc.verified ? "Verificado" : "No Verificado" }}
      </button>
      <button
        @click="buscarGeneroSpotify(disc)"
        class="bg-green-500 hover:bg-green-600 text-white font-medium px-3 py-2 rounded shadow-md"
      >
        Buscar Género
      </button>
      <button
        @click="confirmDelete(disc.id)"
        class="bg-red-500 hover:bg-red-600 text-white font-medium px-3 py-2 rounded shadow-md"
      >
        Borrar
        </button>
    </div>
  </div>

  <div v-if="showImageModal" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 class="text-lg font-semibold mb-4">Cambiar Imagen del Disco</h2>
      <input v-model="newImageUrl" type="text" placeholder="Introduce la URL de la imagen" class="border p-2 w-full rounded-md" />
      <div class="flex justify-end mt-4 space-x-2">
        <button @click="closeImageModal" class="bg-gray-400 text-white px-4 py-2 rounded-md">Cancelar</button>
        <button @click="updateImageUrl" class="bg-blue-500 text-white px-4 py-2 rounded-md">Guardar</button>
      </div>
    </div>
  </div>

  <div v-if="showArtistModal" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 class="text-lg font-semibold mb-4">Actualizar o Crear Artista</h2>
      <label class="flex items-center mb-4">
        <input type="checkbox" v-model="creatingNewArtist" class="mr-2"> Crear nuevo artista
      </label>
      <input v-model="newArtistName" type="text" placeholder="Introduce el nombre del artista" class="border p-2 w-full rounded-md" />
      <div class="flex justify-end mt-4 space-x-2">
        <button @click="closeArtistModal" class="bg-gray-400 text-white px-4 py-2 rounded-md">Cancelar</button>
        <button @click="handleArtistUpdate" class="bg-blue-500 text-white px-4 py-2 rounded-md">Guardar</button>
      </div>
    </div>
  </div>

  
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, onMounted, onUnmounted } from "vue";
import type { PropType } from "vue";
import { updateDisc, deleteDisc } from "@services/discs/discs";
import { updateArtist, postArtist } from "@services/artist/artist";
import Swal from "sweetalert2";
import axios from "axios";
import SpotifyArtistButton from "@components/SpotifyArtistButton.vue";

export default defineComponent({
  name: "Disc",
  components: { SpotifyArtistButton },
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
    genres: {
      type: Array as PropType<{ id: string; name: string; color?: string }[]>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const editingName = ref(false);
    const editingLink = ref(false);
    const editingDate = ref(false);
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
        artistFormVisible.value = true;
      }
      if (field === "link") editingLink.value = true;
      if (field === "releaseDate") editingDate.value = true;
    };

    const saveChanges = async (field: "name" | "link" | "genreId" | "releaseDate") => {
      try {
        await updateDisc(props.disc.id, { [field]: editedData[field] });
        Object.assign(props.disc, { [field]: editedData[field] });
        if (field === "name") editingName.value = false;
        if (field === "link") editingLink.value = false;
        if (field === "releaseDate") {
          emit("date-changed", { ...props.disc, releaseDate: editedData.releaseDate });
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
        emit("disc-deleted", props.disc.id);
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
      if (link.includes("youtube.com") || link.includes("youtu.be")) return "YouTube";
      if (link.includes("spotify.com")) return "Spotify";
      return "Enlace";
    };

    const showImageModal = ref(false);
    const newImageUrl = ref("");

    const openImageModal = () => {
      newImageUrl.value = props.disc.image || "";
      showImageModal.value = true;
    };

    const closeImageModal = () => {
      showImageModal.value = false;
    };

    const updateImageUrl = async () => {
      try {
        await updateDisc(props.disc.id, { image: newImageUrl.value });
        props.disc.image = newImageUrl.value;
        Swal.fire("¡Éxito!", "La imagen se ha actualizado correctamente.", "success");
        closeImageModal();
      } catch (error) {
        Swal.fire("Error", "No se pudo actualizar la imagen.", "error");
      }
    };

    const isNarrow = ref(window.innerWidth < 768);

    const updateSize = () => {
      isNarrow.value = window.innerWidth < 768;
    };

    onMounted(() => {
      window.addEventListener("resize", updateSize);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", updateSize);
    });

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
      showImageModal,
      newImageUrl,
      openImageModal,
      closeImageModal,
      updateImageUrl,
      isNarrow,
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
</style>
