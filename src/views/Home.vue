<template>
    <div class="max-w-[100rem] mx-auto mt-10 px-4">
        <h1 class="text-4xl font-bold mb-8 text-center">Albumes</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="disc in discs" :key="disc.id"
                class="card border p-4 rounded shadow-lg flex flex-col md:flex-row bg-white">
                <!-- Imagen del disco -->
                <div  class="mb-4 md:mb-0 md:mr-4 flex-shrink-0">
                    <img :src="disc.image && disc.image.length > 3 ? disc.image : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1BhBgvAdx2cQwiyvb-89VbGVzgQbB983tfw&s'" :alt="disc.name" class="w-48 h-48 object-cover rounded mx-auto md:mx-0" />

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
                        <button @click="submitRating(disc.id)" v-if="ratings[disc.id]?.rate === null"
                            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full">
                            Votar
                        </button>
                        <button @click="update(disc.id)" v-if="ratings[disc.id]?.rate !== null"
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
import { postRate, updateRate } from '../services/rates';
import Swal from "sweetalert2";

export default defineComponent({
    setup() {
        const discs = ref([]);
        const ratings = reactive({});
        const limit = ref(20);
        const offset = ref(0);
        const totalItems = ref(0);
        const loading = ref(false);
        const hasMore = ref(true);
        const loadMore = ref(null);

        const fetchDiscs = async () => {
            if (loading.value || !hasMore.value) return;

            loading.value = true;

            try {
                const response = await getDiscs(limit.value, offset.value);
                discs.value.push(...response.data);
                totalItems.value = response.totalItems;

                offset.value += limit.value;

                response.data.forEach((disc) => {
                    if (!ratings[disc.id]) {
                        const userRate = disc.userRate;
                        ratings[disc.id] = {
                            rate: userRate ? parseFloat(userRate.rate) : null,
                            cover: userRate ? parseFloat(userRate.cover) : null,
                            id: userRate ? userRate.id : null,
                            discId: disc.id
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

        const updateRating = (discId, field, value) => {
            if (!ratings[discId]) {
                ratings[discId] = { rate: null, cover: null, id: null, discId: null };
            }
            ratings[discId][field] = value ? parseFloat(value) : null;
        };

        const submitRating = async (discId) => {
            // Existing logic for submitting a rating
        };

        const update = async (discRate) => {
            // Existing logic for updating a rating
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
            update
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
