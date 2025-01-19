<template>
  <div
    class="card border rounded shadow-lg bg-white flex flex-col max-w-[20rem] mx-auto p-2"
  >
    <!-- Fecha encima de la imagen -->
    <div class="flex flex-col items-center">
      <div class="flex space-x-2 mt-1">
        <p class="text-xs text-gray-500 text-center mb-1">
          {{ formattedDate }}
        </p>
        <p
          class="px-1 py-0.5 rounded text-xs font-medium text-white"
          :style="{ backgroundColor: genreColor || 'grey' }"
        >
          {{ genreName || "Sin género" }}
        </p>
      </div>
    </div>

    <!-- Imagen y estadísticas -->
    <div class="flex items-center mt-3">
      <div class="flex flex-col items-center">
        <img
          :src="image"
          :alt="name"
          class="w-24 h-24 object-cover rounded mb-1"
        />
        <div class="flex space-x-2 mt-1">
          <div
            class="flex flex-col items-center w-12 h-12 border rounded-lg shadow-md p-0.5 bg-gray-100"
          >
            <p class="text-sm font-bold text-blue-600">
              {{ averageRate ? averageRate.toFixed(2) : "-" }}
            </p>
            <p class="text-xs text-gray-700">Rate</p>
          </div>
          <div
            class="flex flex-col items-center w-12 h-12 border rounded-lg shadow-md p-0.5 bg-gray-100"
          >
            <p class="text-sm font-bold text-green-600">
              {{ averageCover ? averageCover.toFixed(2) : "-" }}
            </p>
            <p class="text-xs text-gray-700">Cover</p>
          </div>
        </div>
      </div>

      <!-- Contenido al lado derecho -->
      <div class="ml-2 flex flex-1 flex-col">
        <!-- Título y género -->
        <div class="flex justify-between items-center mb-1">
          <h2 class="text-sm font-semibold truncate">{{ name }}</h2>
        </div>
        <p class="text-xs text-gray-600 mb-1">{{ artistName }}</p>

        <!-- Enlace a Spotify -->
        <a
          v-if="link"
          :href="link"
          target="_blank"
          class="text-blue-500 text-xs hover:underline mb-2"
        >
          Escuchar en Spotify
        </a>

        <!-- Formulario -->
        <div class="flex flex-col space-y-1">
          <label class="text-xs text-gray-700">
            Rate:
            <input
              type="number"
              step="0.01"
              v-model="localRating.rate"
              min="1"
              max="10"
              class="px-1 py-0.5 border rounded w-full text-xs"
            />
          </label>
          <label class="text-xs text-gray-700">
            Cover:
            <input
              type="number"
              step="0.01"
              v-model="localRating.cover"
              min="1"
              max="10"
              class="px-1 py-0.5 border rounded w-full text-xs"
            />
          </label>
        </div>
      </div>
    </div>

    <!-- Botones -->
    <div class="flex space-x-1 mt-2">
      <button
        @click="toggleVotes"
        class="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 flex-1"
      >
        {{ showVotes ? "Ocultar Votos" : "Ver Votos" }}
      </button>

      <button
        @click="submitRating"
        class="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600 flex-1"
      >
        {{ isNew ? "Votar" : "Actualizar" }}
      </button>
    </div>

    <!-- Lista de votos -->
    <div v-if="showVotes" class="mt-3">
      <p v-if="votes.length === 0" class="text-xs text-gray-500">
        No hay votos disponibles.
      </p>
      <ul v-else class="space-y-1">
        <li
          v-for="vote in votes"
          :key="vote.id"
          class="text-xs text-gray-700 border-b pb-1"
        >
          <strong>{{ vote.user.username }}</strong
          >: Rate: {{ vote.rate }}, Cover: {{ vote.cover }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
interface Vote {
  id: string; // o el tipo correcto, como number
  user: {
    username: string;
  };
  rate: number;
  cover: number;
}

import { defineComponent, ref, computed } from "vue";
import {
  getDiscRates,
  postRateService,
  updateRateService,
} from "@services/rates/rates.ts";
import Swal from "sweetalert2";
export default defineComponent({
  props: {
    id: { type: String, required: true },
    image: { type: String, required: true },
    name: { type: String, required: true },
    releaseDate: { type: String, required: true },
    artistName: { type: String, required: true },
    genreName: { type: String, required: false, default: "" },
    genreColor: { type: String, required: false, default: "grey" },
    link: { type: String, required: false, default: "" },
    averageRate: { type: Number, required: false, default: null },
    averageCover: { type: Number, required: false, default: null },
    userDiscRate: { type: String, required: false, default: null },
    rate: { type: Number, required: false, default: null },
    cover: { type: Number, required: false, default: null },
    isNew: { type: Boolean, required: true },
  },

  setup(props) {
    const localRating = ref({ rate: props.rate, cover: props.cover });
    const showVotes = ref(false); // Estado para mostrar/ocultar votos
    const votes = ref<Vote[]>([]); // Lista de votos obtenida del servicio

    // Formatear la fecha
    const formattedDate = computed(() => {
      const date = new Date(props.releaseDate);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    });

    const toggleVotes = async () => {
      showVotes.value = !showVotes.value;

      if (showVotes.value && votes.value.length === 0) {
        // Cargar los votos solo si se muestran y no han sido cargados antes
        try {
          votes.value = await getDiscRates(props.id);
        } catch (error) {
          console.error("Error fetching votes:", error);
          Swal.fire({
            title: "Error",
            text: "No se pudieron obtener los votos.",
            icon: "error",
            position: "top-end",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
          });
        }
      }
    };

    const submitRating = async () => {
      const payload = {
        discId: props.id,
        rate: Number(localRating.value.rate),
        cover: Number(localRating.value.cover),
      };
      try {
        if (props.isNew) {
          await postRateService(payload);
        } else {
          await updateRateService(props.userDiscRate, payload);
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

    return {
      localRating,
      formattedDate,
      showVotes,
      votes,
      toggleVotes,
      submitRating,
    };
  },
});
</script>

<style>
.card {
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  max-width: 20rem;
  height: auto;
}

.card img {
  width: 6rem;
  height: 6rem;
  object-fit: cover;
  border-radius: 0.5rem;
}

.card h2 {
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  text-align: left;
  white-space: normal;
  word-wrap: break-word;
  margin: 0;
  overflow: hidden;
}

.card .flex-1 {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card button {
  height: 2rem;
  font-size: 0.75rem;
}
</style>
