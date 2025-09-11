<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-lg shadow-xl w-[95%] sm:max-w-2xl p-6 relative max-h-[80vh] overflow-y-auto">
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-white hover:text-[#d9e021] bg-gray-700 hover:bg-gray-800 rounded-full w-9 h-9 flex items-center justify-center shadow-md transition-all"
        aria-label="Cerrar"
        title="Cerrar"
      >
        ✖
      </button>

      <h3 class="text-lg font-semibold text-gray-800 text-center mb-1">
        {{ username }}
      </h3>

      <div v-if="loading" class="py-8 text-center text-gray-600">
        Cargando historial...
      </div>

      <div v-else-if="error" class="py-6 text-center">
        <p class="text-red-600">Error: {{ error }}</p>
        <button
          @click="fetchHistory()"
          class="mt-3 px-3 py-1.5 rounded bg-gray-700 text-white hover:bg-gray-800 text-sm"
        >
          Reintentar
        </button>
      </div>

      <div v-else>
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div class="text-sm text-gray-700">
            <span class="font-medium">Eventos visibles:</span> {{ visibleEvents.length }}
          </div>
          <div class="text-xs text-gray-500">
            Página {{ history?.currentPage }} / {{ history?.totalPages }}
          </div>
        </div>

        <!-- Lista de eventos (filtrados) -->
        <ul class="divide-y divide-gray-200">
          <li v-for="ev in visibleEvents" :key="ev.rateId + '|' + ev.timestamp" class="py-2 text-sm">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <p class="text-gray-800">
                  <span
                    class="px-1.5 py-0.5 rounded text-white text-xs mr-2"
                    :class="ev.action === 'created' ? 'bg-emerald-600' : 'bg-amber-600'"
                  >
                    {{ ev.action }}
                  </span>
                  <span class="font-medium">{{ ev.disc?.name }}</span>
                  <span class="text-gray-500"> — {{ ev.disc?.artist?.name }}</span>
                </p>
                <p class="text-gray-600 text-xs mt-0.5">
                  Disco: {{ ev.rate ?? '—' }} · Portada: {{ ev.cover ?? '—' }}
                </p>
              </div>
              <div class="text-xs text-gray-500 ml-3 whitespace-nowrap">
                {{ new Date(ev.timestamp).toLocaleString() }}
              </div>
            </div>
          </li>
        </ul>

        <!-- Controles de paginación -->
        <div class="mt-4 flex items-center justify-between">
          <button
            class="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:opacity-50"
            :disabled="offset === 0 || loading"
            @click="prevPage"
          >
            ← Anterior
          </button>
          <button
            class="px-3 py-1.5 rounded bg-gray-700 text-white hover:bg-gray-800 text-sm disabled:opacity-50"
            :disabled="!canNext || loading"
            @click="nextPage"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, computed } from 'vue';
import { getUserHistoryService, type GetUserHistoryResponse } from '@/services/rates/rates.ts';

export default defineComponent({
  name: 'UserModal',
  props: {
    username: { type: String, required: true },
    userId:   { type: String, required: true },
  },
  emits: ['close'],
  setup(props) {
    const history = ref<GetUserHistoryResponse | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // paginación local
    const limit = ref(20);
    const offset = ref(0);

    const canNext = computed(() => {
      if (!history.value) return false;
      return offset.value + limit.value < history.value.totalItems;
    });

    const fetchHistory = async () => {
      loading.value = true;
      error.value = null;
      try {
        history.value = await getUserHistoryService({
          userId: props.userId,
          limit: limit.value,
          offset: offset.value,
          type: 'both',
          order: 'DESC',
          // from / to opcional
        });
      } catch (e: any) {
        error.value = e?.response?.data?.message || e?.message || 'Error desconocido';
      } finally {
        loading.value = false;
      }
    };

    // Filtra 'updated' cuando exista un 'created' del mismo disco con misma rate y cover
    const visibleEvents = computed(() => {
      const list = history.value?.data ?? [];

      // Indexa CREATED por clave: discId|rate|cover
      const createdKeys = new Set<string>();
      for (const ev of list) {
        if (ev.action !== 'created') continue;
        const discId = ev.disc?.id ?? '';
        const rate = ev.rate ?? null;
        const cover = ev.cover ?? null;
        createdKeys.add(`${discId}|${rate}|${cover}`);
      }

      // Filtra UPDATED que dupliquen un CREATED en el mismo array
      return list.filter((ev) => {
        if (ev.action !== 'updated') return true;
        const discId = ev.disc?.id ?? '';
        const rate = ev.rate ?? null;
        const cover = ev.cover ?? null;
        const key = `${discId}|${rate}|${cover}`;
        return !createdKeys.has(key);
      });
    });

    const nextPage = () => {
      if (!canNext.value) return;
      offset.value += limit.value;
      fetchHistory();
    };
    const prevPage = () => {
      offset.value = Math.max(0, offset.value - limit.value);
      fetchHistory();
    };

    onMounted(fetchHistory);

    // Si se abre con otro userId sin destruir el componente
    watch(() => props.userId, () => {
      offset.value = 0;
      fetchHistory();
    });

    return {
      history,
      loading,
      error,
      fetchHistory,
      nextPage,
      prevPage,
      limit,
      offset,
      canNext,
      visibleEvents,
    };
  },
});
</script>
