<template>
  <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
    <input
      v-if="showSearchQuery"
      v-model="searchQuery"
      type="text"
      placeholder="Buscar álbum o artista..."
      class="flex-[3] p-2 shadow-md rounded-md mb-4 sm:mb-0"
    />

    <SearchableSelect
      v-model="selectedGenre"
      :options="genres"
      placeholder="Seleccione un género"
      title="name"
      trackby="id"
      :max="150"
      class="flex-[2] px-3 py-2 w-full rounded-md bg-white rounded shadow-md custom-height-select placeholder-gray-400"
    />

    <Datepicker
      v-if="showWeekPicker"
      v-model="selectedWeek"
      :weekPicker="true"
      placeholder="Selecciona una semana"
      class="flex-[2] px-3 py-2 w-full rounded-lg border-white mt-2 pl-1"
    />
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

.custom-height-select .search_input_trigger {
  height: 26px;
  padding: 0.6rem 0.75rem;
  font-size: 1rem;
  font-weight: 500;
}

.search__input::placeholder {
  color: #9ca3af;
}
</style>
