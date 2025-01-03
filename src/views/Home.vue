<template>
    <div class="max-w-7xl mx-auto mt-10">
        <h1 class="text-4xl font-bold mb-8 text-center">Albumes</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="disc in discs" :key="disc.id" class="border p-4 rounded shadow-lg flex flex-col bg-red-100">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h2 class="text-xl font-semibold">{{ disc.name }}</h2>
                        <p class="text-gray-600">{{ disc.artist.name }}</p>
                    </div>
                    <p class="bg-gray-100 p-2 rounded text-sm font-medium">{{ disc.releaseDate }}</p>
                </div>
                <div class="flex items-center justify-between">
                    <label class="flex items-center space-x-2">
                        <span class="text-sm text-gray-700">Rate:</span>
                        <input type="number" :value="ratings[disc.id]?.rate !== null ? ratings[disc.id].rate : ''"
                            @input="updateRating(disc.id, 'rate', ($event.target as HTMLInputElement)?.value || '')"
                            min="1" max="10" class="w-full px-2 py-1 border rounded" />
                    </label>
                    <label class="flex items-center space-x-2">
                        <span class="text-sm text-gray-700">Cover:</span>
                        <input type="number" :value="ratings[disc.id]?.cover !== null ? ratings[disc.id].cover : ''"
                            @input="updateRating(disc.id, 'cover', ($event.target as HTMLInputElement)?.value || '')"
                            min="1" max="10" class="w-full px-2 py-1 border rounded" />
                    </label>
                    <button @click="submitRating(disc.id)"
                        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Votar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { getDiscs } from '../services/discs';
import { postRate } from '../services/rates';

type Disc = {
    id: string;
    name: string;
    artist: { name: string };
    releaseDate: string;
    userRate?: { rate: string; cover: string };
};

export default defineComponent({
    setup() {
        const discs = ref<Disc[]>([]);
        const ratings = reactive<Record<string, { rate: number | null; cover: number | null }>>({});
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
                ratings[discId] = { rate: null, cover: null };
            }
            ratings[discId][field] = value ? parseInt(value, 10) : null;
        };

        const submitRating = async (discId: string) => {
            const { rate, cover } = ratings[discId];
            const payload: any = { discId, rate, cover };

            try {
                await postRate(payload);
                alert('Rating submitted successfully!');
            } catch (error) {
                console.error('Error submitting rating:', error);
                alert('Failed to submit rating.');
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
        };
    },
});
</script>