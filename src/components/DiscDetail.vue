<template>
    <!-- Contenedor principal con scroll si el contenido excede el 80% del alto de la pantalla -->
    <div
      class="spotify-album-details w-full max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md max-h-[80vh] overflow-y-auto"
    >
      <div v-if="loading" class="text-center py-4">
        Cargando detalles del álbum...
      </div>
  
      <div v-else-if="error" class="text-center text-red-600 py-4">
        {{ error }}
      </div>
  
      <div v-else-if="album">
        <!-- Información del álbum -->
        <div class="album-info flex flex-col sm:flex-row gap-4 p-4 rounded-md bg-gray-50 shadow-sm">
          <img
            v-if="album.images && album.images.length"
            :src="album.images[0].url"
            alt="Portada del álbum"
            class="album-cover w-40 h-40 object-cover rounded shadow"
          />
          <div class="album-meta">
            <h2 class="text-2xl font-bold mb-2 text-gray-800">
              {{ album.name }}
            </h2>
            <p class="mb-1 text-gray-700">
              <strong>Artista(s):</strong>
              {{ album.artists.map(a => a.name).join(", ") }}
            </p>
            <p class="mb-1 text-gray-700">
              <strong>Fecha de lanzamiento:</strong> {{ album.release_date }}
            </p>
            <p class="mb-1 text-gray-700">
              <strong>Total de pistas:</strong> {{ album.total_tracks }}
            </p>
            <p class="mb-1 text-gray-700">
              <strong>Duración total:</strong> {{ totalDurationFormatted }}
            </p>
            <p v-if="album.genres && album.genres.length" class="text-gray-700">
              <strong>Géneros:</strong> {{ album.genres.join(", ") }}
            </p>
  
            <!-- Botón para abrir el álbum en Spotify -->
            <div class="mt-3">
              <a
                v-if="album.external_urls && album.external_urls.spotify"
                :href="album.external_urls.spotify"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-3 py-1 text-white bg-green-600 hover:bg-green-700 rounded-full"
              >
                <i class="fab fa-spotify mr-2"></i>
                Escuchar en Spotify
              </a>
            </div>
          </div>
        </div>
  
        <!-- Lista de tracks -->
        <div class="track-list mt-6">
          <h3 class="text-xl font-semibold mb-3 text-gray-800">Pistas</h3>
          <ul>
            <li
              v-for="track in tracks"
              :key="track.id"
              class="track-item border-b py-3 flex flex-col sm:flex-row justify-between items-center"
            >
              <div class="mb-2 sm:mb-0">
                <p class="font-semibold text-gray-800">
                  {{ track.track_number }}. {{ track.name }}
                </p>
                <p class="text-sm text-gray-600">
                  Duración: {{ formatDuration(track.duration_ms) }}
                </p>
              </div>
              <div v-if="track.preview_url" class="mt-2 sm:mt-0">
                <audio :src="track.preview_url" controls class="w-48"></audio>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted, computed } from "vue";
  import axios from "axios";
  import { obtenerTokenSpotify } from "@helpers/SpotifyFunctions.ts";
  
  export default defineComponent({
    name: "SpotifyAlbumDetails",
    props: {
      // Se espera que el objeto "disc" tenga al menos "name" y "artist.name"
      disc: {
        type: Object,
        required: true,
      },
    },
    setup(props) {
      const album = ref<any>(null);
      const tracks = ref<any[]>([]);
      const loading = ref<boolean>(true);
      const error = ref<string>("");
  
      // Busca el álbum en Spotify
      const searchAlbum = async () => {
        try {
          const token = await obtenerTokenSpotify();
          if (!token) {
            error.value = "No se pudo obtener el token de Spotify";
            loading.value = false;
            return;
          }
  
          // Construir la consulta de búsqueda (ejemplo: "album:NombreDelÁlbum artist:NombreDelArtista")
          const query = encodeURIComponent(
            `album:${props.disc.name} artist:${props.disc.artist.name}`
          );
          const searchResponse = await axios.get(
            `https://api.spotify.com/v1/search?q=${query}&type=album&limit=1`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
          if (searchResponse.data.albums.items.length > 0) {
            const foundAlbum = searchResponse.data.albums.items[0];
  
            // Obtener los detalles completos del álbum (pistas, etc.)
            const albumResponse = await axios.get(
              `https://api.spotify.com/v1/albums/${foundAlbum.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
  
            album.value = albumResponse.data;
            tracks.value = albumResponse.data.tracks.items;
          } else {
            error.value = "Álbum no encontrado en Spotify";
          }
        } catch (err: any) {
          console.error("Error al buscar el álbum en Spotify:", err);
          error.value = "Error al buscar el álbum en Spotify";
        } finally {
          loading.value = false;
        }
      };
  
      // Formatea la duración de una pista (en ms) a mm:ss
      const formatDuration = (durationMs: number) => {
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
      };
  
      // Calcula la duración total de todas las pistas del álbum
      const totalDurationMs = computed(() =>
        tracks.value.reduce((acc, track) => acc + track.duration_ms, 0)
      );
  
      // Formatea la duración total a "HHh MMm SSs" o "MMm SSs" si < 1 hora
      const totalDurationFormatted = computed(() => {
        const hours = Math.floor(totalDurationMs.value / 3600000);
        const minutes = Math.floor((totalDurationMs.value % 3600000) / 60000);
        const seconds = Math.floor(
          ((totalDurationMs.value % 3600000) % 60000) / 1000
        );
  
        if (hours > 0) {
          return `${hours}h ${minutes}m ${seconds}s`;
        } else {
          return `${minutes}m ${seconds}s`;
        }
      });
  
      onMounted(() => {
        searchAlbum();
      });
  
      return {
        album,
        tracks,
        loading,
        error,
        formatDuration,
        totalDurationFormatted,
      };
    },
  });
  </script>
  
  <style scoped>
  .track-item + .track-item {
    margin-top: 0.5rem;
  }
  </style>
  