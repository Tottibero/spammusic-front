<!-- src/components/SpotifyList.vue -->
<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold">Listas de Spotify</h1>
      <button class="rounded-xl px-4 py-2 bg-black text-white hover:bg-black/90 transition" @click="openCreate()">
        Nueva lista
      </button>
    </div>

    <!-- Filtros -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div class="col-span-1">
        <label class="block text-sm font-medium mb-1">Buscar</label>
        <input v-model="filters.q" type="text" placeholder="Nombre..."
          class="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/40" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Estado</label>
        <select v-model="filters.estado"
          class="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/40">
          <option value="">Todos</option>
          <option v-for="e in ESTADOS" :key="e" :value="e">{{ e }}</option>
        </select>
      </div>
      <div v-if="!fixedType">
        <label class="block text-sm font-medium mb-1">Tipo</label>
        <select v-model="filters.tipo"
          class="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/40">
          <option value="">Todos</option>
          <option v-for="t in TIPOS" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      <div class="flex items-end">
        <button class="w-full rounded-xl px-4 py-2 border hover:bg-black/5 transition" @click="resetFilters()">
          Limpiar
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto rounded-2xl border">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left">
            <th class="px-4 py-3">Nombre</th>
            <th class="px-4 py-3">Estado</th>
            <th v-if="!fixedType" class="px-4 py-3">Tipo</th>
            <th class="px-4 py-3">Enlace</th>
            <th class="px-4 py-3">Actualizada</th>
            <th class="px-4 py-3 w-40 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-6 text-center text-gray-500">Cargando…</td>
          </tr>
          <tr v-else-if="rows.length === 0">
            <td colspan="6" class="px-4 py-6 text-center text-gray-500">Sin resultados</td>
          </tr>
          <tr v-for="r in rows" :key="r.id" class="border-t hover:bg-gray-50/50">
            <td class="px-4 py-3 font-medium">{{ r.name }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1"
                :class="pillClass(r.status)">
                {{ displayEstado(r.status) }}
              </span>
            </td>
            <td v-if="!fixedType" class="px-4 py-3">{{ r.type }}</td>
            <td class="px-4 py-3">
              <a :href="r.link" target="_blank" rel="noopener"
                class="underline underline-offset-2 text-blue-600 hover:text-blue-700">Abrir</a>
            </td>
            <td class="px-4 py-3">
              {{ fmtDate(r.updateDate) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <button class="rounded-lg px-3 py-1 border hover:bg-gray-100" @click="goToDetail(r.id)">
                  Ver
                </button>
                <button class="rounded-lg px-3 py-1 border hover:bg-gray-100" @click="openEdit(r)">
                  Editar
                </button>
                <button class="rounded-lg px-3 py-1 bg-red-600 text-white hover:bg-red-700" @click="openDelete(r)">
                  Borrar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-600">
        {{ rows.length ? `Mostrando ${rows.length} resultados` : '' }}
      </div>
      <div class="flex items-center gap-2">
        <button class="rounded-xl px-3 py-2 border disabled:opacity-40" :disabled="page === 0 || loading"
          @click="prevPage()">
          Anterior
        </button>
        <button class="rounded-xl px-3 py-2 border disabled:opacity-40" :disabled="!canNext || loading"
          @click="nextPage()">
          Siguiente
        </button>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <div v-if="showForm" class="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
      @click.self="closeForm()">
      <div class="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl space-y-5">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">
            {{ editing ? 'Editar lista' : 'Nueva lista' }}
          </h2>
          <button class="p-2 rounded-lg hover:bg-gray-100" @click="closeForm()">✕</button>
        </div>

        <form class="space-y-4" @submit.prevent="submitForm()">
          <div>
            <label class="block text-sm font-medium mb-1">Nombre</label>
            <input v-model="form.nombre" type="text"
              class="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/40" required />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Estado</label>
              <select v-model="form.estado"
                class="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/40" required>
                <option disabled value="">Selecciona…</option>
                <option v-for="e in ESTADOS" :key="e" :value="e">{{ e }}</option>
              </select>
            </div>
            <div v-if="!fixedType">
              <label class="block text-sm font-medium mb-1">Tipo</label>
              <select v-model="form.tipo"
                class="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/40" required>
                <option disabled value="">Selecciona…</option>
                <option v-for="t in TIPOS" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Enlace</label>
            <input v-model="form.enlace" type="url" placeholder="https://open.spotify.com/playlist/..."
              class="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/40" required />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Fecha de actualización</label>
            <input v-model="form.fechaActualizacionLocal" type="datetime-local"
              class="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/40" required />
            <p class="text-xs text-gray-500 mt-1">
              Se enviará como ISO (UTC): {{ toISOFromLocal(form.fechaActualizacionLocal) || '—' }}
            </p>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="rounded-xl px-4 py-2 border hover:bg-gray-100"
              @click="closeForm()">Cancelar</button>
            <button type="submit" class="rounded-xl px-4 py-2 bg-black text-white hover:bg-black/90"
              :disabled="submitting">
              {{ submitting ? 'Guardando…' : (editing ? 'Guardar cambios' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Delete -->
    <div v-if="showDelete" class="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
      @click.self="closeDelete()">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <h3 class="text-lg font-semibold">Eliminar lista</h3>
        <p class="text-sm text-gray-600">
          ¿Seguro que quieres borrar <span class="font-semibold">{{ toDelete?.name }}</span>? Esta acción no se puede
          deshacer.
        </p>
        <div class="flex items-center justify-end gap-2">
          <button class="rounded-xl px-4 py-2 border hover:bg-gray-100" @click="closeDelete()">Cancelar</button>
          <button class="rounded-xl px-4 py-2 bg-red-600 text-white hover:bg-red-700" :disabled="deleting"
            @click="confirmDelete()">
            {{ deleting ? 'Eliminando…' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast.show" class="fixed bottom-4 right-4 z-50 rounded-xl bg-black text-white px-4 py-2 shadow-lg">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  listSpotify,
  getSpotifyFestivals,
  getSpotifyGenres,
  createSpotify,
  updateSpotify,
  removeSpotify,
  SPOTIFY_ESTADOS as ESTADOS,
  SPOTIFY_TIPOS as TIPOS,
  type Spotify,
  type SpotifyEstado,
  type SpotifyTipo,
} from '@services/spotify/spotify';

// ---------- Estado UI ----------
const loading = ref(false);
const rows = ref<Spotify[]>([]);
const limit = ref(10);
const page = ref(0);
const canNext = ref(false);

const router = useRouter();

const props = defineProps<{
  fixedType?: 'festival' | 'genero' | string;
}>();

// filtros
const filters = reactive<{
  q: string;
  estado: '' | SpotifyEstado;
  tipo: '' | SpotifyTipo;
}>({
  q: '',
  estado: '',
  tipo: '',
});

// form
type FormShape = {
  id?: string;
  nombre: string;
  estado: '' | SpotifyEstado;
  tipo: '' | SpotifyTipo;
  enlace: string;
  fechaActualizacionLocal: string; // "YYYY-MM-DDTHH:mm"
};
const initialForm = (): FormShape => ({
  nombre: '',
  estado: '',
  tipo: (props.fixedType as SpotifyTipo) || '',
  enlace: '',
  fechaActualizacionLocal: nowLocalInput(),
});
const form = reactive<FormShape>(initialForm());

const showForm = ref(false);
const editing = ref(false);
const submitting = ref(false);

const showDelete = ref(false);
const toDelete = ref<Spotify | null>(null);
const deleting = ref(false);

// toast
const toast = reactive({ show: false, message: '' });
function showToast(msg: string) {
  toast.message = msg;
  toast.show = true;
  setTimeout(() => (toast.show = false), 2200);
}

// ---------- Helpers de fechas ----------
function nowLocalInput(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

function toISOFromLocal(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
}

function toLocalInputFromISO(iso: string): string {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString();
}

// ---------- Debounce ----------
function debounce<T extends (...args: any[]) => void>(fn: T, delay = 350) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
const debouncedReload = debounce(() => {
  page.value = 0;
  reload();
}, 350);

// ---------- Carga ----------
async function reload() {
  loading.value = true;
  try {
    let data;
    if (props.fixedType === 'festival') {
      data = await getSpotifyFestivals();
    } else if (props.fixedType === 'genero') {
      data = await getSpotifyGenres();
    } else {
      data = await listSpotify({
        limit: limit.value,
        offset: page.value * limit.value,
        q: filters.q || undefined,
        estado: (filters.estado as SpotifyEstado) || undefined,
        tipo: (filters.tipo as SpotifyTipo) || undefined,
      } as any);
    }
    rows.value = data;
    canNext.value = data.length === limit.value;
  } catch (e: any) {
    console.error(e);
    showToast(e?.response?.data?.message || 'Error cargando listas');
  } finally {
    loading.value = false;
  }
}
function resetFilters() {
  filters.q = '';
  filters.estado = '';
  filters.tipo = '';
  page.value = 0;
  reload();
}
function nextPage() {
  page.value++;
  reload();
}
function prevPage() {
  page.value = Math.max(0, page.value - 1);
  reload();
}

// ---------- Crear / Editar ----------
function openCreate() {
  Object.assign(form, initialForm());
  editing.value = false;
  showForm.value = true;
}

function openEdit(r: Spotify) {
  Object.assign(form, {
    id: r.id,
    nombre: r.name,
    estado: r.status,
    tipo: r.type,
    enlace: r.link,
    fechaActualizacionLocal: toLocalInputFromISO(r.updateDate),
  });
  editing.value = true;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
}

async function submitForm() {
  if (!form.nombre || !form.estado || !form.tipo || !form.enlace || !form.fechaActualizacionLocal) {
    showToast('Completa todos los campos');
    return;
  }
  submitting.value = true;
  try {
    const payload = {
      name: form.nombre.trim(),
      status: form.estado as SpotifyEstado,
      type: form.tipo as SpotifyTipo,
      link: form.enlace.trim(),
      updateDate: toISOFromLocal(form.fechaActualizacionLocal)!,
    };

    if (editing.value && form.id) {
      const updated = await updateSpotify(form.id, payload);
      const idx = rows.value.findIndex((r) => r.id === updated.id);
      if (idx >= 0) rows.value[idx] = updated;
      showToast('Lista actualizada');
    } else {
      const created = await createSpotify(payload);
      rows.value.unshift(created);
      rows.value = rows.value.slice(0, limit.value);
      showToast('Lista creada');
    }
    closeForm();
  } catch (e: any) {
    console.error(e);
    showToast(e?.response?.data?.message || 'Error guardando');
  } finally {
    submitting.value = false;
  }
}

// ---------- Borrar ----------
function openDelete(r: Spotify) {
  toDelete.value = r;
  showDelete.value = true;
}
function closeDelete() {
  showDelete.value = false;
  toDelete.value = null;
}
async function confirmDelete() {
  if (!toDelete.value) return;
  deleting.value = true;
  try {
    await removeSpotify(toDelete.value.id);
    rows.value = rows.value.filter((x) => x.id !== toDelete.value!.id);
    showToast('Lista eliminada');
    closeDelete();
  } catch (e: any) {
    console.error(e);
    showToast(e?.response?.data?.message || 'Error eliminando');
  } finally {
    deleting.value = false;
  }
}

// ---------- Pills ----------
function pillClass(estado: SpotifyEstado) {
  switch (estado) {
    case 'por_actualizar':
      return 'bg-red-50 text-red-700 ring-red-200';
    case 'para_publicar':
      return 'bg-orange-50 text-orange-700 ring-orange-200';
    case 'en_desarrollo':
      return 'bg-blue-50 text-blue-700 ring-blue-200';
    case 'actualizada':
    case 'publicada':
      return 'bg-green-50 text-green-700 ring-green-200';
    default:
      return 'bg-gray-50 text-gray-700 ring-gray-200';
  }
}
function displayEstado(e: SpotifyEstado) {
  return e.replace('_', ' ');
}

// ---------- Watchers automáticos ----------
onMounted(reload);
watch(() => limit.value, () => {
  page.value = 0;
  reload();
});
watch(() => filters.q, () => debouncedReload());
watch([() => filters.estado, () => filters.tipo], () => {
  page.value = 0;
  reload();
});
watch(() => props.fixedType, () => {
  page.value = 0;
  // Si cambia el tipo fijo, reseteamos el filtro de tipo (interno) y recargamos
  filters.tipo = '';
  reload();
});

function goToDetail(id: string) {
  router.push({ name: 'SpotifyDetail', params: { id } });
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
