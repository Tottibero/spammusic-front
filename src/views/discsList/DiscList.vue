<template>
  <div class="max-w-[100rem] mx-auto mt-10 px-4">
    <h1 class="text-4xl font-bold mb-8 text-center">Álbumes</h1>

    <!-- Contenedor de cuadrícula para las tarjetas -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      <!-- Iteración de discos -->
      <DiscCard
        v-for="disc in discs"
        :key="disc.id"
        :id="disc.id"
        :image="disc.image"
        :name="disc.name"
        :releaseDate="disc.releaseDate"
        :artistName="disc.artist?.name || 'Desconocido'"
        :genreName="disc.genre?.name"
        :genreColor="disc.genre?.color"
        :link="disc.link"
        :averageRate="disc.averageRate"
        :averageCover="disc.averageCover"
        :rate="disc.userRate?.rate"
        :cover="disc.userRate?.cover"
        :isNew="!disc.userRate"
        :userDiscRate="disc.userRate?.id"
      />
    </div>

    <!-- Elemento para disparar la carga adicional -->
    <div ref="loadMore" class="mt-10 text-center">
      <span v-if="loading" class="text-gray-600">Cargando más discos...</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from "vue";
import { getDiscs } from "@services/discs/discs";
import {
  postRateService,
  updateRateService,
  getDiscRates,
} from "@services/rates/rates";
import Swal from "sweetalert2";
import DiscCard from "@components/DiscCardComponent.vue";

export default defineComponent({
  components: {
    DiscCard,
  },
  setup() {
    const discs = ref([]); // Lista de discos
    const ratings: Record<string, any> = reactive({}); // Ratings asociados a discos
    const votes: Record<string, any[]> = reactive({}); // Votos asociados a discos
    const showVotes: Record<string, boolean> = reactive({}); // Estado para mostrar u ocultar votos
    const limit = ref(20); // Cantidad de discos por carga
    const offset = ref(0); // Offset para la paginación
    const totalItems = ref(0); // Número total de discos disponibles
    const loading = ref(false); // Estado de carga
    const hasMore = ref(true); // Si hay más discos para cargar
    const loadMore = ref(null); // Elemento para el observador

    /**
     * Función para cargar discos desde la API
     */
    const fetchDiscs = async () => {
      if (loading.value || !hasMore.value) return;

      loading.value = true;

      try {
        const response = await getDiscs(limit.value, offset.value);
        discs.value.push(...response.data);
        totalItems.value = response.totalItems;

        // Incrementar el offset
        offset.value += limit.value;

        // Configurar los datos iniciales para ratings y estado de votos
        response.data.forEach((disc) => {
          if (!ratings[disc.id]) {
            const userRate = disc.userRate;
            ratings[disc.id] = {
              rate: userRate ? userRate.rate : null,
              cover: userRate ? userRate.cover : null,
              id: userRate ? userRate.id : null,
              discId: disc.id,
              isNew: !userRate,
            };
          }
          showVotes[disc.id] = false;
        });

        // Determinar si hay más discos para cargar
        hasMore.value = offset.value < totalItems.value;
      } catch (error) {
        console.error("Error fetching discs:", error);
      } finally {
        loading.value = false;
      }
    };

    /**
     * Configurar IntersectionObserver para detectar cuando el usuario
     * llega al final de la lista y cargar más discos.
     */
    const setupObserver = () => {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchDiscs();
        }
      });

      if (loadMore.value) {
        observer.observe(loadMore.value);
      }
    };

    const submitRating = async (payload) => {
      try {
        if (payload.isNew) {
          await postRateService(payload);
        } else {
          await updateRateService(payload.id, payload);
        }
        Swal.fire({
          title: "¡Éxito!",
          text: "Tu evaluación fue enviada correctamente.",
          icon: "success",
          position: "top-end",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
        });
        await fetchVotes(payload.discId);
      } catch (error) {
        console.error("Error submitting rating:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo enviar tu evaluación.",
          icon: "error",
          position: "top-end",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
        });
      }
    };

    /**
     * Montar el componente y cargar discos iniciales
     */
    onMounted(() => {
      fetchDiscs();
      setupObserver();
    });

    return {
      discs,
      loadMore,
      loading,
      ratings,
      votes,
      showVotes,
      submitRating,
      fetchDiscs,
    };
  },
});
</script>

<style>
/* Estilos para el diseño de cuadrícula */

/* Pantallas pequeñas (1 columna) */
.grid {
  grid-template-columns: 1fr;
}

/* Tablets (2 columnas) */
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Escritorios medianos (3 columnas) */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Escritorios grandes (4 columnas) */
@media (min-width: 1280px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
