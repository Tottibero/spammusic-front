<template>
  <div class="flex flex-wrap justify-center gap-4">
    <!-- Tarjeta individual -->
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
              <p class="text-sm font-bold text-green-600 mt-1">
                {{ averageCover ? averageCover.toFixed(2) : "-" }}
              </p>
              <p class="text-xs text-gray-700">Portada</p>
            </div>
          </div>
        </div>

        <!-- Contenido al lado derecho -->
        <div class="ml-2 flex flex-1 flex-col">
          <!-- Título y artista -->
          <div class="flex justify-between items-center">
            <h2
              @click="openDiscDetail"
              class="text-sm text-gray-900 font-semibold truncate cursor-pointer"
            >
              {{ name }}
            </h2>
          </div>
          <div class="flex justify-between items-center">
            <!-- El nombre del artista se hace clickable para abrir ArtistDetail -->
            <p
              @click="openArtistDetail"
              class="text-xs text-gray-500 font-semibold italic cursor-pointer hover:underline"
            >
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

            <!-- Íconos: corazón y bookmark -->
            <div class="flex space-x-2 items-center">
              <div class="relative group">
                <font-awesome-icon
                  :icon="['fas', 'heart']"
                  class="h-7 w-5 cursor-pointer transition-all duration-300 ease-in-out"
                  :class="{
                    'text-red-500 scale-110': favoriteId,
                    'text-gray-500 hover:text-red-400': !favoriteId,
                  }"
                  @click="toggleHeart"
                />
                <span
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-[10px] font-semibold text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  Favoritos
                </span>
              </div>

              <div
                class="relative group cursor-pointer"
                @click="toggleBookmark"
              >
                <font-awesome-icon
                  :icon="['fas', 'bookmark']"
                  class="h-5 w-5 mt-1 cursor-pointer transition-all duration-300 ease-in-out"
                  :class="{
                    'text-yellow-400 scale-110': pendingId,
                    'text-gray-500 hover:text-yellow-300': !pendingId,
                  }"
                />
                <span
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-[10px] font-semibold text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  Pendientes
                </span>
              </div>
            </div>
          </div>

          <!-- Formulario de votación -->
          <div class="flex flex-col space-y-1">
            <label class="text-xs text-gray-500 translate-x-1.5">
              Disco:
              <input
                type="number"
                step="0.01"
                v-model="localRating.rate"
                min="1"
                max="10"
                class="px-0 py-1 border w-16 rounded text-xs font-bold text-center text-gray-500 mt-3 mb-1 ml-0.5"
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
                class="px-0 py-1 w-16 border font-bold rounded text-center text-xs mb-1 ml-0.5"
              />
            </label>
          </div>
        </div>
      </div>

      <!-- Botones para votos y enviar calificación -->
      <div class="flex mt-2 space-x-2 w-full">
        <button
          @click="toggleVotes"
          class="w-1/3 bg-gray-900 text-white font-bold py-2 px-1 rounded-lg shadow-md border-4 border-transparent hover:border-gray-900 hover:bg-gradient-to-l from-gray-600 to-gray-900 flex items-center justify-center space-x-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
            />
          </svg>
          <span>{{ showVotes ? "Ocultar" : "Votos" }}</span>
        </button>

        <button
          @click="openComentsModal"
          class="w-1/3 gap-2 bg-gray-900 text-white font-bold py-2 px-2 rounded-lg shadow-md border-4 border-transparent hover:border-gray-900 hover:bg-gradient-to-l from-gray-600 to-gray-900 flex items-center justify-center"
        >
          <i class="fa-solid fa-comment-dots text-white text-sm"></i>
          <span class="flex items-center">
            Notas
            <span
              v-if="commentCount > 0"
              class="ml-1 text-[10px] text-[#d9e021]"
              >(<span class="inline">{{ commentCount }}</span
              >)</span
            >
          </span>
        </button>

        <button
          @click="submitRating"
          class="w-1/3 bg-gray-200 text-gray-700 font-bold py-2 px-1 rounded-lg shadow-md border-4 border-transparent hover:border-[#d9e021] hover:bg-gradient-to-r hover:from-[#d9e021] hover:to-[#fcee21] flex items-center justify-center space-x-1"
        >
          <template v-if="hasVoted">
            <i class="fa-solid fa-arrows-rotate text-gray-700 text-lg"></i>
          </template>
          <template v-else>
            <i class="fa-solid fa-pen-to-square text-gray-700 text-lg"></i>
          </template>
          <span>{{ hasVoted ? "Actualizar" : "Votar" }}</span>
        </button>
      </div>

      <!-- Lista de votos -->
    </div>


        <!-- Modal para mostrar DiscDetail -->
        <div
      v-if="showVotes"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="p-6 relative max-w-3xl w-full">
        <!-- Se pasa la información del disco -->
        <VotesModal  :votes="votes" :showVotes="showVotes" @close="showVotes = false" />
      </div>
    </div>


    <!-- Modal para mostrar DiscDetail -->
    <div
      v-if="showDiscDetail"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="p-6 relative max-w-3xl w-full">
        <!-- Se pasa la información del disco -->
        <DiscDetail :disc="discData" @close="closeDiscDetail" />
      </div>
    </div>

    <!-- Modal para mostrar ArtistDetail -->
    <div
      v-if="showArtistDetail"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="p-4 relative max-w-3xl w-full">
        <!-- Se pasa el nombre del artista al componente ArtistDetail -->
        <ArtistDetail
          :disc-name="name"
          :artistName="artistName"
          @close="closeArtistDetail"
        />
      </div>
    </div>

    <div
      v-if="showComentsModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="p-4 relative max-w-3xl w-full">
        <ComentsModal :discId="discData.id" @close="closeComentsModal" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watchEffect } from "vue";
import defaultImage from "/src/assets/disco.png";
import DiscDetail from "./DiscDetail.vue";
import ArtistDetail from "./ArtistDetail.vue";
import VotesModal from "./VotesModal.vue"; // Import the new component
import ComentsModal from "./ComentsModal.vue"; // Nuevo componente
import {
  getDiscRates,
  postRateService,
  updateRateService,
} from "@services/rates/rates.ts";
import {
  postFavoriteService,
  deleteFavoriteService,
} from "@services/favorites/favorites.ts";
import {
  postPendingService,
  deletePendingService,
} from "@services/pendings/pendings";
import Swal from "sweetalert2";
import SwalService from "@services/swal/SwalService";

interface Vote {
  id: string;
  user: {
    username: string;
  };
  rate: number;
  cover: number;
}

export default defineComponent({
  components: { DiscDetail, ArtistDetail, ComentsModal, VotesModal }, // Add VotesModal
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
    pendingId: { type: String, required: false },
    commentCount: { type: Number, required: false, default: null },
  },
  setup(props) {
    const localRating = ref({ rate: props.rate, cover: props.cover });
    const showVotes = ref(false);
    const votes = ref<Vote[]>([]);
    const isEP = computed(() => props.ep);
    const hasVoted = ref(!!props.userDiscRate);
    const userDiscRateId = ref(props.userDiscRate);
    const commentCount = ref(props.commentCount);
    const formattedDate = computed(() => {
      const date = new Date(props.releaseDate);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    });

    const computedImage = computed(() => props.image || defaultImage);

    const openImage = () => {
      window.open(props.image, "_blank");
    };

    const favoriteId = ref(props.favoriteId);
    const pendingId = ref(props.pendingId);

    watchEffect(() => {
      favoriteId.value = props.favoriteId;
    });

    const toggleHeart = async () => {
      try {
        if (favoriteId.value) {
          await deleteFavoriteService(favoriteId.value);
          favoriteId.value = null;
        } else {
          const favorite = await postFavoriteService({ discId: props.id });
          favoriteId.value = favorite.id;
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

    const toggleBookmark = async () => {
      try {
        if (pendingId.value) {
          await deletePendingService(pendingId.value);
          pendingId.value = null;
          SwalService.success("Pendiente borrado exitosamente");
        } else {
          const pending = await postPendingService({ discId: props.id });
          pendingId.value = pending.id;
          SwalService.success("Pendiente añadido exitosamente");
        }
      } catch (error) {
        console.error("Error al cambiar el estado de pendiente:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar el estado de pendiente.",
          icon: "error",
          position: "top-end",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
        });
      }
    };

    const toggleVotes = async () => {
      console.log("Before toggle:", showVotes.value); // ADD THIS
      showVotes.value = !showVotes.value;
      console.log("After toggle:", showVotes.value); // ADD THIS
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
          const response = await postRateService(payload);
          userDiscRateId.value = response.id;
          hasVoted.value = true;
        } else {
          await updateRateService(userDiscRateId.value, payload);
        }
        if (payload.rate && payload.rate > 0)
          SwalService.successImage(payload.rate);
        else SwalService.success("Votación enviada con éxito");
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

    const showDiscDetail = ref(false);
    const openDiscDetail = () => {
      showDiscDetail.value = true;
    };
    const closeDiscDetail = () => {
      showDiscDetail.value = false;
    };

    const showArtistDetail = ref(false);
    const openArtistDetail = () => {
      showArtistDetail.value = true;
    };
    const closeArtistDetail = () => {
      showArtistDetail.value = false;
    };

    // Variables y funciones para el modal de ComentsModal
    const showComentsModal = ref(false);
    const openComentsModal = () => {
      showComentsModal.value = true;
    };
    const closeComentsModal = () => {
      showComentsModal.value = false;
    };

    const discData = computed(() => ({
      id: props.id,
      name: props.name,
      image: props.image,
      releaseDate: props.releaseDate,
      artist: { name: props.artistName },
      link: props.link,
      averageRate: props.averageRate,
      averageCover: props.averageCover,
    }));

    return {
      localRating,
      formattedDate,
      computedImage,
      showVotes,
      toggleVotes,
      votes,
      submitRating,
      hasVoted,
      isEP,
      openImage,
      toggleHeart,
      toggleBookmark,
      favoriteId,
      pendingId,
      openDiscDetail,
      closeDiscDetail,
      showDiscDetail,
      discData,
      showArtistDetail,
      openArtistDetail,
      closeArtistDetail,
      showComentsModal,
      openComentsModal,
      closeComentsModal,
      commentCount,
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
  cursor: pointer;
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
