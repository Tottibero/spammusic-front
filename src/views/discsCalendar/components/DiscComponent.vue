<template>
  <div
    class="p-4 border rounded-md flex flex-col md:flex-row md:justify-between"
    :style="{ backgroundColor: getGenreColor(disc.genreId), opacity: '0.9' }"
    :class="{ 'text-white': getGenreColor(disc.genreId) !== 'transparent' }"
  >
    <!-- Información principal -->
    <div class="flex items-center">
      <img
        v-if="disc.image"
        :src="disc.image"
        alt="Disc cover"
        class="w-24 h-24 mr-4 rounded"
        style="object-fit: cover"
      />
      <div>
        <h3 class="font-bold text-lg">{{ disc.artist.name }}</h3>
        <p class="text-sm">
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
            class="border rounded px-2 py-1 text-gray-600"
          />
        </p>

        <!-- Enlace -->
        <p class="text-sm mt-2">
          <a
            v-if="!editingLink && disc.link"
            :href="disc.link"
            target="_blank"
            class="text-blue-500 hover:underline"
          >
            {{ getLinkText(disc.link) }}
          </a>
          <span v-else-if="!disc.link" class="text-gray-500"
            >Sin enlace disponible</span
          >
          <input
            v-if="editingLink"
            v-model="editedData.link"
            @keyup.enter="saveChanges('link')"
            @blur="saveChanges('link')"
            class="border rounded px-2 py-1 text-gray-600"
          />
          <button
            @click="enableEditing('link')"
            class="ml-2 text-gray-600 hover:text-blue-500"
          >
            <i class="fas fa-link"></i>
          </button>
        </p>
        <p class="text-sm mt-2">
          <button
            @click="enableEditing('releaseDate')"
            class="text-gray-600 hover:text-blue-500"
          >
            <i class="fas fa-calendar-alt"></i>
          </button>
          <input
            v-if="editingDate"
            type="date"
            v-model="editedData.releaseDate"
            @blur="saveChanges('releaseDate')"
            @keyup.enter="saveChanges('releaseDate')"
            class="border rounded px-2 py-1 text-gray-600"
          />
          <span v-else>{{ formattedDate }}</span>
        </p>
      </div>
    </div>

    <!-- Opciones adicionales -->
    <div class="mt-4 md:mt-0 flex items-center space-x-4">
      <!-- Género -->
      <div>
        <label for="genreSelect" class="block text-sm font-medium"
          >Género:</label
        >
        <select
          id="genreSelect"
          v-model="editedData.genreId"
          @change="saveChanges('genre')"
          class="border rounded px-3 py-2 text-gray-700 focus:outline-none"
        >
          <option value="" disabled>Seleccione un género</option>
          <option v-for="genre in genres" :key="genre.id" :value="genre.id">
            {{ genre.name }}
          </option>
        </select>
      </div>

      <!-- Botones de acciones -->
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
          @click="confirmDelete()"
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

export default defineComponent({
  name: "Disc",
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
      type: Array as PropType<{ id: string; name: string }[]>,
      required: true,
    },
  },
  setup(props) {
    const editingName = ref(false);
    const editingLink = ref(false);
    const editedData = reactive({
      name: props.disc.name,
      link: props.disc.link,
      genreId: props.disc.genreId,
      releaseDate: props.disc.releaseDate
    });

    const editingDate = ref(false);

    const formattedDate = computed(() => {
      return new Date(props.disc.releaseDate).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    });

    const enableEditing = (field: "name" | "link" | "date") => {
      if (field === "name") editingName.value = true;
      if (field === "link") editingLink.value = true;
      if (field === "releaseDate") editingDate.value = true;
    };

    const saveChanges = async (field: "name" | "link" | "genre" | "releaseDate") => {
      try {
        await updateDisc(props.disc.id, { [field]: editedData[field] });
        Object.assign(props.disc, { [field]: editedData[field] });
        if (field === "name") editingName.value = false;
        if (field === "link") editingLink.value = false;
        if (field === "releaseDate") editingDate.value = false;

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

    const confirmDelete = async () => {
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
        deleteDisc();
      }
    };

    const deleteDisc  = async () => {
      try {
        await deleteDisc(props.disc.id);
        Swal.fire({
          title: "¡Eliminado!",
          text: "El disco se eliminó correctamente.",
          icon: "success",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
        emit("disc-deleted", props.disc.id); // Emitimos un evento al padre
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
    };
  },
});
</script>
