<template>
    <!-- Contenedor principal con scroll si el contenido excede el 80% del alto de la pantalla -->
    <div
      class="spotify-artist-details w-full max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md max-h-[80vh] overflow-y-auto"
    >
      <!-- Estado de carga -->
      <div v-if="loading" class="text-center py-4">
        Cargando detalles del artista...
      </div>
  
      <!-- Errores -->
      <div v-else-if="error" class="text-center text-red-600 py-4">
        {{ error }}
      </div>
  
      <!-- Información del artista -->
      <div v-else-if="artist">
        <div class="artist-info flex flex-col sm:flex-row gap-4 p-4 rounded-md bg-gray-50 shadow-sm">
          <!-- Imagen del artista (si existe) -->
          <img
            v-if="artist.images && artist.images.length"
            :src="artist.images[0].url"
            alt="Foto del artista"
            class="artist-photo w-40 h-40 object-cover rounded shadow"
          />
  
          <!-- Metadatos del artista -->
          <div class="artist-meta">
            <h2 class="text-2xl font-bold mb-2 text-gray-800">
              {{ artist.name }}
            </h2>
            <p class="mb-1 text-gray-700">
              <strong>Seguidores:</strong> {{ artist.followers.total.toLocaleString() }}
            </p>
            <p class="mb-1 text-gray-700">
              <strong>Popularidad:</strong> {{ artist.popularity }}
            </p>
            <p class="mb-1 text-gray-700">
              <strong>Géneros:</strong>
              {{ artist.genres && artist.genres.length ? artist.genres.join(", ") : "Sin géneros" }}
            </p>
  
            <!-- Botón con el enlace al artista en Spotify -->
            <div class="mt-3">
              <a
                v-if="artist.external_urls && artist.external_urls.spotify"
                :href="artist.external_urls.spotify"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-3 py-1 text-white bg-green-600 hover:bg-green-700 rounded-full"
              >
                <i class="fab fa-spotify mr-2"></i>
                Ver en Spotify
              </a>
            </div>
          </div>
        </div>
  
        <!-- Galería de Top Tracks -->
        <div class="top-tracks mt-6">
          <h3 class="text-xl font-semibold mb-3 text-gray-800">Top Tracks</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div
              v-for="track in topTracks"
              :key="track.id"
              class="track-card bg-gray-100 rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300"
            >
              <img
                v-if="track.album && track.album.images && track.album.images.length"
                :src="track.album.images[0].url"
                alt="Cover del álbum"
                class="w-full h-32 object-cover"
              />
              <div class="p-2">
                <h4
                  class="text-sm font-bold text-gray-800 truncate"
                  :title="track.name"
                >
                  {{ track.name }}
                </h4>
                <p
                  class="text-xs text-gray-600 truncate"
                  :title="track.album.name"
                >
                  {{ track.album.name }}
                </p>
                <a
                  v-if="track.external_urls && track.external_urls.spotify"
                  :href="track.external_urls.spotify"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-1 inline-block text-xs text-white bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                >
                  <i class="fab fa-spotify mr-1"></i>Ver en Spotify
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from "vue";
  import axios from "axios";
  import { obtenerTokenSpotify } from "@helpers/SpotifyFunctions.ts";
  
  export default defineComponent({
    name: "SpotifyArtistDetails",
    props: {
      /**
       * Nombre del artista que se desea buscar en Spotify.
       * Por ejemplo: "Metallica", "The Beatles", etc.
       */
      artistName: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      const artist = ref<any>(null);
      const topTracks = ref<any[]>([]);
      const loading = ref<boolean>(true);
      const error = ref<string>("");
  
      /**
       * Función para buscar un artista por nombre en la API de Spotify,
       * y luego obtener sus Top Tracks.
       */
      const searchArtist = async () => {
        try {
          const token = await obtenerTokenSpotify();
          if (!token) {
            error.value = "No se pudo obtener el token de Spotify";
            loading.value = false;
            return;
          }
  
          // Construir la consulta de búsqueda: "artist:NombreArtista"
          const query = encodeURIComponent(`artist:${props.artistName}`);
          const searchResponse = await axios.get(
            `https://api.spotify.com/v1/search?q=${query}&type=artist&limit=1`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
          // Verificamos si hay resultados
          if (searchResponse.data.artists.items.length > 0) {
            const foundArtist = searchResponse.data.artists.items[0];
            // Guardamos la información básica del artista
            artist.value = foundArtist;
  
            // Obtenemos el top tracks del artista (mercado = US, por ejemplo)
            const topTracksResponse = await axios.get(
              `https://api.spotify.com/v1/artists/${foundArtist.id}/top-tracks?market=US`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            topTracks.value = topTracksResponse.data.tracks;
          } else {
            error.value = "Artista no encontrado en Spotify";
          }
        } catch (err: any) {
          console.error("Error al buscar el artista en Spotify:", err);
          error.value = "Error al buscar el artista en Spotify";
        } finally {
          loading.value = false;
        }
      };
  
      onMounted(() => {
        searchArtist();
      });
  
      return {
        artist,
        topTracks,
        loading,
        error,
      };
    },
  });
  </script>
  
  <style scoped>
  .track-card img {
    transition: transform 0.3s;
  }
  .track-card img:hover {
    transform: scale(1.05);
  }
  </style>
  