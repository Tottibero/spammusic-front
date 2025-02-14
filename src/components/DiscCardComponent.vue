<template>
  <div class="flex flex-wrap justify-center gap-4">
    <DiscCardComponent
      v-for="(disc, index) in discs"
      :key="index"
      v-bind="disc"
      class="w-full sm:w-[48%] md:w-[31%] lg:w-[23%]"
    />
    <div
      class="card w-full max-w-[20rem] border rounded shadow-lg bg-white flex flex-col mx-auto p-2 relative"
    >
      <div class="flex items-center justify-between px-2">
        <p class="text-xs text-gray-500">{{ formattedDate }}</p>
        <p
          v-if="isEP"
          class="px-2 py-1 rounded-full text-xs font-medium text-white bg-blue-500 text-center shadow-sm"
        >
          EP
        </p>
        <p
          class="px-2 py-1 rounded-full text-xs font-medium text-white text-center shadow-sm"
          :style="{ backgroundColor: genreColor || 'grey' }"
        >
          {{ genreName || "Sin género" }}
        </p>
      </div>

      <!-- Imagen y estadísticas -->
      <div class="flex items-center mt-3">
        <div class="flex flex-col items-center">
          <img
            :src="computedImage"
            :alt="name"
            class="w-24 h-24 object-cover rounded mb-2 shadow-md cursor-zoom-in hover:opacity-80"
            @click="openImage"
          />
          <div class="flex space-x-2 mt-1">
            <div
              class="flex flex-col items-center w-16 h-12 border rounded-lg shadow-md bg-gray-100 mb-1"
            >
              <p class="text-sm font-bold text-blue-600 mt-1">
                {{ averageRate ? averageRate.toFixed(2) : "-" }}
              </p>
              <p class="text-xs text-gray-700">Disco</p>
            </div>
            <div
              class="flex flex-col items-center w-16 h-12 border rounded-lg shadow-md bg-gray-100 mb-1"
            >
              <p class="text-sm font-bold font text-green-600 mt-1">
                {{ averageCover ? averageCover.toFixed(2) : "-" }}
              </p>
              <p class="text-xs text-gray-700">Portada</p>
            </div>
          </div>
        </div>

        <!-- Contenido al lado derecho -->
        <div class="ml-2 flex flex-1 flex-col">
          <!-- Título y artista alineados -->
          <div class="flex justify-between items-center">
            <h2 class="text-sm text-gray-900 font-semibold truncate">
              {{ name }}
            </h2>
          </div>
          <div class="flex justify-between items-center">
            <p class="text-xs text-gray-500 font-semibold italic">
              {{ artistName }}
            </p>
          </div>

          <!-- Botón de Escuchar -->
          <div class="flex items-center space-x-2 mt-1">
            <a
              v-if="link"
              :href="link"
              target="_blank"
              class="px-2 py-1 rounded-full text-xs font-medium text-white text-center shadow-sm bg-green-500 hover:bg-green-600 hover:text-white transition-all w-1/2 text-left"
            >
              Escuchar
            </a>

            <!-- Íconos -->
            <div class="flex space-x-2 items-center">
              <!-- Icono de corazón con tooltip -->
              <div class="relative group">
                <font-awesome-icon
                  :icon="['fas', 'heart']"
                  class="h-7 w-5 cursor-pointer transition-all duration-300 ease-in-out fill-current"
                  :class="{
                    'text-red-500 scale-110': favoriteId, // Si tiene favoriteId, es favorito (rojo)
                    'text-gray-500 hover:text-red-400': !favoriteId, // Si no tiene favoriteId, es gris
                  }"
                  @click="toggleHeart"
                />

                <!-- Tooltip -->
                <span
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-semibold text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  Favoritos
                </span>
              </div>

              <!-- Icono de bookmark con tooltip -->
              <div
                class="relative group cursor-pointer"
                @click="toggleBookmark"
              >
                <font-awesome-icon
                  :icon="['fas', 'bookmark']"
                  class="h-5 w-5 transition-all duration-300 ease-in-out fill-current mt-1 cursor-pointer"
                  :class="{
                    'text-yellow-400 scale-110': isBookmarkActive,
                    'text-gray-500 hover:text-yellow-300': !isBookmarkActive,
                  }"
                />

                <!-- Tooltip -->
                <span
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-semibold text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  Pendientes
                </span>
              </div>
            </div>
          </div>

          <!-- Formulario -->
          <div class="flex flex-col space-y-1">
            <label class="text-xs text-gray-500 translate-x-1.5">
              Disco:
              <input
                type="number"
                step="0.01"
                v-model="localRating.rate"
                min="1"
                max="10"
                class="px-0 py-1 border w-16 rounded 1/2 text-xs font-bold text-center text-gray-500 mt-3 mb-1 ml-0.5"
              />
            </label>
            <label class="text-xs text-gray-500">
              Portada:
              <input
                type="number"
                step="0.01"
                v-model="localRating.cover"
                min="1"
                max="10"
                class="px-0 py-1 w-16 border font-bold rounded 1/2 text-center text-xs mb-1 ml-0.5"
              />
            </label>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex mt-2 space-x-2 w-full">
        <button
          @click="toggleVotes"
          class="w-1/2 bg-gray-900 text-white font-bold py-2 px-4 rounded-lg shadow-sm border-4 border-transparent hover:border-gray-900 hover:bg-gradient-to-l from-gray-600 to-gray-900 flex items-center justify-center space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
            />
          </svg>
          <span>{{ showVotes ? "Ocultar" : "Votaciones" }}</span>
        </button>

        <button
          @click="submitRating"
          class="w-1/2 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg shadow-sm border-4 border-transparent hover:border-[#d9e021] hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] flex items-center justify-center space-x-2"
        >
          <template v-if="hasVoted">
            <!-- Ícono actual para "Actualizar" -->
            <i class="fa-solid fa-arrows-rotate text-gray-700 text-lg"></i>
          </template>

          <template v-else>
            <!-- Ícono de lápiz solo en "Votar" -->
            <i class="fa-solid fa-pen-to-square text-gray-700 text-lg"></i>
          </template>

          <span>{{ hasVoted ? "Actualizar" : "Votar" }}</span>
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

import defaultImage from "/src/assets/disco.png";
import { defineComponent, ref, computed, watch, watchEffect } from "vue";
import {
  getDiscRates,
  postRateService,
  updateRateService,
} from "@services/rates/rates.ts";
import {
  postFavoriteService,
  deleteFavoriteService,
} from "@services/favorites/favorites.ts";

import Swal from "sweetalert2";
import SwalService from '@services/swal/SwalService';

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
    ep: { type: Boolean, required: false },
    favoriteId: { type: String, required: false },
  },
  computed: {
    computedImage() {
      return this.image || defaultImage;
    },
  },
  setup(props) {
    const localRating = ref({ rate: props.rate, cover: props.cover });
    const showVotes = ref(false); // Estado para mostrar/ocultar votos
    const votes = ref<Vote[]>([]); // Lista de votos obtenida del servicio
    const isEP = computed(() => props.ep);
    const isHeartActive = ref(false);
    const isPlusActive = ref(false);
    const isBookmarkActive = ref(false);

    // Determinar si el usuario ya votó
    const hasVoted = ref(!!props.userDiscRate);
    const userDiscRateId = ref(props.userDiscRate); // Almacena el id del voto si ya existe
    console.log("rate", props.rate)
    console.log("rate", props.cover)
    // Formatear la fecha
    const formattedDate = computed(() => {
      const date = new Date(props.releaseDate);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    });

    const openImage = () => {
      window.open(props.image, "_blank");
    };

    const favoriteId = ref(props.favoriteId); // Convierte el ID en reactivo

    watchEffect(() => {
      favoriteId.value = props.favoriteId;
    });

    const toggleHeart = async () => {
      try {
        if (favoriteId.value) {
          // Si ya es favorito, eliminarlo
          await deleteFavoriteService(favoriteId.value);
          favoriteId.value = null; // Actualiza inmediatamente el estado local
        } else {
          // Si no es favorito, agregarlo
          const favorite = await postFavoriteService({ discId: props.id });
          favoriteId.value = favorite.id; // Actualiza inmediatamente con el nuevo ID
        }
      } catch (error) {
        console.error("Error al cambiar el estado de favorito:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar el estado de favorito.",
          icon: "error",
          position: "top-end",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
        });
      }
    };

    const togglePlus = () => {
      isPlusActive.value = !isPlusActive.value;
    };

    const toggleBookmark = () => {
      isBookmarkActive.value = !isBookmarkActive.value;
    };

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
        rate: Number(localRating.value.rate) || null,
        cover: Number(localRating.value.cover) || null,
      };
      try {
        if (payload.rate == 0) payload.rate = null;
        if (payload.rate == 0) payload.cover = null;

        if (!hasVoted.value) {
          console.log("payload", payload);
          const response = await postRateService(payload); // Asegúrate de que este servicio devuelva el `id` del nuevo voto
          console.log("response: " + response.id);
          userDiscRateId.value = response.id; // Guardar el `id` del nuevo voto
          hasVoted.value = true; // Cambiar estado a "ya votó"
        } else {
          await updateRateService(userDiscRateId.value, payload);
        }

        if(payload.rate && payload.rate > 0)  SwalService.successImage(payload.rate);
        else SwalService.success('Votación enviada con exito')
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
      hasVoted,
      isEP,
      isHeartActive,
      isPlusActive,
      toggleHeart,
      togglePlus,
      openImage,
      isBookmarkActive,
      toggleBookmark,
      favoriteId,
    };
  },
});
</script>

<style scoped>
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
