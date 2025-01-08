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
            class="flex flex-col md:flex-row md:justify-between p-4 border-b"
            :style="{ backgroundColor: getGenreColor(disc.genreId), opacity: '0.9' }">
            <!-- Información del disco -->
            <div class="flex items-center">
              <img v-if="disc.image" :src="disc.image" alt="Disc cover" class="w-24 h-24 mr-4"
                style="width: 100px; height: 100px; object-fit: cover;">
              <div>
                <span class="font-medium">{{ disc.artist.name }}</span>
                <span>-</span>
                <span v-if="!editing[disc.id]" @click="enableEditing(disc.id)" class="cursor-pointer hover:underline">
                  {{ disc.name }}
                </span>
                <input v-else v-model="disc.newName" @keyup.enter="saveNameChange(disc)" @blur="saveNameChange(disc)"
                  class="border rounded px-2 py-1" placeholder="Edit name" />
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
            <div class="mt-2 md:mt-0 flex items-center space-x-4">
              <label for="genreSelect" class="mr-2 text-gray-700 font-medium">Género:</label>
              <select id="genreSelect" v-model="disc.genreId" @change="onGenreChange(disc, disc.genreId)"
                class="border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="" disabled>Seleccione un género</option>
                <option v-for="genre in genres" :key="genre.id" :value="genre.id">
                  {{ genre.name }}
                </option>
              </select>
              <button @click="buscarGeneroSpotify(disc)"
                class="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400">
                Buscar género en Spotify
              </button>
            </div>
            <p>
              <span v-if="disc.loading" class="text-gray-500 italic">Buscando...</span>
              <small v-else-if="disc.genero" class="text-gray-700 italic">Género encontrado: <strong>{{ disc.genero
                  }}</strong></small>
            </p>

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
import { defineComponent, ref, onMounted, reactive } from 'vue';
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
    const editing = reactive<Record<string, boolean>>({});

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


    const buscarGeneroSpotify = async (disc: any) => {
      const token = await obtenerTokenSpotify();
      if (!token) {
        console.error('No se pudo obtener el token de Spotify');
        return;
      }

      try {
        // Paso 1: Busca el artista
        const query = encodeURIComponent(`artist:${disc.artist.name}`);
        const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=artist&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.data.artists.items.length > 0) {
          const artist = response.data.artists.items[0];
          const artistId = artist.id;

          // Paso 2: Obtén los álbumes/tracks más recientes del artista
          const albumsResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            params: {
              include_groups: "album,single", // Solo álbumes y sencillos
              limit: 1, // Solo el lanzamiento más reciente
            },
          });

          if (albumsResponse.data.items.length > 0) {
            const genres = artist.genres; // Géneros asociados al artista

            if (genres.length > 0) {
              disc.genero = genres.join(', '); // Agrega los géneros al disco
              Swal.fire({
                title: "¡Éxito!",
                text: `El género del último track: ${disc.genero}`,
                icon: "success",
                position: "top-end",
                timer: 3000,
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
        console.error('Error al buscar el género por último track:', error);
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

    const findDiscById = (discId: string) => {
      for (const group of groupedDiscs.value) {
        const disc = group.discs.find((d: any) => d.id === discId);
        if (disc) return disc;
      }
      return null;
    };

    const enableEditing = (discId: string) => {
      const disc = findDiscById(discId);
      if (disc) {
        editing[discId] = true;
        disc.newName = disc.name; // Almacena el nombre actual como punto de partida
      }
    };


    const saveNameChange = async (disc: any) => {
      const newName = disc.newName || disc.name;
      editing[disc.id] = false;

      // Evita guardar si el nombre no cambió
      if (newName === disc.name) return;

      try {
        await updateDisc(disc.id, { name: newName, genreId: disc.genreId });
        disc.name = newName; // Actualiza el nombre en la interfaz

        Swal.fire({
          title: '¡Éxito!',
          text: 'El nombre del disco se ha actualizado correctamente.',
          icon: 'success',
          timer: 3000,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Error al actualizar el nombre:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el nombre del disco.',
          icon: 'error',
          timer: 3000,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
        });
      }
    };

    const getGenreColor = (genreId: string) => {
      const genre = genres.value.find((g) => g.id === genreId);
      return genre?.color || 'transparent'; // Devuelve el color o un valor predeterminado
    };

    return {
      groupedDiscs,
      genres,
      loadMore,
      loading,
      hasMore,
      onGenreChange,
      buscarEnlacesSpotify,
      exportarHtml,
      buscarGeneroSpotify,
      editing,
      enableEditing,
      saveNameChange,
      getGenreColor
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
