<template>
    <div class="max-w-7xl mx-auto mt-10 px-4">
        <h1 class="text-4xl font-bold mb-8 text-center">Albumes</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="disc in discs" :key="disc.id" class="card border p-4 rounded shadow-lg flex flex-col bg-white">
                <div class="flex flex-col sm:flex-row items-start justify-start mb-4 ">
                    <!-- Columna principal (fecha, disco, artista) -->
                    <div class="flex-1 text-left">
                        <p class="text-sm">{{ disc.releaseDate }}</p>
                        <h2 class="text-xl font-semibold">{{ disc.name }}</h2>
                        <p class="text-gray-600">{{ disc.artist.name }}</p>
                    </div>

                    <!-- Género al final (derecha) -->
                    <p class="p-2 rounded text-sm font-medium text-white"
                        :style="{ backgroundColor: disc.genre?.color || 'grey' }">
                        <span>{{ disc.genre?.name }}</span>
                    </p>
                </div>

                <div class="flex flex-col sm:flex-row items-center justify-between">
                    <label class="flex items-center space-x-2 mb-2 sm:mb-0">
                        <span class="text-sm text-gray-700">Rate:</span>
                        <input type="number" :value="ratings[disc.id]?.rate !== null ? ratings[disc.id].rate : ''"
                            @input="updateRating(disc.id, 'rate', ($event.target as HTMLInputElement)?.value || '')"
                            min="1" max="10" class=" px-2 py-1 border rounded" />
                    </label>
                    <label class="flex items-center space-x-2 mb-2 sm:mb-0">
                        <span class="text-sm text-gray-700">Cover:</span>
                        <input type="number" :value="ratings[disc.id]?.cover !== null ? ratings[disc.id].cover : ''"
                            @input="updateRating(disc.id, 'cover', ($event.target as HTMLInputElement)?.value || '')"
                            min="1" max="10" class=" px-2 py-1 border rounded" />
                    </label>
                    <button @click="submitRating(disc.id)" v-if="ratings[disc.id]?.rate === null"
                        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Votar
                    </button>
                    <button @click="update(disc.id)" v-if="ratings[disc.id]?.rate !== null"
                        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Actualizar
                    </button>

                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { getDiscs } from '../services/discs';
import { postRate, updateRate } from '../services/rates';
import { useToaster } from "vue3-toaster";

type Disc = {
    id: string;
    name: string;
    artist: { name: string };
    releaseDate: string;
    userRate?: { rate: string; cover: string, id: string };
    genre?: { color: string, name: string }
};

export default defineComponent({
    setup() {
        const discs = ref<Disc[]>([]);
        const ratings = reactive<Record<string, { rate: number | null; cover: number | null, id: string | null , discId: string | null }>>({});
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

        const updateRating = (discId: string, field: 'rate' | 'cover', value: string) => {
            if (!ratings[discId]) {
                ratings[discId] = { rate: null, cover: null, id: null, discId: null };
            }
            ratings[discId][field] = value ? parseInt(value, 10) : null;
        };


        const submitRating = async (discId: string) => {
            const { rate, cover } = ratings[discId];
            const payload: any = { discId, rate, cover };

            const ratingValue = rate; // e.g. 6.5

            const integerRating = ratingValue != null ? Math.floor(ratingValue) : 0;

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


            try {
                await postRate(payload);
                useToaster().add
                    ({
                        title: 'Success',
                        text: message,
                        type: 'success',
                        options: {
                            duration: 3,
                            closable: true,
                            pauseOnHover: true
                        }
                    }
                    );

            } catch (error) {
                console.error('Error submitting rating:', error);
                useToaster().add
                    ({
                        title: 'Error',
                        text: 'Failed submitting rating:',
                        type: 'error',
                        options: {
                            duration: 3,
                            closable: true,
                            pauseOnHover: true
                        }
                    }
                    );

            }
        };

        const update = async (discRate: string) => {
            const { rate, cover, id, discId } = ratings[discRate];
            const rateId = id;
            const payload: any = {  rate, cover, discId };
            console.log(discId);
            const ratingValue = rate; // e.g. 6.5

            const integerRating = ratingValue != null ? Math.floor(ratingValue) : 0;

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


            try {
                await updateRate(rateId, payload);
                useToaster().add
                    ({
                        title: 'Success',
                        text: message,
                        type: 'success',
                        options: {
                            duration: 3,
                            closable: true,
                            pauseOnHover: true
                        }
                    }
                    );

            } catch (error) {
                console.error('Error submitting rating:', error);
                useToaster().add
                    ({
                        title: 'Error',
                        text: 'Failed submitting rating:',
                        type: 'error',
                        options: {
                            duration: 3,
                            closable: true,
                            pauseOnHover: true
                        }
                    }
                    );

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
            update
        };
    },
});
</script>

<style>
@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
        /* Una columna en móviles */
    }

    .card {
        margin: 8px;
        /* Menos margen en tarjetas */
        padding: 12px;
        /* Reducir espacio interno */
    }

    button {
        font-size: 14px;
        /* Reducir tamaño del texto en botones */
        padding: 8px 8px;
        width: 100%;
        /* Botones ocupan el ancho completo */
    }
}
</style>
