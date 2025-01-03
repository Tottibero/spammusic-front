<template>
  <div class="max-w-7xl mx-auto mt-10">
    <h1 class="text-4xl font-bold mb-8 text-center">Discs by Release Date</h1>
    <div>
      <!-- Lista de discos agrupados -->
      <div v-for="group in groupedDiscs" :key="group.releaseDate" class="mb-8">
        <h3 class="text-2xl font-bold mb-4">{{ group.releaseDate }}</h3>
        <ul>
          <li v-for="disc in group.discs" :key="disc.id"
            class="flex flex-col md:flex-row md:justify-between p-4 border-b">
            <!-- Información del disco -->
            <div>
              <span class="font-medium">{{ disc.artist.name }}</span>
              <span>-</span>
              <span>{{ disc.name }}</span>
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
import { getDiscsDated, } from '../services/discDated';
import { updateDisc } from '../services/discs';
import { getGenres, } from '../services/genres'; // <--- Importa tu servicio de géneros

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
    const genres = ref<any>([]);

    // ---------------------------
    // Función para obtener discos
    // ---------------------------
    const fetchDiscs = async () => {
      if (loading.value || !hasMore.value) return;

      loading.value = true;

      try {
        const response = await getDiscsDated(limit.value, offset.value);

        response.data.forEach((newGroup: any) => {

          // Verificar si la fecha ya existe en groupedDiscs

          newGroup.discs.forEach((disc: any) => {
            // ...guardamos en disc.genreId el id del género
            disc.genreId = disc.genre?.id || '';
          });

          const existingGroup = groupedDiscs.value.find(
            (group) => group.releaseDate === newGroup.releaseDate
          );
          if (existingGroup) {
            // Si la fecha existe, agregar los discos nuevos
            existingGroup.discs.push(...newGroup.discs);
          } else {
            // Si la fecha no existe, agregar un nuevo grupo
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
        // Si quieres usar paginación, podrías usar getGenres(limit, offset) en vez de getAllGenres()
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
      // Aquí podrías hacer una llamada a tu API para actualizar el disco
      // Por ahora, solo hacemos console.log

      // Ejemplo de actualización en el disco local:
      // disc.genreId = genreId;
      // O si deseas actualizar un objeto anidado 
      // Ajusta según tu modelo de datos
      try {
        const response = await updateDisc(
          disc.id, {
          name: disc.name,
          genreId,
        }
        );
        console.log("response:", response);

      } catch (err) {
        console.log("err", err)
      }


    };

    // -------------------------------------------------
    // Observador para scroll infinito
    // -------------------------------------------------
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchDiscs();
      }
    });

    // ----------------
    // onMounted
    // ----------------
    onMounted(() => {
      // Iniciar el observador
      if (loadMore.value) {
        observer.observe(loadMore.value);
      }

      // Cargar la primera tanda de discos
      fetchDiscs();

      // Cargar la lista de géneros
      fetchGenres();
    });

    return {
      groupedDiscs,
      genres, // Lo usamos en el template
      loadMore,
      loading,
      hasMore,
      onGenreChange, // Para invocarla desde el template
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
</style>
