<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Tablero (versión en preparación)</h1>
      <div class="flex gap-2">
        <button @click="goBack" class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
          ← Volver
        </button>
        <button @click="reload" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Recargar
        </button>
      </div>
    </div>

    <!-- Si no hay draft -->
    <div v-if="!version" class="p-4 border rounded bg-yellow-50 text-yellow-800">
      No hay ninguna versión en preparación (sin <code>publishedAt</code>). Crea una versión nueva desde
      <router-link class="underline" :to="{ name: 'versions-admin' }">Gestión de versiones</router-link>.
    </div>

    <!-- Formulario de la versión -->
    <div v-else class="p-4 border rounded bg-gray-50 space-y-3">
      <h2 class="text-lg font-semibold">Editar versión</h2>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <label class="text-sm">
          Versión
          <input v-model="form.version" class="w-full p-2 border rounded" placeholder="1.2.3" />
        </label>
        <label class="text-sm">
          Release date
          <input type="date" v-model="form.releaseDate" class="w-full p-2 border rounded" />
        </label>
        <label class="text-sm">
          Published at
          <input type="datetime-local" v-model="form.publishedAt" class="w-full p-2 border rounded" />
        </label>
        <label class="text-sm flex items-center gap-2">
          <input type="checkbox" v-model="form.isActive" />
          Activa
        </label>
        <div class="flex items-end">
          <button @click="saveVersion" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Guardar versión
          </button>
        </div>
      </div>
      <label class="text-sm block">
        Notas
        <textarea v-model="form.notes" rows="3" class="w-full p-2 border rounded" placeholder="Notas de la versión"></textarea>
      </label>
    </div>

    <!-- Kanban -->
    <div v-if="version" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div
        v-for="state in devStates"
        :key="state"
        class="rounded border"
        :class="dragOverState === state ? 'border-purple-500 ring-2 ring-purple-300' : 'border-gray-300'"
        @dragover.prevent="onDragOver(state)"
        @dragleave="onDragLeave(state)"
        @drop="onDrop(state)"
      >
        <!-- Cabecera columna -->
        <div class="p-3 bg-gray-100 border-b border-gray-300 flex items-center justify-between">
          <h3 class="font-semibold capitalize">{{ labels[state] }}</h3>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">{{ itemsByState(state).length }}</span>
            <button
              @click="toggleNewItemForm(state)"
              class="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            >
              {{ showNewItemForm[state] ? '✖ Cancelar' : '➕ Añadir item' }}
            </button>
          </div>
        </div>

        <!-- Form nuevo item (solo si se abre con el botón) -->
        <div v-if="showNewItemForm[state]" class="p-3 bg-gray-50 border-b border-gray-200">
          <div class="grid grid-cols-1 gap-2">
            <select v-model="newItem[state].type" class="p-2 border rounded">
              <option v-for="t in changeTypes" :key="t" :value="t">{{ t }}</option>
            </select>
            <input v-model="newItem[state].description" class="p-2 border rounded" placeholder="Descripción" />
            <!-- NUEVO: branch -->
            <input v-model="newItem[state].branch" class="p-2 border rounded font-mono" placeholder="Nombre de la branch (obligatorio)" />
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" v-model="newItem[state].publicVisible" />
                Público
              </label>
              <button
                @click="createItem(state)"
                class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>

        <!-- Lista items -->
        <div class="p-3 space-y-3 min-h-[120px]">
          <div
            v-for="it in itemsByState(state)"
            :key="it.id"
            class="bg-white border border-gray-200 rounded p-3 shadow-sm cursor-move"
            draggable="true"
            @dragstart="onDragStart(it, state)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="text-sm">
                <!-- Type pill / editor -->
                <span v-if="!editing[it.id]" class="inline-block px-2 py-0.5 rounded bg-gray-800 text-white text-xs mr-2">
                  {{ it.type }}
                </span>
                <select
                  v-else
                  v-model="editCache[it.id].type"
                  class="p-1 border rounded text-xs mr-2"
                >
                  <option v-for="t in changeTypes" :key="t" :value="t">{{ t }}</option>
                </select>

                <!-- Description -->
                <span v-if="!editing[it.id]">{{ it.description }}</span>
                <input
                  v-else
                  v-model="editCache[it.id].description"
                  class="w-full p-1 border rounded text-sm"
                />

                <div class="text-xs text-gray-500 mt-1" v-if="it.scope">scope: {{ it.scope }}</div>
                <div class="text-xs text-gray-500 mt-1">estado: {{ it.state }}</div>

                <!-- NUEVO: Branch (lectura/edición) -->
                <div class="text-xs text-gray-700 mt-1 flex items-center gap-1">
                  <template v-if="!editing[it.id]">
                    <i class="fa-solid fa-code-branch"></i>
                    <span class="font-mono">branch: {{ (it as any).branch }}</span>
                  </template>
                  <template v-else>
                    <i class="fa-solid fa-code-branch"></i>
                    <input
                      v-model="editCache[it.id].branch"
                      class="p-1 border rounded text-xs font-mono"
                      placeholder="branch"
                    />
                  </template>
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <button
                  v-if="!editing[it.id]"
                  @click="startEdit(it)"
                  class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                >
                  ✏️ Editar
                </button>
                <div v-else class="flex gap-1">
                  <button
                    @click="saveEdit(it)"
                    class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    Guardar
                  </button>
                  <button
                    @click="cancelEdit(it)"
                    class="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
                <button
                  @click="removeItem(version!.id, it)"
                  class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                >
                  🗑 Eliminar
                </button>
              </div>
            </div>

            <!-- Público (checkbox) -->
            <div class="flex items-center justify-between mt-2">
              <label class="flex items-center gap-2 text-xs">
                <input
                  v-if="editing[it.id]"
                  type="checkbox"
                  v-model="editCache[it.id].publicVisible"
                />
                <input
                  v-else
                  type="checkbox"
                  :checked="it.publicVisible"
                  disabled
                />
                Público
              </label>
            </div>
          </div>
          <div v-if="!itemsByState(state).length" class="text-sm text-gray-400">
            Arrastra aquí tarjetas para moverlas a <b>{{ labels[state] }}</b>.
          </div>
        </div>
      </div>
    </div>

    <!-- Loading / error -->
    <p v-if="loading" class="text-sm text-gray-500">Cargando…</p>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SwalService from '@services/swal/SwalService';
import type { Version, VersionItem, CreateVersionItemDto } from '@services/versions/versions';
import {
  getLatestDraftVersion,
  updateVersion,
  updateVersionItem,
  createVersionItem,
  removeVersionItem,
} from '@services/versions/versions';

const router = useRouter();
function goBack() { router.push({ name: 'versions-admin' }); }

const version = ref<Version | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const devStates = ['todo', 'in_progress', 'in_review', 'done'] as const;
const labels: Record<(typeof devStates)[number], string> = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  in_review: 'En revisión',
  done: 'Completado',
};
const changeTypes = ['feat','fix','docs','style','refactor','perf','test','build','ci','chore','revert'] as const;

// ------- Form versión -------
const form = ref({ version: '', releaseDate: null, publishedAt: null, isActive: false, notes: '' } as any);
function toLocalDT(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const pad = (n:number)=> String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalDT(local: string | null | undefined) {
  if (!local) return undefined;
  const d = new Date(local);
  return d.toISOString();
}
async function saveVersion() {
  if (!version.value) return;
  try {
    const dto = {
      version: form.value.version,
      notes: form.value.notes,
      isActive: form.value.isActive,
      releaseDate: form.value.releaseDate || null,
      publishedAt: fromLocalDT(form.value.publishedAt),
    };
    const updated = await updateVersion(version.value.id, dto);
    version.value = updated;
    form.value = {
      version: updated.version,
      notes: updated.notes,
      isActive: updated.isActive,
      releaseDate: updated.releaseDate ?? null,
      publishedAt: toLocalDT(updated.publishedAt),
    };
    SwalService.success('Versión guardada');
  } catch (e:any) {
    console.error(e);
    SwalService.error('No se pudo guardar la versión');
  }
}

// ------- Crear item -------
const newItem = reactive<Record<string, Partial<CreateVersionItemDto> & { branch?: string }>>({});
const showNewItemForm = reactive<Record<string, boolean>>({});
function resetNewItem(state: string) {
  newItem[state] = { type: 'feat', description: '', publicVisible: false, state: state as any, branch: '' };
}
function toggleNewItemForm(state: string) {
  showNewItemForm[state] = !showNewItemForm[state];
}
async function createItem(state: string) {
  if (!version.value) return;
  const payload = newItem[state];
  if (!payload.description || !payload.type) {
    SwalService.error('Falta tipo o descripción');
    return;
  }
  if (!payload.branch || !payload.branch.trim()) {
    SwalService.error('La branch es obligatoria');
    return;
  }
  try {
    const created = await createVersionItem(version.value.id, {
      type: payload.type!,
      description: payload.description!,
      publicVisible: !!payload.publicVisible,
      state: state as any,
      branch: payload.branch!.trim(),
    } as any);
    version.value.items.push(created);
    resetNewItem(state);
    showNewItemForm[state] = false;
  } catch (e) {
    console.error(e);
    SwalService.error('No se pudo crear el item');
  }
}

// ------- Drag & Drop -------
const dragData = ref<{ id: string; from: string } | null>(null);
const dragOverState = ref<string | null>(null);
function onDragStart(it: VersionItem, from: string) { dragData.value = { id: it.id, from }; }
function onDragOver(state: string) { dragOverState.value = state; }
function onDragLeave(state: string) { if (dragOverState.value === state) dragOverState.value = null; }
async function onDrop(targetState: string) {
  const data = dragData.value;
  dragOverState.value = null;
  dragData.value = null;
  if (!version.value || !data) return;
  if (data.from === targetState) return;
  const it = version.value.items.find(i => i.id === data.id);
  if (!it) return;
  const prev = it.state;
  try {
    const updated = await updateVersionItem(version.value.id, it.id, { state: targetState as any });
    Object.assign(it, updated);
  } catch (e) {
    (it as any).state = prev as any;
    console.error(e);
    SwalService.error('No se pudo mover el item');
  }
}

// ------- Editar / eliminar item -------
const editing = reactive<Record<string, boolean>>({});
const editCache = reactive<Record<string, { description: string; type: any; publicVisible: boolean; branch: string }>>({});
function startEdit(it: VersionItem) {
  editing[it.id] = true;
  editCache[it.id] = {
    description: it.description,
    type: it.type,
    publicVisible: it.publicVisible,
    branch: (it as any).branch ?? ''
  };
}
function cancelEdit(it: VersionItem) { editing[it.id] = false; }
async function saveEdit(it: VersionItem) {
  if (!version.value) return;
  try {
    const dto = editCache[it.id];
    if (!dto.branch || !dto.branch.trim()) {
      SwalService.error('La branch es obligatoria');
      return;
    }
    const updated = await updateVersionItem(version.value.id, it.id, dto as any);
    Object.assign(it, updated);
    editing[it.id] = false;
  } catch (e) {
    console.error(e);
    SwalService.error('No se pudo actualizar el item');
  }
}
async function removeItem(versionId: string, it: VersionItem) {
  const ok = await SwalService.confirm('¿Eliminar item?', 'Esta acción no se puede deshacer', 'warning')
    .then(r => r.isConfirmed).catch(() => false);
  if (!ok) return;
  try {
    await removeVersionItem(versionId, it.id);
    if (version.value) version.value.items = version.value.items.filter(x => x.id !== it.id);
  } catch (e) {
    console.error(e);
    SwalService.error('No se pudo eliminar el item');
  }
}

// ------- Utils -------
function itemsByState(state: string) { return version.value?.items.filter(it => it.state === state) ?? []; }
async function reload() { await loadDraft(); }
async function loadDraft() {
  loading.value = true; error.value = null;
  try {
    const v = await getLatestDraftVersion();
    version.value = v;
    if (v) {
      form.value = {
        version: v.version,
        notes: v.notes,
        isActive: v.isActive,
        releaseDate: v.releaseDate ?? null,
        publishedAt: toLocalDT(v.publishedAt),
      };
    }
    for (const s of devStates) { resetNewItem(s); showNewItemForm[s] = false; }
  } catch (e:any) {
    console.error(e);
    error.value = 'Error cargando la versión en preparación';
  } finally {
    loading.value = false;
  }
}
onMounted(loadDraft);
</script>
