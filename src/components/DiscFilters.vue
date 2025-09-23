<template>
  <div
    class="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4"
    :class="wrapperClass"
  >
    <input
      v-if="showSearchQuery"
      v-model="searchQuery"
      type="text"
      placeholder="Buscar álbum o artista..."
      class="flex-[2] p-1.5 shadow-md rounded-full pl-4 pr-8 mb-4 sm:mb-0"
    />

    <SearchableSelect
      v-model="selectedGenre"
      :options="genres"
      placeholder="Selecciona un género"
      title="name"
      trackby="id"
      :max="150"
      class="select-pill"
      :class="selectClass"
    />

    <div class="flex items-center flex-wrap gap-2 mt-2 sm:mt-0">
      <!-- Mes -->
      <select
        v-model.number="weeksMonth"
        class="rounded-full h-9 bg-white border border-gray-200 shadow-md px-4"
      >
        <option disabled value="">Mes</option>
        <option v-for="m in 12" :key="m" :value="m">
          {{ monthNames[m - 1] }}
        </option>
      </select>

      <!-- Año -->
      <select
        v-model.number="weeksYear"
        class="rounded-full h-9 bg-white border border-gray-200 shadow-md px-4"
      >
        <option disabled value="">Año</option>
        <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
      </select>

      <!-- Periodo (Mes completo + semanas) -->
      <select
        v-if="weeksMonth && weeksYear"
        v-model="selectedPeriodKey"
        class="rounded-full h-9 leading-9 bg-white border border-gray-200 shadow-md px-4"
      >
        <optgroup
          :label="`Periodo – ${monthNames[weeksMonth - 1]} ${weeksYear}`"
        >
          <option :value="monthOption.key">{{ monthOption.label }}</option>
        </optgroup>
        <optgroup label="Semanas">
          <option v-for="w in weekOptions" :key="w.key" :value="w.key">
            {{ w.label }}
          </option>
        </optgroup>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";
import SearchableSelect from "@components/SearchableSelect.vue";

type RangeTuple = [string, string];
type Option = { key: string; label: string; start: string; end: string };

export default defineComponent({
  components: { SearchableSelect },
  props: {
    searchQuery: { type: String, default: "" },
    selectedGenre: { type: String, default: "" },
    selectedWeek: { type: Array, default: null }, // seguimos emitiendo un array [start,end]
    genres: { type: Array, default: () => [] },

    selectClass: { type: String, default: "" },
    triggerHeight: { type: [Number, String], default: 36 },
    wrapperClass: { type: String, default: "" },

    showWeekPicker: { type: Boolean, default: true }, // (ya no se usa el datepicker, pero mantengo la prop)
    showSearchQuery: { type: Boolean, default: true },
  },
  emits: [
    "update:searchQuery",
    "update:selectedGenre",
    "update:selectedWeek",
    "resetAndFetch",
  ],
  setup(props, { emit }) {
    // filtros existentes
    const searchQuery = ref(props.searchQuery);
    const selectedGenre = ref(props.selectedGenre);
    watch(searchQuery, (v) => emit("update:searchQuery", v));
    watch(selectedGenre, (v) => emit("update:selectedGenre", v));

    // Mes/año que controlan el listado de semanas
    const today = new Date();
    const weeksMonth = ref<number | "">(today.getUTCMonth() + 1);
    const weeksYear = ref<number | "">(Math.max(2025, today.getUTCFullYear()));

    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const availableYears = computed(() => {
      const base = 2025;
      const current = new Date().getFullYear();
      const arr: number[] = [];
      for (let y = base; y <= current; y++) arr.push(y);
      return arr;
    });

    // Utilidades UTC
    const isoStartUTC = (d: Date) => {
      const x = new Date(d);
      x.setUTCHours(0, 0, 0, 0);
      return x.toISOString();
    };
    const isoEndUTC = (d: Date) => {
      const x = new Date(d);
      x.setUTCHours(0, 0, 0, 0);
      return x.toISOString();
    };
    const shiftDaysUTC = (d: Date, days: number) => {
      const x = new Date(d);
      x.setUTCDate(x.getUTCDate() + days);
      return x;
    };

    // Mes completo -> opción
    const monthOption = computed<Option>(() => {
      const y = Number(weeksYear.value),
        m = Number(weeksMonth.value) - 1;
      const start = isoStartUTC(new Date(Date.UTC(y, m, 1)));
      const end = isoEndUTC(new Date(Date.UTC(y, m + 1, 0)));
      return {
        key: `M-${y}-${m + 1}`,
        label: `Mes completo`,
        start,
        end,
      };
    });

    // Semanas viernes→viernes (end = jueves 23:59:59.999)
    const weekOptions = computed<Option[]>(() => {
      if (!weeksMonth.value || !weeksYear.value) return [];
      const y = Number(weeksYear.value),
        m = Number(weeksMonth.value) - 1;

      // 1) encontrar el primer viernes del mes (UTC)
      const firstOfMonth = new Date(Date.UTC(y, m, 1));
      let d = new Date(firstOfMonth);
      // 5 = Friday en getUTCDay()
      const addDays = (date: Date, days: number) => {
        const n = new Date(date);
        n.setUTCDate(n.getUTCDate() + days);
        return n;
      };
      const day = d.getUTCDay();
      const toFriday = day <= 5 ? 5 - day : 7 - (day - 5);
      d = addDays(d, toFriday);

      const opts: Option[] = [];
      const monthEnd = new Date(Date.UTC(y, m + 1, 0)); // último día del mes

      const short = (date: Date) =>
        `${String(date.getUTCDate()).padStart(2, "0")} ${monthNames[
          date.getUTCMonth()
        ].slice(0, 3)}`;

      while (d.getUTCMonth() === m) {
        const start = isoStartUTC(d); // viernes 00:00
        const endThurs = addDays(d, 6); // jueves
        const end = isoEndUTC(endThurs);

        opts.push({
          key: `W-${d.toISOString().slice(0, 10)}`,
          label: `${short(d)} – ${short(endThurs)}`,
          start,
          end,
        });

        // siguiente viernes
        d = addDays(d, 7);
        // seguridad para salir si se pasó demasiado
        if (d > addDays(monthEnd, 7)) break;
      }
      return opts;
    });

    // Valor seleccionado del select combinado
    const selectedPeriodKey = ref<string | null>(null);

    // Emitir cuando cambia la selección
    watch(selectedPeriodKey, (k) => {
      if (!k) return;
      const all = [monthOption.value, ...weekOptions.value];
      const picked = all.find((o) => o.key === k);
      if (!picked) return;

      let start = picked.start;
      let end = picked.end;

      // Solo para semanas (no para "Mes completo")
      // if (picked.key.startsWith("W-")) {
      //   start = isoStartUTC(shiftDaysUTC(new Date(start), -7));
      //   end = isoEndUTC(shiftDaysUTC(new Date(end), -7));
      // }

      emit("update:selectedWeek", [start, end] as RangeTuple);
    });

    // Si cambian mes/año, reseteamos elección
    watch(
      [weeksMonth, weeksYear],
      () => {
        selectedPeriodKey.value = monthOption.value.key;
      },
      { immediate: true }
    );

    return {
      // modelos
      searchQuery,
      selectedGenre,
      weeksMonth,
      weeksYear,
      monthNames,
      availableYears,
      selectedPeriodKey,
      weekOptions,
      monthOption,
    };
  },
});
</script>

<style scoped>
.flex-[2] {
  display: flex;
  align-items: center;
  justify-content: start;
}
:deep(.select-pill .search_input_trigger) {
  @apply rounded-full h-9 leading-9 bg-white border border-gray-200 shadow-md pl-6 pr-4;
}
:deep(.select-pill .search__input) {
  @apply pl-4;
}
:deep(.select-pill .search_input_trigger svg) {
  @apply right-3;
}
</style>
