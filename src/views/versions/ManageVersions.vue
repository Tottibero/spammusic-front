<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">Gestionar versiones</h1>

    <!-- Barra de acciones -->
    <div class="flex items-center gap-3">
      <button @click="openCreateVersion" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        ➕ Nueva versión
      </button>
      <button @click="reload" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Recargar
      </button>
      <button @click="goToKanban" class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
        📋 Ver tablero Kanban
      </button>
    </div>

    <!-- Tabla responsiva de versiones -->
    <div class="overflow-x-auto w-full">
      <table class="w-full border border-gray-300 min-w-[900px]">
        <thead class="bg-gray-200 hidden md:table-header-group">
          <tr>
            <th class="p-2 border">Versión</th>
            <th class="p-2 border">Notas</th>
            <th class="p-2 border">Publicada</th>
            <th class="p-2 border">Activa</th>
            <th class="p-2 border">Items</th>
            <th class="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="v in versions"
            :key="v.id"
            class="border md:table-row flex flex-col md:flex-row"
          >
            <!-- Versión -->
            <td class="p-2 border font-bold md:font-normal">
              <input v-model="v.version" class="w-full p-2 border rounded" />
              <div class="text-xs text-gray-500 mt-1">
                ID: {{ v.id }}
              </div>
            </td>

            <!-- Notas -->
            <td class="p-2 border">
              <textarea
                v-model="v.notes"
                class="w-full p-2 border rounded"
                rows="2"
              ></textarea>
              <div class="grid grid-cols-2 gap-2 mt-2">
                <label class="text-sm">
                  Release:
                  <input
                    type="date"
                    v-model="dates[v.id].releaseDate"
                    class="w-full p-1 border rounded"
                  />
                </label>
                <label class="text-sm">
                  Published:
                  <input
                    type="datetime-local"
                    v-model="dates[v.id].publishedAt"
                    class="w-full p-1 border rounded"
                  />
                </label>
              </div>
            </td>

            <!-- Publicada -->
            <td class="p-2 border">
              <span class="text-sm text-gray-600">
                {{ v.publishedAt ? new Date(v.publishedAt).toLocaleString() : '—' }}
              </span>
            </td>

            <!-- Activa -->
            <td class="p-2 border">
              <span class="inline-flex items-center">
                <span
                  class="mr-2 px-2 py-1 rounded text-white"
                  :class="v.isActive ? 'bg-green-500' : 'bg-gray-400'"
                >
                  {{ v.isActive ? 'Activa' : 'Inactiva' }}
                </span>
                <button
                  @click="toggleActive(v)"
                  class="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                  {{ v.isActive ? 'Desactivar' : 'Activar' }}
                </button>
              </span>
            </td>

            <!-- Items -->
            <td class="p-2 border">
              <button
                @click="toggleItems(v.id)"
                class="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800"
              >
                {{ open[v.id] ? 'Ocultar' : 'Mostrar' }} ({{ v.items.length }})
              </button>
              <div v-if="open[v.id]" class="mt-3 space-y-3">
                <!-- Form nuevo item -->
                <div class="p-3 border rounded bg-gray-50">
                  <h4 class="text-sm font-semibold mb-2">Nuevo item</h4>
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <select v-model="newItem[v.id].type" class="p-2 border rounded">
                      <option v-for="t in changeTypes" :key="t" :value="t">{{ t }}</option>
                    </select>
                    <input
                      v-model="newItem[v.id].description"
                      placeholder="Descripción"
                      class="p-2 border rounded"
                    />
                    <select v-model="newItem[v.id].state" class="p-2 border rounded">
                      <option v-for="s in devStates" :key="s" :value="s">{{ s }}</option>
                    </select>
                    <label class="flex items-center gap-2 text-sm">
                      <input type="checkbox" v-model="newItem[v.id].publicVisible" />
                      Público
                    </label>
                  </div>
                  <div class="flex gap-2 mt-2">
                    <button
                      @click="createItem(v.id)"
                      class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                <!-- Lista items -->
                <div class="overflow-x-auto">
                  <table class="w-full border border-gray-300 min-w-[700px]">
                    <thead class="bg-gray-100">
                      <tr>
                        <th class="p-2 border text-left">Tipo</th>
                        <th class="p-2 border text-left">Descripción</th>
                        <th class="p-2 border text-left">Estado</th>
                        <th class="p-2 border text-left">Público</th>
                        <th class="p-2 border text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="it in v.items" :key="it.id">
                        <td class="p-2 border">
                          <select v-model="it.type" class="p-2 border rounded w-full">
                            <option v-for="t in changeTypes" :key="t" :value="t">{{ t }}</option>
                          </select>
                        </td>
                        <td class="p-2 border">
                          <input v-model="it.description" class="w-full p-2 border rounded" />
                        </td>
                        <td class="p-2 border">
                          <select v-model="it.state" class="p-2 border rounded w-full">
                            <option v-for="s in devStates" :key="s" :value="s">{{ s }}</option>
                          </select>
                        </td>
                        <td class="p-2 border text-center">
                          <input type="checkbox" v-model="it.publicVisible" />
                        </td>
                        <td class="p-2 border">
                          <div class="flex gap-2">
                            <button
                              @click="saveItem(v.id, it)"
                              class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Guardar
                            </button>
                            <button
                              @click="removeItem(v.id, it)"
                              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </td>

            <!-- Acciones versión -->
            <td
              class="p-2 border text-center flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-2"
            >
              <button
                @click="saveVersionInline(v)"
                class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Guardar
              </button>
              <button
                @click="confirmDeleteVersion(v)"
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form crear/editar versión (simple, inline modal) -->
    <div v-if="showForm" class="mb-4 p-4 border rounded bg-gray-100">
      <h3 class="text-lg font-semibold mb-2">
        {{ editingVersion ? 'Editar versión' : 'Nueva versión' }}
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input v-model="form.version" placeholder="1.2.3" class="w-full p-2 border rounded" />
        <input type="date" v-model="form.releaseDate" class="w-full p-2 border rounded" />
        <input
          type="datetime-local"
          v-model="form.publishedAt"
          class="w-full p-2 border rounded"
        />
      </div>
      <textarea
        v-model="form.notes"
        placeholder="Notas"
        rows="3"
        class="w-full p-2 border rounded mt-2"
      ></textarea>
      <div class="flex gap-2 mt-3">
        <button
          @click="saveVersionForm"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Guardar
        </button>
        <button
          @click="closeForm"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import SwalService from '@services/swal/SwalService';
import type {
  Version,
  VersionItem,
  CreateVersionDto,
  CreateVersionItemDto,
} from '@services/versions/versions';
import {
  listVersions,
  createVersion,
  updateVersion,
  removeVersion,
  setVersionActive,
  createVersionItem,
  updateVersionItem,
  removeVersionItem,
} from '@services/versions/versions';

const router = useRouter();
function goToKanban() {
  router.push({ name: 'versions-kanban' });
}

const versions = ref<Version[]>([]);
const open = reactive<Record<string, boolean>>({});
const newItem = reactive<Record<string, Partial<CreateVersionItemDto>>>({});
const dates = reactive<Record<string, { releaseDate: string; publishedAt: string }>>({});

const changeTypes = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];
const devStates = ['todo', 'in_progress', 'in_review', 'done'];

// Form crear/editar versión
const showForm = ref(false);
const editingVersion = ref<Version | null>(null);
const form = ref<Partial<CreateVersionDto>>({
  version: '',
  notes: '',
  releaseDate: '',
  publishedAt: '',
});

function toLocalDT(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function fromLocalDT(local: string | undefined) {
  if (!local) return undefined;
  const d = new Date(local);
  return d.toISOString();
}

async function load() {
  const data = await listVersions();
  versions.value = data;

  for (const v of versions.value) {
    open[v.id] = false;
    newItem[v.id] = { type: 'feat', description: '', state: 'todo', publicVisible: false };
    dates[v.id] = {
      releaseDate: v.releaseDate ?? '',
      publishedAt: toLocalDT(v.publishedAt),
    };
  }
}

function openCreateVersion() {
  editingVersion.value = null;
  form.value = { version: '', notes: '', releaseDate: '', publishedAt: '' };
  showForm.value = true;
}
function openEditVersion(v: Version) {
  editingVersion.value = v;
  form.value = {
    version: v.version,
    notes: v.notes,
    releaseDate: v.releaseDate ?? '',
    publishedAt: toLocalDT(v.publishedAt),
  };
  showForm.value = true;
}
function closeForm() {
  showForm.value = false;
}

async function saveVersionForm() {
  try {
    if (editingVersion.value) {
      const dto = {
        ...form.value,
        publishedAt: fromLocalDT(form.value.publishedAt as string),
      };
      const updated = await updateVersion(editingVersion.value.id, dto);
      Object.assign(editingVersion.value, updated);
      dates[editingVersion.value.id].releaseDate = updated.releaseDate ?? '';
      dates[editingVersion.value.id].publishedAt = toLocalDT(updated.publishedAt);
      SwalService.success('Versión actualizada');
    } else {
      const dto = {
        ...form.value,
        publishedAt: fromLocalDT(form.value.publishedAt as string),
      } as CreateVersionDto;
      const created = await createVersion(dto);
      versions.value.push(created);
      open[created.id] = false;
      newItem[created.id] = { type: 'feat', description: '', state: 'todo', publicVisible: false };
      dates[created.id] = {
        releaseDate: created.releaseDate ?? '',
        publishedAt: toLocalDT(created.publishedAt),
      };
      SwalService.success('Versión creada');
    }
  } catch (e) {
    console.error(e);
    SwalService.error('Error guardando versión');
  } finally {
    closeForm();
  }
}

async function saveVersionInline(v: Version) {
  try {
    const dto = {
      version: v.version,
      notes: v.notes,
      releaseDate: dates[v.id].releaseDate || null,
      publishedAt: fromLocalDT(dates[v.id].publishedAt),
    };
    const updated = await updateVersion(v.id, dto);
    Object.assign(v, updated);
    dates[v.id].releaseDate = updated.releaseDate ?? '';
    dates[v.id].publishedAt = toLocalDT(updated.publishedAt);
    SwalService.success('Versión guardada');
  } catch (e) {
    console.error(e);
    SwalService.error('No se pudo guardar la versión');
  }
}

async function toggleActive(v: Version) {
  try {
    const updated = await setVersionActive(v.id, !v.isActive);
    Object.assign(v, updated);
  } catch (e) {
    console.error(e);
    SwalService.error('No se pudo cambiar el estado activo');
  }
}

function toggleItems(id: string) {
  open[id] = !open[id];
}

async function createItem(versionId: string) {
  try {
    const payload = newItem[versionId];
    if (!payload.description || !payload.type) {
      SwalService.error('Falta tipo o descripción');
      return;
    }
    const created = await createVersionItem(versionId, payload as CreateVersionItemDto);
    const v = versions.value.find((x) => x.id === versionId);
    if (v) v.items.push(created);
    newItem[versionId] = { type: 'feat', description: '', state: 'todo', publicVisible: false };
  } catch (e) {
    console.error(e);
    SwalService.error('No se pudo crear el item');
  }
}

async function saveItem(versionId: string, it: VersionItem) {
  try {
    const updated = await updateVersionItem(versionId, it.id, {
      type: it.type,
      description: it.description,
      state: it.state,
      publicVisible: it.publicVisible,
    });
    Object.assign(it, updated);
    SwalService.success('Item actualizado');
  } catch (e) {
    console.error(e);
    SwalService.error('No se pudo actualizar el item');
  }
}

async function removeItem(versionId: string, it: VersionItem) {
  const ok = await SwalService.confirm(
    '¿Eliminar item?',
    'Esta acción no se puede deshacer',
    'warning'
  )
    .then((r) => r.isConfirmed)
    .catch(() => false);
  if (!ok) return;

  try {
    await removeVersionItem(versionId, it.id);
    const v = versions.value.find((x) => x.id === versionId);
    if (v) v.items = v.items.filter((x) => x.id !== it.id);
    SwalService.success('Item eliminado');
  } catch (e) {
    console.error(e);
    SwalService.error('No se pudo eliminar el item');
  }
}

async function confirmDeleteVersion(v: Version) {
  const ok = await SwalService.confirm(
    '¿Eliminar versión?',
    'Se eliminarán también sus items',
    'warning'
  )
    .then((r) => r.isConfirmed)
    .catch(() => false);
  if (!ok) return;

  try {
    await removeVersion(v.id);
    versions.value = versions.value.filter((x) => x.id !== v.id);
    SwalService.success('Versión eliminada');
  } catch (e) {
    console.error(e);
    SwalService.error('No se pudo eliminar la versión');
  }
}

async function reload() {
  await load();
}

onMounted(load);
</script>
