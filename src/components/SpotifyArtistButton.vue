<template>
  <button
    @click="openArtistLink"
    class="bg-green-500 text-white px-2 py rounded ml-2"
  >
    <i class="fa-brands fa-spotify"></i>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SwalService from "@services/swal/SwalService";
import { obtenerEnlaceArtistaSpotify } from "@helpers/SpotifyFunctions";

export default defineComponent({
  name: "SpotifyArtistButton",
  props: {
    artistName: {
      type: String,
      required: true,
    },
  },
  methods: {
    async openArtistLink() {
      try {
        const link = await obtenerEnlaceArtistaSpotify(this.artistName);
        if (link) {
          window.open(link, "_blank");
        } else {
          SwalService.error(
            "No se pudo encontrar el enlace del artista en Spotify."
          );
        }
      } catch (error) {
        console.error("Error al obtener el enlace del artista:", error);
        SwalService.error("Ocurrió un error al intentar abrir el enlace.");
      }
    },
  },
});
</script>

<style scoped>
button {
  transition: background-color 0.3s ease;
}
button:hover {
  background-color: #1db954;
}
</style>
