<template>
  <div class="main_wrapper" ref="wrapperEl">
    <!-- Contenedor que actúa como "select" -->
    <div @click="toggleSearchbox" class="search_input_trigger">
      <p :class="{
        'text-gray-400 font-normal': selectedText === placeholder,
        'text-gray-600 font-medium': selectedText !== placeholder
      }">
        {{ selectedText || placeholder }}
      </p>
      <i class="fas fa-chevron-down"></i>
    </div>

    <!-- Caja desplegable -->
    <div v-if="showSearchbox" class="searchable__select">
      <!-- Campo de búsqueda interno -->
      <div class="relative">
        <input
          :value="inputText"
          @input="onInput"
          @focus="onFocus"
          @keydown.down="onArrowDown"
          @keydown.enter.prevent="onSelectOption"
          @keydown.up="onArrowUp"
          @keydown.esc="onESC"
          class="search__input"
          type="text"
          :placeholder="placeholder"
          ref="searchInput"
        />
        <!-- Spinner si loading es true -->
        <div v-if="loading" class="absolute right-0 top-0">
          <i class="fas fa-spinner fa-spin" style="width:40px; height:40px;"></i>
        </div>
      </div>

      <!-- Lista de resultados -->
      <ul v-if="showDropdown" class="search__results" ref="dropdownList">
        <li
          v-for="(option, i) in filteredOptions"
          :key="i"
          @click="onSelectOption($event, i)"
          ref="optionRefs"
          :class="{
            'bg-gray-300 text-gray-900': isAllOption(option),
            'active': !isAllOption(option) && getTrack(option) === modelValue
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
  watch,
} from "vue";

export default {
  name: "SearchableSelect",
  emits: ["update:modelValue", "search"],
  props: {
    modelValue: { type: [String, Number, null], default: "" },
    options: { type: Array, default: () => [] }, // ✅ seguro por defecto
    title: { type: String, default: "name" },
    trackby: { type: String, default: "id" },
    placeholder: { type: String, default: "Selecciona una opción" }, // ✅ configurable
    max: { type: Number, default: 5 },
    loading: { type: Boolean, default: false }, // ✅ ya lo usabas en el template
    includeAllOption: { type: Boolean, default: true }, // ✅ para “Todos …”
    allLabel: { type: String, default: "Todos" }, // ✅ texto de la opción global
  },
  setup(props, { emit }) {
    const data = reactive({
      selectedText: props.placeholder, // ✅ inicia con placeholder
      inputText: "",
      activeIndex: 0,
      showDropdown: false,
      showSearchbox: false,
    });

    const wrapperEl = ref(null);
    const searchInput = ref(null);
    const dropdownList = ref(null);
    const optionRefs = ref([]);

    const safeOptions = computed(() => Array.isArray(props.options) ? props.options : []);

    // Texto de la opción "todos"
    const allText = computed(() => props.allLabel);

    // Construye la opción “todos” con las claves que espera el componente
    const allOption = computed(() => ({
      [props.trackby]: "",
      [props.title]: allText.value,
      __all__: true,
    }));

    const isAllOption = (opt) => typeof opt === "object" && opt.__all__ === true;

    // Filtrado
    const filteredOptions = computed(() => {
      let filtered = safeOptions.value.filter((opt) => {
        if (!data.inputText) return true;
        const label =
          typeof opt === "object" ? opt[props.title] : String(opt ?? "");
        return label.toLowerCase().includes(data.inputText.toLowerCase());
      });

      if (props.max && props.max < filtered.length) {
        filtered = filtered.slice(0, props.max);
      }

      return props.includeAllOption ? [allOption.value, ...filtered] : filtered;
    });

    // Track y título seguros
    const getTrack = (opt) =>
      typeof opt === "object" ? opt?.[props.trackby] : opt;

    const getOptionTitle = (option) =>
      typeof option === "object" ? option?.[props.title] : String(option ?? "");

    // Si se pasa un modelValue inicial o cambian las options, setea el texto
    const setInitialText = () => {
      if (!props.modelValue) {
        data.selectedText = props.placeholder;
        return;
      }
      const found = safeOptions.value.find((opt) =>
        typeof opt === "object"
          ? opt?.[props.trackby] === props.modelValue
          : opt === props.modelValue
      );
      data.selectedText = found ? getOptionTitle(found) : props.placeholder;
    };

    onMounted(() => {
      document.addEventListener("click", handleOutsideClick);
      setInitialText();
    });
    onUnmounted(() => {
      document.removeEventListener("click", handleOutsideClick);
    });

    watch(
      () => [props.modelValue, safeOptions.value],
      () => setInitialText(),
      { deep: false }
    );

    function toggleSearchbox() {
      data.showSearchbox = !data.showSearchbox;
      nextTick(() => {
        if (data.showSearchbox && searchInput.value) {
          searchInput.value.focus();
          scrollToSelectedOption();
          toggleDropdown();
        }
      });
    }

    function toggleDropdown() {
      data.showDropdown = filteredOptions.value.length > 0;
    }

    function handleOutsideClick(e) {
      if (!wrapperEl.value || !wrapperEl.value.contains(e.target)) {
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
      if (!filteredOptions.value.length) return;
      data.activeIndex = (data.activeIndex + 1) % filteredOptions.value.length;
    }

    function onArrowUp() {
      if (!filteredOptions.value.length) return;
      data.activeIndex =
        (data.activeIndex - 1 + filteredOptions.value.length) %
        filteredOptions.value.length;
    }

    function onESC() {
      data.showDropdown = false;
    }

    function onSelectOption(_, index = data.activeIndex) {
      if (!data.showDropdown || !filteredOptions.value.length) return;

      const selected = filteredOptions.value[index];

      if (isAllOption(selected)) {
        data.selectedText = props.placeholder; // al elegir “Todos…”
        emit("update:modelValue", "");
      } else if (typeof selected === "object") {
        data.selectedText = getOptionTitle(selected);
        emit("update:modelValue", getTrack(selected));
      } else {
        data.selectedText = String(selected);
        emit("update:modelValue", selected);
      }

      data.inputText = "";
      data.showDropdown = false;
      data.showSearchbox = false;

      nextTick(() => {
        scrollToSelectedOption(index);
      });
    }

    function scrollToSelectedOption() {
      nextTick(() => {
        const selectedIndex = filteredOptions.value.findIndex(
          (opt) => !isAllOption(opt) && getTrack(opt) === props.modelValue
        );
        if (dropdownList.value && selectedIndex !== -1) {
          const el = optionRefs.value[selectedIndex];
          if (el) {
            dropdownList.value.scrollTop =
              el.offsetTop - dropdownList.value.offsetTop;
          }
        }
      });
    }

    return {
      ...toRefs(data),
      wrapperEl,
      searchInput,
      dropdownList,
      optionRefs,
      filteredOptions,
      onInput,
      onFocus,
      onArrowDown,
      onArrowUp,
      onESC,
      onSelectOption,
      getOptionTitle,
      toggleSearchbox,
      scrollToSelectedOption,
      isAllOption,
      placeholder: props.placeholder,
      loading: props.loading,
    };
  },
};
</script>

<style scoped>
.main_wrapper { position: relative; }
.search_input_trigger {
  display: flex; align-items: center; justify-content: space-between;
  border-radius: 0.375rem; padding: 0.3rem 0.75rem; height: 28px; width: 100%;
  font-size: 1rem; background-color: #ffffff; color: #000000;
}
.searchable__select {
  position: absolute; width: 100%; background-color: white; border: 1px solid #ccc;
  border-radius: 0.25rem; z-index: 999; margin-top: 0.25rem;
}
.search__input { width: 100%; padding: 0.5rem; border: 0; outline: none; box-sizing: border-box; }
.search__results { max-height: 200px; overflow-y: auto; margin: 0; padding: 0; list-style: none; }
.search__results li { padding: 0.5rem; cursor: pointer; text-align: left; padding-left: 0.75rem; }
.search__results li:hover { background-color: #f0f0f0; }
.search__results li.active { background-color: #d9e021 !important; color: #1a202c !important; font-weight: bold; }
.search__results li.text-gray-900 { color: white; background-color: #374151 !important; }
</style>
