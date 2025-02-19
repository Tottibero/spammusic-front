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
      <!-- Datos obtenidos de Spotify -->
      <div
        class="artist-info flex flex-col sm:flex-row gap-4 p-4 rounded-md bg-gray-50 shadow-sm"
      >
        <!-- Imagen del artista -->
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
            <strong>Seguidores:</strong>
            {{ artist.followers.total.toLocaleString() }}
          </p>
          <p class="mb-1 text-gray-700">
            <strong>Popularidad:</strong> {{ artist.popularity }}
          </p>
          <p class="mb-1 text-gray-700">
            <strong>Géneros:</strong>
            {{
              artist.genres && artist.genres.length
                ? artist.genres.join(", ")
                : "Sin géneros"
            }}
          </p>
          <!-- Botón para ver el perfil en Spotify -->
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

      <div v-if="lastFmData" class="lastfm-info mt-6">
        <h3 class="text-xl font-semibold mb-3 text-gray-800">Biografía</h3>
        <!-- La biografía de Last.fm suele venir en HTML, por eso usamos v-html -->
        <div
          class="text-sm text-gray-700"
          v-html="lastFmData.bio.summary"
        ></div>

        <div v-if="lastFmData.tags && lastFmData.tags.tag" class="mt-4">
          <h4 class="text-md font-semibold mb-2 text-gray-800">Etiquetas</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in lastFmData.tags.tag"
              :key="tag.name"
              class="px-2 py-1 bg-gray-200 rounded text-xs"
            >
              {{ tag.name }}
            </span>
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
              v-if="
                track.album && track.album.images && track.album.images.length
              "
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

      <!-- Información adicional de Last.fm -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import axios from "axios";
import { obtenerTokenSpotify } from "@helpers/SpotifyFunctions.ts";

export default defineComponent({
  name: "ArtistByDisc",
  props: {
    discName: {
      type: String,
      required: true,
    },
    artistName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const artist = ref<any>(null);
    const topTracks = ref<any[]>([]);
    const lastFmData = ref<any>(null);
    const loading = ref<boolean>(true);
    const error = ref<string>("");

    // Función para obtener datos adicionales desde Last.fm
    const fetchLastFmData = async (artistName: string) => {
      try {
        const response = await axios.get("https://ws.audioscrobbler.com/2.0/", {
          params: {
            method: "artist.getinfo",
            artist: artistName,
            api_key: "288147ee12920ea60b59f72f491ebada",
            format: "json",
          },
        });
        lastFmData.value = response.data.artist;
      } catch (err: any) {
        console.error("Error al obtener datos de Last.fm:", err);
      }
    };

    const fetchArtistDataFromSpotify = async (artistId: string, token: string) => {
      // Obtener la información completa del artista
      const artistResponse = await axios.get(
        `https://api.spotify.com/v1/artists/${artistId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      artist.value = artistResponse.data;

      // Obtener los Top Tracks
      const topTracksResponse = await axios.get(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      topTracks.value = topTracksResponse.data.tracks;

      // Llamada a Last.fm con el nombre real del artista
      await fetchLastFmData(artist.value.name);
    };

    const searchByAlbumAndArtist = async () => {
      try {
        const token = await obtenerTokenSpotify();
        if (!token) {
          error.value = "No se pudo obtener el token de Spotify";
          loading.value = false;
          return;
        }

        // Construir la consulta: "album:DISCO artist:ARTISTA"
        const query = encodeURIComponent(`album:${props.discName} artist:${props.artistName}`);
        // Buscar álbumes
        const searchResponse = await axios.get(
          `https://api.spotify.com/v1/search?q=${query}&type=album&limit=5`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const albums = searchResponse.data.albums.items;
        if (!albums || albums.length === 0) {
          error.value = "No se encontró ningún álbum en Spotify con esos datos";
          return;
        }

        // Toma el primer álbum que coincida, o filtra según necesites
        const chosenAlbum = albums[0];

        // Normalmente, un álbum tiene un array de 'artists'; tomamos el primero
        // o filtras si hubiera varios
        const primaryArtist = chosenAlbum.artists[0];
        if (!primaryArtist) {
          error.value = "No se encontró un artista válido en el álbum";
          return;
        }

        // Ahora que tenemos el artistId, obtenemos su info y top tracks
        await fetchArtistDataFromSpotify(primaryArtist.id, token);
      } catch (err: any) {
        console.error("Error al buscar el artista en Spotify:", err);
        error.value = "Error al buscar el artista en Spotify";
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      searchByAlbumAndArtist();
    });

    return {
      artist,
      topTracks,
      lastFmData,
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
