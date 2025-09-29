<template>
  <!-- OJO: le pasamos los attrs (class, etc.) al wrapper -->
  <div class="ss-wrapper" ref="wrap" v-bind="attrs">
    <!-- TRIGGER con el mismo layout que SearchableSelect -->
    <button
      type="button"
      class="ss-trigger"
      @click="toggle"
      ref="trigger"
    >
      <span
        class="ss-text"
        :class="{
          'text-gray-400 font-normal': isPlaceholder,
          'text-gray-600 font-medium': !isPlaceholder
        }"
      >
        {{ currentLabel }}
      </span>
      <i class="fas fa-chevron-down ss-icon"></i>
    </button>

    <!-- DROPDOWN -->
    <div
      v-if="open"
      class="ss-menu"
      ref="menu"
      :style="menuStyle"
      @keydown.esc.prevent.stop="close"
    >
      <div v-if="groupLabel" class="ss-group">{{ groupLabel }}</div>
      <ul class="ss-list" ref="list">
        <li
          v-for="opt in options"
          :key="opt.value"
          :class="['ss-item', { active: opt.value === internalValue }]"
          @click="select(opt.value)"
        >
          {{ opt.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed, nextTick, useAttrs } from 'vue';

type Opt = { value: string | number; label: string };

defineOptions({ inheritAttrs: false });           // importante para reenviar class/attrs
const attrs = useAttrs();

const props = defineProps<{
  modelValue: string | number | null;
  options: Opt[];
  placeholder?: string;
  groupLabel?: string;
}>();
const emit = defineEmits<{ (e: 'update:modelValue', v: string | number | null): void }>();

const open = ref(false);
const internalValue = ref<string | number | null>(props.modelValue ?? null);
watch(() => props.modelValue, v => (internalValue.value = v));

const isPlaceholder = computed(() =>
  internalValue.value === null || internalValue.value === undefined || internalValue.value === ''
);
const currentLabel = computed(() => {
  const found = props.options.find(o => o.value === internalValue.value);
  return found ? found.label : (props.placeholder ?? '');
});

const wrap = ref<HTMLElement | null>(null);
const trigger = ref<HTMLElement | null>(null);
const menu   = ref<HTMLElement | null>(null);
const menuStyle = ref<Record<string, string>>({});

function positionMenu() {
  const r = trigger.value?.getBoundingClientRect();
  if (!r) return;
  menuStyle.value = {
    position: 'fixed',
    left: `${r.left}px`,
    top: `${r.bottom + 6}px`,
    width: `${r.width}px`
  };
}
function toggle() { open.value = !open.value; if (open.value) nextTick(positionMenu); }
function close()  { open.value = false; }
function onWindowMove() { if (open.value) positionMenu(); }
function onOutside(e: MouseEvent) {
  if (!open.value) return;
  const els = [wrap.value, menu.value];
  if (!els.some(el => el && el.contains(e.target as Node))) close();
}
function select(v: string | number) {
  emit('update:modelValue', v);
  internalValue.value = v;
  close();
}

onMounted(() => {
  window.addEventListener('resize', onWindowMove);
  window.addEventListener('scroll', onWindowMove, true);
  document.addEventListener('click', onOutside, true);
});
onUnmounted(() => {
  window.removeEventListener('resize', onWindowMove);
  window.removeEventListener('scroll', onWindowMove, true);
  document.removeEventListener('click', onOutside, true);
});
</script>

<style scoped>
.ss-wrapper { position: relative; }

/* === Trigger: igual que SearchableSelect (texto izq + chevron der) === */
.ss-trigger {
  width: 100%;
  height: 2.25rem;                           /* ajusta a tu --pill-h si quieres */
  line-height: 2.5rem;
  border-radius: 9999px;
  border: 1px solid rgb(229 231 235);
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06);
  padding: 0 1.5rem;                      
  padding-right: .75rem;  
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer;
  outline: none;
}
.ss-trigger:focus { outline: 2px solid rgba(209,213,219,.8); }

.ss-text {
  flex: 1 1 auto;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  text-align: left;                        
}

/* chevron igual al de SearchableSelect (icono simple a la derecha) */
.ss-icon {
  margin-left: .5rem;
  margin-right: .25rem;
  color: #000000;
  font-size: .975rem;
  flex: 0 0 auto;
}

/* Dropdown */
.ss-menu {
  z-index: 100000;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: .5rem;
  overflow: hidden;
}
.ss-group {
  padding: .5rem .75rem;
  font-size: .875rem;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
.ss-list { max-height: 240px; overflow: auto; margin: 0; padding: 0; list-style: none; }
.ss-item { padding: .5rem .75rem; cursor: pointer; color: #111827; }
.ss-item:hover { background: #f3f4f6; }

/* Seleccionado -> mismo amarillo verdoso que SearchableSelect */
.ss-item.active {
  background-color: #d9e021 !important;
  color: #1a202c !important;
  font-weight: 700;
}

/* Dropdown */
.ss-menu { text-align: left; }              /* por si hereda centrado */
.ss-group { text-align: left; }             /* cabecera del grupo */
.ss-list  { text-align: left; }
.ss-item  { 
  display: block; 
  width: 100%; 
  text-align: left; 
}

</style>
