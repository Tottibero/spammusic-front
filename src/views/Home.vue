<template>
<h1>Hello Word</h1>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { getDiscs } from '../services/discs';
import { postRate } from '../services/rates';

export default defineComponent({
    setup() {
        const discs = ref<any[]>([]);
        const ratings = reactive<Record<string, { rate: number; cover: number }>>({});
        const limit = ref(20); // Cambiado el límite a 20
        const offset = ref(1);
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

                // Incrementa el offset
                offset.value += limit.value;

                // Inicializa valores predeterminados para rate y cover
                response.data.forEach((disc) => {
                    if (!ratings[disc.id]) {
                        ratings[disc.id] = { rate: 0, cover: 0 }; // Valores por defecto
                    }
                });

                // Verifica si hay más discos por cargar
                hasMore.value = offset.value < totalItems.value;
            } catch (error) {
                console.error('Error fetching discs:', error);
            } finally {
                loading.value = false;
            }
        };

        const updateRating = (discId: string, field: 'rate' | 'cover', value: string) => {
            if (!ratings[discId]) {
                ratings[discId] = { rate: 5, cover: 5 }; // Inicializa el objeto si no existe
            }
            ratings[discId][field] = parseInt(value, 10); // Actualiza el campo correspondiente
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

        // Configuración del Intersection Observer para detectar scroll
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchDiscs();
            }
        });

        onMounted(() => {
            if (loadMore.value) {
                observer.observe(loadMore.value);
            }

            // Carga inicial
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