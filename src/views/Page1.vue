<template>
  <div class="max-w-7xl mx-auto mt-10">
    <h1 class="text-4xl font-bold mb-8 text-center">Discs by Release Date</h1>
    <div>
      <!-- Lista de discos agrupados -->
      <div v-for="group in groupedDiscs" :key="group.releaseDate" class="mb-8">
        <h3 class="text-2xl font-bold mb-4">{{ group.releaseDate }}</h3>
        <button v-if="new Date(group.releaseDate) < new Date()" @click="buscarEnlacesSpotify(group.discs)"
          class="bg-blue-500 text-white px-4 py-2 rounded mb-4">Buscar
          Enlaces en Spotify</button>
        <button @click="exportarHtml(group)" class="bg-green-500 text-white px-4 py-2 rounded mt-4 ml-3">
          Exportar HTML de esta semana
        </button>


        <ul>
          <li v-for="disc in group.discs" :key="disc.id"
            class="flex flex-col md:flex-row md:justify-between p-4 border-b">
            <!-- Información del disco -->
            <div class="flex items-center">
              <img v-if="disc.image" :src="disc.image" alt="Disc cover" class="w-24 h-24 mr-4"
                style="width: 100px; height: 100px; object-fit: cover;">
              <div>
                <span class="font-medium">{{ disc.artist.name }}</span>
                <span>-</span>
                <span>{{ disc.name }}</span>
              </div>
            </div>

            <!-- Enlace de Spotify -->
            <div v-if="disc.link" class="mt-2 md:mt-0">
              <a :href="disc.link" target="_blank" class="text-blue-500 underline">Abrir en Spotify</a>
            </div>

            <div v-else class="mt-2 md:mt-0">
              <span class="text-gray-500">Sin enlace disponible</span>
            </div>

            <!-- Select para género -->
            <div class="mt-2 md:mt-0">
              <label for="genreSelect" class="mr-2">Género:</label>
              <select id="genreSelect" v-model="disc.genreId" @change="onGenreChange(disc, disc.genreId)"
                class="border rounded p-1">
                <option value="" disabled>Seleccione un género</option>
                <option v-for="genre in genres" :key="genre.id" :value="genre.id">
                  {{ genre.name }}
                </option>
              </select>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <!-- Cargar más -->
    <div ref="loadMore" class="text-center py-6">
      <span v-if="loading" class="text-gray-600">Loading more discs...</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';
import { getDiscsDated, } from '../services/discDated';
import { updateDisc } from '../services/discs';
import { getGenres, } from '../services/genres'; // <--- Importa tu servicio de géneros
import Swal from "sweetalert2";

export default defineComponent({
  name: 'DiscsList',
  setup() {
    // Lista agrupada de discos
    const groupedDiscs = ref<any[]>([]);

    // Paginación
    const limit = ref(30);

    const offset = ref(0);
    const totalItems = ref(0);
    const hasMore = ref(true);

    // Estado de carga
    const loading = ref(false);

    // Referencia para scroll infinito
    const loadMore = ref<HTMLDivElement | null>(null);

    // Lista de géneros
    const genres = ref<any[]>([]);

    // ---------------------------
    // Función para obtener discos
    // ---------------------------
    const fetchDiscs = async () => {
      if (loading.value || !hasMore.value) return;

      loading.value = true;

      try {
        const response = await getDiscsDated(limit.value, offset.value);

        response.data.forEach((newGroup: any) => {
          newGroup.discs.forEach((disc: any) => {
            disc.genreId = disc.genre?.id || '';
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
        console.error('Error fetching discs:', error);
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
        genres.value = genresResponse.data;
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    // -------------------------------------------------
    // Función que se ejecuta al cambiar de género un disco
    // -------------------------------------------------
    const onGenreChange = async (disc: any, genreId: string) => {
      try {
        await updateDisc(
          disc.id, {
          name: disc.name,
          genreId,
        }
        );
        Swal.fire({
          title: "¡Éxito!",
          text: 'Genero cambiado correctamente',
          icon: "success",
          position: "top-end",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
        });
      } catch (err) {
        console.log("err", err)
      }
    };

    // Función para buscar enlaces de Spotify para un grupo de discos
    const buscarEnlacesSpotify = async (discs: any[]) => {
      const token = await obtenerTokenSpotify();
      if (!token) {
        console.error('No se pudo obtener el token de Spotify');
        return;
      }

      for (const disc of discs) {
        try {
          const query = encodeURIComponent(`album:${disc.name} artist:${disc.artist.name}`);
          const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=album&limit=1`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.data.albums.items.length > 0) {
            const album = response.data.albums.items[0];
            disc.link = album.external_urls.spotify;
            disc.image = album.images?.[0]?.url || null; // Obtiene la URL de la imagen
            console.log("disc.image", disc.image)

            console.log("Datos enviados al backend:", {
              link: disc.link,
              image: disc.image
            });

            await updateDisc(disc.id, {
              link: disc.link,
              image: disc.image
            });


          } else {
            disc.link = 'No se encontró el álbum';
          }
        } catch (error) {
          console.error(`Error al buscar el álbum ${disc.name}:`, error);
          disc.link = 'Error al realizar la búsqueda';
        }
      }
    };

    // Función para obtener el token de Spotify
    const obtenerTokenSpotify = async () => {
      const client_id = import.meta.env.VITE_CLIENT_ID;
      const client_secret = import.meta.env.VITE_CLIENT_SECRET;
      const credentials = btoa(`${client_id}:${client_secret}`);

      try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`,
          },
        });
        return response.data.access_token;
      } catch (error) {
        console.error('Error al obtener el token de Spotify:', error);
      }
    };

    const exportarHtml = (group: any) => {
      let html = `
      <figure class="wp-block-table is-style-stripes">
        <table>
          <tbody>`;

      group.discs.forEach((disc: any) => {
        const genreName = genres.value.find(genre => genre.id === disc.genreId)?.name || 'Sin género';
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
      const blob = new Blob([html], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `discs_${group.releaseDate}.html`;
      link.click();
      URL.revokeObjectURL(link.href);
    };

    // ----------------
    // onMounted
    // ----------------
    onMounted(() => {
      if (loadMore.value) {
        observer.observe(loadMore.value);
      }
      fetchDiscs();
      fetchGenres();
    });

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchDiscs();
      }
    });

    return {
      groupedDiscs,
      genres,
      loadMore,
      loading,
      hasMore,
      onGenreChange,
      buscarEnlacesSpotify,
      exportarHtml,
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
</style>
