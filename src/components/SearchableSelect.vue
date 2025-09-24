<template>
  <div class="main_wrapper" ref="wrapperEl">
    <!-- Trigger -->
    <div @click="toggleSearchbox" class="search_input_trigger" ref="triggerEl">
      <p
        :class="{
          'text-gray-400 font-normal': !selectedText,
          'text-gray-600 font-medium': !!selectedText
        }"
      >
        {{ selectedText || triggerPlaceholder }}
      </p>
      <i class="fas fa-chevron-down"></i>
    </div>

    <!-- ===== Menú con TELEPORT (recomendado) ===== -->
    <teleport v-if="useTeleport" to="body">
      <div
        v-if="showSearchbox"
        class="teleport-overlay fixed inset-0"
        :style="{ zIndex: String(menuZIndex) }"
        @click.self="closeAll"
      >
        <div
          class="searchable__select absolute"
          :style="menuStyle"
          ref="menuEl"
          @keydown.esc.prevent.stop="closeAll"
        >
          <!-- Campo de búsqueda -->
          <div class="relative">
            <input
              :value="inputText"
              @input="onInput"
              @focus="onFocus"
              @keydown.down.prevent="onArrowDown"
              @keydown.enter.prevent="onSelectOption"
              @keydown.up.prevent="onArrowUp"
              class="search__input"
              type="text"
              :placeholder="placeholder"
              ref="searchInput"
            />
            <div v-if="loading" class="absolute right-0 top-0">
              <i class="fas fa-spinner fa-spin" style="width:40px; height:40px;"></i>
            </div>
          </div>

          <!-- Lista -->
          <ul v-if="showDropdown" class="search__results" ref="dropdownList">
            <li
              v-for="(option, i) in filteredOptions"
              :key="i"
              @click="onSelectOption($event, i)"
              ref="optionRefs"
              :class="{
                'bg-gray-300 text-gray-900': option[title] === allLabel,
                'active':
                  option[title] !== allLabel && option[trackby] === modelValue
              }"
            >
              {{ getOptionTitle(option) }}
            </li>
          </ul>
        </div>
      </div>
    </teleport>

    <!-- ===== Fallback SIN teleport (por si se desactiva) ===== -->
    <div
      v-else
      v-show="showSearchbox"
      class="searchable__select"
      :style="{ zIndex: String(menuZIndex) }"
      ref="menuEl"
    >
      <div class="relative">
        <input
          :value="inputText"
          @input="onInput"
          @focus="onFocus"
          @keydown.down.prevent="onArrowDown"
          @keydown.enter.prevent="onSelectOption"
          @keydown.up.prevent="onArrowUp"
          @keydown.esc.prevent="closeAll"
          class="search__input"
          type="text"
          :placeholder="placeholder"
          ref="searchInput"
        />
        <div v-if="loading" class="absolute right-0 top-0">
          <i class="fas fa-spinner fa-spin" style="width:40px; height:40px;"></i>
        </div>
      </div>

      <ul v-if="showDropdown" class="search__results" ref="dropdownList">
        <li
          v-for="(option, i) in filteredOptions"
          :key="i"
          @click="onSelectOption($event, i)"
          ref="optionRefs"
          :class="{
            'bg-gray-300 text-gray-900': option[title] === allLabel,
            'active':
              option[title] !== allLabel && option[trackby] === modelValue
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
    modelValue: { type: [String, Number], required: false, default: "" },
    options: { type: Array, required: true },
    title: { type: String, default: "name" },
    trackby: { type: String, default: "id" },
    placeholder: { type: String, default: "" },
    triggerPlaceholder: { type: String, default: "Selecciona un género" },
    allLabel: { type: String, default: "Todos los géneros" },
    max: { type: Number, default: 5 },

    /* NUEVO: control del teleport / z-index / separación */
    useTeleport: { type: Boolean, default: true },
    menuZIndex: { type: [Number, String], default: 100000 },
    gap: { type: Number, default: 4 },

    /* Opcional: spinner externo */
    loading: { type: Boolean, default: false },
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
    const triggerEl = ref(null);
    const menuEl = ref(null);
    const searchInput = ref(null);
    const dropdownList = ref(null);
    const optionRefs = ref([]);

    const menuStyle = ref({
      left: "0px",
      top: "0px",
      minWidth: "0px",
      width: "auto",
    });

    /* Filtrado + "Todos los géneros" fijo arriba */
    const filteredOptions = computed(() => {
      let filtered = props.options.filter((opt) => {
        if (!data.inputText) return true;
        const label = typeof opt === "object" ? opt[props.title] : String(opt);
        return label.toLowerCase().includes(data.inputText.toLowerCase());
      });

      if (props.max && props.max < filtered.length) {
        filtered = filtered.slice(0, props.max);
      }

      const allOption = { [props.trackby]: "", [props.title]: props.allLabel };
      return [allOption, ...filtered];
    });

    /* Texto inicial según modelValue */
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
      if (found)
        data.selectedText =
          typeof found === "object" ? found[props.title] : String(found);
    }

    /* Posicionar el menú bajo el trigger (coordenadas viewport) */
    function positionMenu() {
      const t = triggerEl.value;
      if (!t) return;
      const r = t.getBoundingClientRect();
      menuStyle.value = {
        left: `${r.left}px`,
        top: `${r.bottom + props.gap}px`,
        minWidth: `${r.width}px`,
        width: `${r.width}px`,
      };
    }

    function toggleSearchbox() {
      data.showSearchbox = !data.showSearchbox;
      nextTick(() => {
        if (data.showSearchbox) {
          positionMenu();
          searchInput.value && searchInput.value.focus();
          toggleDropdown();
        }
      });
    }

    function toggleDropdown() {
      data.showDropdown = filteredOptions.value.length > 0;
    }

    function closeAll() {
      data.showDropdown = false;
      data.showSearchbox = false;
    }

    function handleOutsideClick(e) {
      // Sólo útil cuando NO usamos teleport
      if (!props.useTeleport && wrapperEl.value && !wrapperEl.value.contains(e.target)) {
        closeAll();
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
      data.activeIndex =
        (data.activeIndex + 1) % filteredOptions.value.length;
      ensureActiveVisible();
    }

    function onArrowUp() {
      data.activeIndex =
        (data.activeIndex - 1 + filteredOptions.value.length) %
        filteredOptions.value.length;
      ensureActiveVisible();
    }

    function onSelectOption(_, index = data.activeIndex) {
      if (!data.showDropdown) return;
      const selected = filteredOptions.value[index];

      if (typeof selected === "object") {
        const isAll = selected[props.title] === props.allLabel;
        data.selectedText = isAll ? "" : selected[props.title];
        emit("update:modelValue", selected[props.trackby]); // "" si es “Todos…”
      } else {
        data.selectedText = String(selected);
        emit("update:modelValue", selected);
      }

      data.inputText = "";
      closeAll();
      nextTick(() => scrollToSelectedOption(index));
    }

    function scrollToSelectedOption() {
      nextTick(() => {
        const selectedIndex = filteredOptions.value.findIndex(
          (opt) => opt[props.trackby] === props.modelValue
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

    function ensureActiveVisible() {
      nextTick(() => {
        const el = optionRefs.value[data.activeIndex];
        if (!el || !dropdownList.value) return;
        const list = dropdownList.value;
        const elTop = el.offsetTop;
        const elBottom = elTop + el.offsetHeight;
        if (elTop < list.scrollTop) list.scrollTop = elTop;
        else if (elBottom > list.scrollTop + list.clientHeight)
          list.scrollTop = elBottom - list.clientHeight;
      });
    }

    function getOptionTitle(option) {
      return typeof option === "object" ? option[props.title] : String(option);
    }

    /* Listeners de ventana para reposicionar mientras está abierto */
    function onWindowMove() {
      if (data.showSearchbox) positionMenu();
    }

    onMounted(() => {
      document.addEventListener("click", handleOutsideClick);
      window.addEventListener("resize", onWindowMove);
      window.addEventListener("scroll", onWindowMove, true);
      setInitialText();
    });

    onUnmounted(() => {
      document.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("resize", onWindowMove);
      window.removeEventListener("scroll", onWindowMove, true);
    });

    /* Reposiciona cuando se abre/cambia el valor */
    watch(
      () => data.showSearchbox,
      (v) => v && nextTick(positionMenu)
    );
    watch(
      () => props.modelValue,
      () => setInitialText()
    );

    return {
      ...toRefs(data),
      wrapperEl,
      triggerEl,
      menuEl,
      searchInput,
      dropdownList,
      optionRefs,
      filteredOptions,
      getOptionTitle,
      onInput,
      onFocus,
      onArrowDown,
      onArrowUp,
      onSelectOption,
      toggleSearchbox,
      closeAll,
      menuStyle,
    };
  },
};
</script>

<style scoped>
.main_wrapper {
  position: relative;
}

/* Trigger */
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
  cursor: pointer;
}

/* Panel del menú (se posiciona via inline style) */
.searchable__select {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  margin-top: 0.25rem;
  /* Cuando va SIN teleport, es absolute relativo al wrapper */
  position: absolute;
  width: 100%;
}

/* Input */
.search__input {
  width: 100%;
  padding: 0.5rem;
  border: 0;
  outline: none;
  box-sizing: border-box;
}

/* Lista */
.search__results {
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}

.search__results li {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  text-align: left;
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
