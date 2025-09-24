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

    <div class="flex items-center flex-wrap gap-2 mt-2 sm:mt-0" v-if="showWeekPicker">
      <!-- MES: primera opción = Año completo – {weeksYear} -->
      <select
        v-model.number="weeksMonth"
        class="rounded-full h-9 bg-white border border-gray-200 shadow-md px-4"
      >
        <!-- valor 0 representa AÑO COMPLETO -->
        <option :value="0">Año completo</option>
        <option v-for="m in 12" :key="m" :value="m">
          {{ monthNames[m - 1] }}
        </option>
      </select>

      <!-- AÑO -->
      <select
        v-model.number="weeksYear"
        class="rounded-full h-9 bg-white border border-gray-200 shadow-md px-4"
      >
        <option disabled value="">Año</option>
        <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
      </select>

      <!-- PERIODO (solo cuando hay mes seleccionado) -->
      <select
        v-if="weeksMonth && weeksYear"
        v-model="selectedPeriodKey"
        class="rounded-full h-9 leading-9 bg-white border border-gray-200 shadow-md px-4"
      >
        <optgroup :label="`Periodo – ${monthNames[weeksMonth - 1]} ${weeksYear}`">
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
    selectedWeek: { type: Array, default: null },
    genres: { type: Array, default: () => [] },

    selectClass: { type: String, default: "" },
    triggerHeight: { type: [Number, String], default: 36 },
    wrapperClass: { type: String, default: "" },

    showWeekPicker: { type: Boolean, default: true },
    showSearchQuery: { type: Boolean, default: true },
  },
  emits: ["update:searchQuery", "update:selectedGenre", "update:selectedWeek", "resetAndFetch"],
  setup(props, { emit }) {
    const searchQuery = ref(props.searchQuery);
    const selectedGenre = ref(props.selectedGenre);
    watch(searchQuery, (v) => emit("update:searchQuery", v));
    watch(selectedGenre, (v) => emit("update:selectedGenre", v));

    // Estado base
    const today = new Date();
    // Por defecto: AÑO COMPLETO (weeksMonth = 0)
    const weeksMonth = ref<number>(0);
    const weeksYear = ref<number>(Math.max(2025, today.getUTCFullYear()));

    const monthNames = [
      "Enero","Febrero","Marzo","Abril","Mayo","Junio",
      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
    ];

    const availableYears = computed(() => {
      const base = 2025;
      const current = new Date().getFullYear();
      const arr: number[] = [];
      for (let y = base; y <= current; y++) arr.push(y);
      return arr;
    });

    // Utils UTC
    const isoStartUTC = (d: Date) => {
      const x = new Date(d);
      x.setUTCHours(0, 0, 0, 0);
      return x.toISOString();
    };
    const isoEndUTC = (d: Date) => {
      const x = new Date(d);
      x.setUTCHours(23, 59, 59, 999);
      return x.toISOString();
    };

    // Año completo
    const yearOption = computed<Option>(() => {
      const y = Number(weeksYear.value);
      return {
        key: `Y-${y}`,
        label: `Año completo`,
        start: isoStartUTC(new Date(Date.UTC(y, 0, 1))),
        end: isoEndUTC(new Date(Date.UTC(y, 11, 31))),
      };
    });

    // Mes completo
    const monthOption = computed<Option>(() => {
      const y = Number(weeksYear.value), m = Math.max(0, Number(weeksMonth.value) - 1);
      const start = isoStartUTC(new Date(Date.UTC(y, m, 1)));
      const end = isoEndUTC(new Date(Date.UTC(y, m + 1, 0)));
      return { key: `M-${y}-${m + 1}`, label: "Mes completo", start, end };
    });

    // Semanas viernes→jueves
    const weekOptions = computed<Option[]>(() => {
      if (!weeksMonth.value || !weeksYear.value) return [];
      const y = Number(weeksYear.value), m = Number(weeksMonth.value) - 1;

      const first = new Date(Date.UTC(y, m, 1));
      let d = new Date(first);
      const add = (date: Date, days: number) => {
        const n = new Date(date); n.setUTCDate(n.getUTCDate() + days); return n;
      };
      const day = d.getUTCDay(); // 0..6
      const toFriday = day <= 5 ? 5 - day : 7 - (day - 5);
      d = add(d, toFriday);

      const opts: Option[] = [];
      const monthEnd = new Date(Date.UTC(y, m + 1, 0));

      const short = (date: Date) =>
        `${String(date.getUTCDate()).padStart(2, "0")} ${monthNames[date.getUTCMonth()].slice(0, 3)}`;

      while (d.getUTCMonth() === m) {
        const start = isoStartUTC(d);
        const endThurs = add(d, 6);
        const end = isoEndUTC(endThurs);
        opts.push({ key: `W-${d.toISOString().slice(0,10)}`, label: `${short(d)} – ${short(endThurs)}`, start, end });
        d = add(d, 7);
        if (d > add(monthEnd, 7)) break;
      }
      return opts;
    });

    const selectedPeriodKey = ref<string | null>(null);

    // Emitir según selección
    const emitYear = () => emit("update:selectedWeek", [yearOption.value.start, yearOption.value.end] as RangeTuple);
    const emitMonth = () => emit("update:selectedWeek", [monthOption.value.start, monthOption.value.end] as RangeTuple);

    // Si cambia mes/año:
    watch([weeksMonth, weeksYear], () => {
      if (!weeksYear.value) return;
      if (weeksMonth.value === 0) {
        // Año completo -> ocultamos Periodo y emitimos rango anual
        selectedPeriodKey.value = null;
        emitYear();
      } else {
        // Mes seleccionado -> por defecto "Mes completo"
        selectedPeriodKey.value = monthOption.value.key;
        emitMonth();
      }
    }, { immediate: true });

    // Cuando cambia el select de "Periodo"
    watch(selectedPeriodKey, (k) => {
      if (!k) return;
      const all = [monthOption.value, ...weekOptions.value];
      const picked = all.find(o => o.key === k);
      if (!picked) return;
      emit("update:selectedWeek", [picked.start, picked.end] as RangeTuple);
    });

    return {
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

/* eleva el menú del select de géneros */
:deep(.select-pill .dropdown-panel),
:deep(.select-pill .search__menu),
:deep(.select-pill .options),
:deep(.select-pill .menu) {
  z-index: 9999 !important;
  position: absolute;
}
</style>
