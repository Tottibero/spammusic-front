<template>
  <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
    <input v-if="showSearchQuery" v-model="searchQuery" type="text" placeholder="Buscar álbum o artista..."
      class="flex-[2] p-1.5 shadow-md rounded-full pl-4 pr-8 mb-4 sm:mb-0" />

    <SearchableSelect v-model="selectedGenre" :options="genres" placeholder="Selecciona un género" title="name"
      trackby="id" :max="150" class="select-pill" :class="selectClass" />

    <Datepicker v-if="showWeekPicker" v-model="selectedWeek" :weekPicker="true" placeholder="Selecciona una semana"
      class="flex-[2] px-3 py-2 w-full rounded-lg border-white mt-2 pl-1" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import Datepicker from "@vuepic/vue-datepicker";
import SearchableSelect from "@components/SearchableSelect.vue";

export default defineComponent({
  components: {
    Datepicker,
    SearchableSelect,
  },
  props: {
    searchQuery: {
      type: String,
      default: "",
    },
    selectedGenre: {
      type: String,
      default: "",
    },
    selectedWeek: {
      type: Object,
      default: null,
    },
    genres: {
      type: Array,
      default: () => [],
    },

    selectClass: { type: String, default: "" },       // clases para el <SearchableSelect>
    triggerHeight: { type: [Number, String], default: 36 }, // alto del botón/trigger
    wrapperClass: { type: String, default: "" },      // clases para el wrapper raíz

    showWeekPicker: { type: Boolean, default: true },
    showSearchQuery: { type: Boolean, default: true },
  },
  emits: [
    "update:searchQuery",
    "update:selectedGenre",
    "update:selectedWeek",
    "resetAndFetch",
  ],
  setup(props, { emit }) {
    const searchQuery = ref(props.searchQuery);
    const selectedGenre = ref(props.selectedGenre);
    const selectedWeek = ref(props.selectedWeek);

    watch(searchQuery, (newValue) => emit("update:searchQuery", newValue));
    watch(selectedGenre, (newValue) => emit("update:selectedGenre", newValue)); // Emite el nuevo valor
    watch(selectedWeek, (newValue) => emit("update:selectedWeek", newValue));

    return {
      searchQuery,
      selectedGenre,
      selectedWeek,
    };
  },
});
</script>

<style scoped>
/* Estilos específicos del componente si es necesario */
.flex-[2] {
  display: flex;
  align-items: center;
  justify-content: start;
}

input[type="checkbox"] {
  margin-right: 0.5rem;
}

/* Botón/trigger del select */
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