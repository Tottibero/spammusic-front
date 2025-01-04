<template>
    <div class="max-w-[100rem] mx-auto mt-10 px-4">
        <h1 class="text-4xl font-bold mb-8 text-center">Albumes</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="disc in discs" :key="disc.id"
                class="card border p-4 rounded shadow-lg flex flex-col md:flex-row bg-white">
                <!-- Imagen del disco -->
                <div class="mb-4 md:mb-0 md:mr-4 flex-shrink-0">
                    <img :src="disc.image && disc.image.length > 3 ? disc.image : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1BhBgvAdx2cQwiyvb-89VbGVzgQbB983tfw&s'"
                        :alt="disc.name" class="w-48 h-48 object-cover rounded mx-auto md:mx-0" />

                </div>

                <div class="flex flex-col justify-between flex-1">
                    <div>
                        <div class="flex flex-col sm:flex-row items-start justify-between mb-4">
                            <!-- Columna principal (fecha, disco, artista) -->
                            <div class="text-left">
                                <p class="text-sm">{{ disc.releaseDate }}</p>
                                <h2 class="text-xl font-semibold">{{ disc.name }}</h2>
                                <p class="text-gray-600">{{ disc.artist.name }}</p>
                            </div>

                            <!-- Género al final (derecha) -->
                            <p class="p-2 rounded text-sm font-medium text-white text-center"
                                :style="{ backgroundColor: disc.genre?.color || 'grey' }">
                                <span>{{ disc.genre?.name }}</span>
                            </p>
                        </div>

                        <!-- Enlace a Spotify -->
                        <div class="mb-4 text-center md:text-left">
                            <a v-if="disc.link" :href="disc.link" target="_blank" class="text-blue-500 hover:underline">
                                Escuchar en Spotify
                            </a>
                        </div>
                    </div>

                    <div class="flex flex-col">
                        <div class="flex flex-col sm:flex-row items-center justify-between mb-2">
                            <label class="flex items-center space-x-2">
                                <span class="text-sm text-gray-700">Rate:</span>
                                <input type="number" step="0.01"
                                    :value="ratings[disc.id]?.rate !== null ? ratings[disc.id].rate : ''"
                                    @input="updateRating(disc.id, 'rate', ($event.target as HTMLInputElement)?.value || '')"
                                    min="1" max="10" class="px-2 py-1 border rounded w-16" />
                            </label>
                            <label class="flex items-center space-x-2">
                                <span class="text-sm text-gray-700">Cover:</span>
                                <input type="number" step="0.01"
                                    :value="ratings[disc.id]?.cover !== null ? ratings[disc.id].cover : ''"
                                    @input="updateRating(disc.id, 'cover', ($event.target as HTMLInputElement)?.value || '')"
                                    min="1" max="10" class="px-2 py-1 border rounded w-16" />
                            </label>
                        </div>
                        <button @click="submitRating(disc.id)" v-if="ratings[disc.id]?.isNew"
                            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full">
                            Votar
                        </button>
                        <button @click="updateRate(disc.id, ratings[disc.id].id)" v-if="!ratings[disc.id]?.isNew"
                            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full">
                            Actualizar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { getDiscs } from '../services/discs';
import { postRateService, updateRateService } from '../services/rates';
import Swal from "sweetalert2";

// Define types for the Disc and related structures
interface Artist {
    name: string;
}

interface Genre {
    name: string;
    color: string;
}

interface Disc {
    id: string;
    image: string;
    name: string;
    releaseDate: string;
    artist: Artist;
    genre?: Genre;
    link?: string;
    userRate?: {
        id: string;
        rate: number | null;
        cover: number | null;
    };
}

interface Rating {
    rate: number | null;
    cover: number | null;
    id: string | null;
    discId: string;
    isNew: boolean;
}

export default defineComponent({
    setup() {
        const discs = ref<Disc[]>([]); // Define type for discs
        const ratings: Record<string, Rating> = reactive({});
        const limit = ref(20);
        const offset = ref(0);
        const totalItems = ref(0);
        const loading = ref(false);
        const hasMore = ref(true);
        const loadMore = ref<HTMLDivElement | null>(null);

        const fetchDiscs = async () => {
            if (loading.value || !hasMore.value) return;

            loading.value = true;

            try {
                const response = await getDiscs(limit.value, offset.value);
                discs.value.push(...response.data);
                totalItems.value = response.totalItems;

                offset.value += limit.value;

                response.data.forEach((disc: Disc) => {
                    if (!ratings[disc.id]) {
                        const userRate = disc.userRate;
                        ratings[disc.id] = {
                            rate: userRate ? userRate.rate : null,
                            cover: userRate ? userRate.cover : null,
                            id: userRate ? userRate.id : null,
                            discId: disc.id,
                            isNew: userRate ? false : true, // Indica si es un dato nuevoW
                        };
                    }
                });

                hasMore.value = offset.value < totalItems.value;
            } catch (error) {
                console.error('Error fetching discs:', error);
            } finally {
                loading.value = false;
            }
        };

        const updateRating = (discId: string, field: keyof Rating, value: string) => {
            if (!ratings[discId]) {
                ratings[discId] = { rate: null, cover: null, id: null, discId, isNew: true };
            }

            if (field === 'rate' || field === 'cover') {
                ratings[discId][field] = value ? parseFloat(value) : null;
            } else if (field === 'id' || field === 'discId') {
                ratings[discId][field] = value;
            }
        };

        const submitRating = async (discId: string) => {
            const { rate, cover } = ratings[discId];
            const payload = { discId, rate, cover };

            ratings[discId].isNew = false;
            let message = "";
            if (rate != null) {
                message = customMessage(rate)
            } else if (cover != null) {
                message = customMessage(cover)
            }

            try {
                await postRateService(payload);
                Swal.fire({
                    title: "¡Éxito!",
                    text: message,
                    icon: "success",
                    position: "top-end",
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    toast: true,
                });
            } catch (error) {
                console.error('Error submitting rating:', error);
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

        const customMessage = (integerRating: number) => {

            let message = '';

            switch (integerRating) {
                case 0:
                    message = '¿Tan malo es?';
                    break;
                case 1:
                    message = 'Ouch, fue muy bajo. ¡Gracias por tu rating de 1!';
                    break;
                case 2:
                    message = 'Aún se puede mejorar. Tu rating es de 2.';
                    break;
                case 3:
                    message = 'No está mal, tu rating es de 3.';
                    break;
                case 4:
                    message = 'Tu rating es de 4. ¡Gracias!';
                    break;
                case 5:
                    message = 'Has puesto un 5. ¡Ni tan mal!';
                    break;
                case 6:
                    message = 'Muy buen rating, un sólido 6.';
                    break;
                case 7:
                    message = 'No esta mal';
                    break;
                case 8:
                    message = 'Bueno bueno...';
                    break;
                case 9:
                    message = 'A recomendados ¿no?';
                    break;
                case 10:
                    message = '¡Va al top fijo!';
                    break;
                default:
                    // Por si el rating se sale del rango esperado o no es un número
                    message = `Tu rating es de ${integerRating}, ¡gracias por evaluar!`;
                    break;
            }

            return message;
        }

        const updateRate = async (discId: string, ratingId: string | null) => {
            const { rate, cover } = ratings[discId];

            if (ratingId == null) {
                return;
            }

            const validRate = parseFloat(rate as unknown as string); // Cast explícito
            const validCover = parseFloat(cover as unknown as string);

            let message = "";
            if (rate != null) {
                message = customMessage(rate)
            } else if (!rate && cover != null) {
                message = customMessage(cover)
            }


            const payload = { rate: validRate, cover: validCover };

            try {
                await updateRateService(ratingId, payload);
                Swal.fire({
                    title: "¡Éxito!",
                    text: message,
                    icon: "success",
                    position: "top-end",
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    toast: true,
                });
            } catch (error) {
                console.error('Error updating rating:', error);
                Swal.fire({
                    title: "Error",
                    text: "No se pudo actualizar tu evaluación.",
                    icon: "error",
                    position: "top-end",
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    toast: true,
                });
            }
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchDiscs();
            }
        });

        onMounted(() => {
            if (loadMore.value) {
                observer.observe(loadMore.value);
            }

            fetchDiscs();
        });

        return {
            discs,
            loadMore,
            loading,
            hasMore,
            ratings,
            updateRating,
            submitRating,
            updateRate,
        };
    },
});
</script>


<style>
@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
    }

    .card {
        margin: 8px;
        padding: 12px;
        flex-direction: column;
    }

    button {
        font-size: 14px;
        padding: 8px 8px;
        width: 100%;
    }

    .card img {
        width: 100%;
        height: auto;
    }
}

@media (min-width: 1024px) {
    .grid {
        grid-template-columns: 1fr 1fr;
    }

    .card {
        flex-direction: row;
    }
}

@media (min-width: 1280px) {
    .grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .card {
        flex-direction: row;
    }
}
</style>
