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
      <h3 class="font-bold text-lg truncate">{{ disc.artist.name }}</h3>
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
        <span v-else-if="!disc.link" class="text-gray-400"
          >                 <SpotifyArtistButton :artistName="disc.artist.name" />
          </span
        >
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
</style>

<script lang="ts">
import componentSetup from "./DiscComponent";
export default componentSetup;
</script>
