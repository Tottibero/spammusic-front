<template>
  <div class="main_wrapper" ref="wrapperEl">
    <!-- Contenedor que actúa como "select" -->
    <div @click="toggleSearchbox" class="search_input_trigger">
  <p :class="{
    'text-gray-400 font-normal': selectedText === 'Selecciona un género', 
    'text-gray-600 font-medium': selectedText !== 'Selecciona un género'
  }">
    {{ selectedText || "Selecciona un género" }}
  </p>
  <i class="fas fa-chevron-down"></i>
</div>

    <!-- Caja desplegable -->
    <div v-if="showSearchbox" class="searchable__select">
      <!-- Campo de búsqueda interno -->
      <div class="relative">
        <input :value="inputText" @input="onInput" @focus="onFocus" @keydown.down="onArrowDown"
          @keydown.enter.prevent="onSelectOption" @keydown.up="onArrowUp" @keydown.esc="onESC" class="search__input"
          type="text" :placeholder="placeholder" ref="searchInput" />
        <!-- Spinner si loading es true -->
        <div v-if="loading" class="absolute right-0 top-0">
          <i class="fas fa-spinner fa-spin" style="width:40px; height:40px;"></i>
        </div>
      </div>

      <!-- Lista de resultados -->
      <ul v-if="showDropdown" class="search__results">
        <li
  v-for="(option, i) in filteredOptions"
  :key="i"
  @click="onSelectOption($event, i)"
  :class="{
    'bg-gray-300 text-gray-900': option[title] === 'Todos los géneros', /* Mantiene fondo gris */
    'active': option[title] !== 'Todos los géneros' && option[trackby] === modelValue
  }"
>
  {{ getOptionTitle(option) }}
</li>
</ul>
    </div>
  </div>
</template>

<script>
import {
  reactive,
  toRefs,
  computed,
  ref,
  onMounted,
  onUnmounted,
  nextTick,
} from "vue";

export default {
  name: "SearchableSelect",
  emits: ["update:modelValue", "search"],
  props: {
    // Permitimos que sea opcional y que por defecto sea ""
    modelValue: {
      type: [String, Number],
      required: false,
      default: "",
    },
    options: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      default: "name",
    },
    trackby: {
      type: String,
      default: "id",
    },
    autoFocus: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: "",
    },
    max: {
      type: Number,
      default: 5,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const data = reactive({
      selectedText: "",
      inputText: "",
      activeIndex: 0,
      showDropdown: false,
      showSearchbox: false,
    });

    const wrapperEl = ref(null);
    const searchInput = ref(null);

    // Al montar el componente, escuchamos clics fuera y seteamos texto inicial
    onMounted(() => {
      document.addEventListener("click", handleOutsideClick);
      setInitialText();
    });
    onUnmounted(() => {
      document.removeEventListener("click", handleOutsideClick);
    });

    // Insertamos una "opción vacía" como primer elemento, siempre visible
    // Devuelve un array de opciones filtradas y con la opción "Seleccione un género" al inicio.
    const filteredOptions = computed(() => {
      // Filtra según el texto (si existe)
      let filtered = props.options.filter((opt) => {
        if (!data.inputText) {
          // Si no hay texto, mostramos todo
          return true;
        }
        const label =
          typeof opt === "object" ? opt[props.title] : String(opt);
        return label
          .toLowerCase()
          .includes(data.inputText.toLowerCase());
      });

      // Limita a 'max' (menos 1 si queremos que la opción vacía no cuente para el límite)
      filtered = filtered.slice(0, props.max - 1);

      // Opción fija como primer elemento
      const emptyOption = {
        [props.trackby]: "",
        [props.title]: "Todos los géneros",
      };

      // Unimos la opción vacía con el resto
      return [emptyOption, ...filtered];
    });



    // Si se pasa un modelValue inicial, buscar su nombre en las opciones
    function setInitialText() {
      if (!props.modelValue) {
        data.selectedText = "";
        return;
      }
      const found = props.options.find((opt) =>
        typeof opt === "object"
          ? opt[props.trackby] === props.modelValue
          : opt === props.modelValue
      );
      if (found) {
        data.selectedText =
          typeof found === "object" ? found[props.title] : String(found);
      }
    }

    function toggleSearchbox() {
      data.showSearchbox = !data.showSearchbox;
      nextTick(() => {
        if (data.showSearchbox) {
          searchInput.value.focus();
          toggleDropdown();
        }
      });
    }

    function toggleDropdown() {
      data.showDropdown = filteredOptions.value.length > 0;
    }

    function handleOutsideClick(e) {
      if (!wrapperEl.value.contains(e.target)) {
        data.showDropdown = false;
        data.showSearchbox = false;
      }
    }

    function onInput(e) {
      data.inputText = e.target.value;
      data.activeIndex = 0;
      emit("search", data.inputText);
      toggleDropdown();
    }

    function onFocus() {
      toggleDropdown();
    }

    function onArrowDown() {
      data.activeIndex++;
      if (data.activeIndex >= filteredOptions.value.length) {
        data.activeIndex = 0;
      }
    }

    function onArrowUp() {
      data.activeIndex--;
      if (data.activeIndex < 0) {
        data.activeIndex = filteredOptions.value.length - 1;
      }
    }

    function onESC() {
      data.showDropdown = false;
    }

    function onSelectOption(_, index = data.activeIndex) {
      if (!data.showDropdown) return;
      const selected = filteredOptions.value[index];

      if (typeof selected === "object") {
    // Si se selecciona "Todos los géneros", se muestra "Selecciona un género" en el select
    data.selectedText = selected[props.title] === "Todos los géneros" ? "Selecciona un género" : selected[props.title];
    emit("update:modelValue", selected[props.trackby]);
  } else {
    data.selectedText = String(selected);
    emit("update:modelValue", selected);
  }

      data.inputText = "";
      data.showDropdown = false;
      data.showSearchbox = false;
    }


    function getOptionTitle(option) {
      return typeof option === "object" ? option[props.title] : String(option);
    }

    return {
      ...toRefs(data),
      wrapperEl,
      searchInput,
      filteredOptions,
      onInput,
      onFocus,
      onArrowDown,
      onArrowUp,
      onESC,
      onSelectOption,
      getOptionTitle,
      toggleSearchbox,
    };
  },
};
</script>

<style scoped>
.main_wrapper {
  position: relative;
}

.search_input_trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.375rem;
  padding: 0.3rem 0.75rem;
  height: 28px;
  width: 100%;
  font-size: 1rem;
  background-color: #ffffff;
  color: #000000;
}

.searchable__select {
  position: absolute;
  width: 100%;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  z-index: 999;
  /* para aparecer por encima de otros elementos */
  margin-top: 0.25rem;
}

.search__input {
  width: 100%;
  padding: 0.5rem;
  border: 0;
  outline: none;
  box-sizing: border-box;
}

.search__results {
  max-height: 200px;
  /* altura máxima para el scroll */
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}

.search__results li {
  padding: 0.5rem;
  cursor: pointer;
  text-align: left;
  padding-left: 0.75rem;
}

.search__results li:hover {
  background-color: #f0f0f0;
}

.search__results li.active {
  background-color: #d9e021 !important;
  color: #1a202c !important;
  font-weight: bold;
}

.search__results li.text-gray-900 {
  color: white;
  background-color: #374151 !important; 
}
</style>