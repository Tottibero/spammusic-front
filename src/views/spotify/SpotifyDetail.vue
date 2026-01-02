<template>
  <div class="p-6 space-y-6">
    <!-- Header / Nav -->
    <div class="flex items-center gap-4">
      <button class="rounded-xl px-3 py-2 border hover:bg-gray-100 transition" @click="goBack()">
        &larr; Volver
      </button>
      <h1 class="text-2xl font-semibold">Detalle de Spotify</h1>
    </div>

    <!-- Loading / Error states -->
    <div v-if="loading" class="text-gray-500">Cargando...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <!-- Content -->
    <div v-else-if="item" class="bg-white rounded-2xl border shadow-sm p-6 space-y-4 max-w-3xl">
      
      <!-- Basic Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-500 mb-1">Nombre</label>
          <div class="text-lg font-medium">{{ item.name }}</div>
        </div>
        
        <div>
           <label class="block text-sm font-medium text-gray-500 mb-1">ID</label>
           <div class="text-sm font-mono text-gray-700 bg-gray-50 inline-block px-2 py-1 rounded">
             {{ item.id }}
           </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-500 mb-1">Estado</label>
          <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1"
                :class="pillClass(item.status)">
            {{ displayEstado(item.status) }}
          </span>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-500 mb-1">Tipo</label>
          <div class="capitalize">{{ item.type }}</div>
        </div>
      </div>

      <!-- Link -->
      <div>
        <label class="block text-sm font-medium text-gray-500 mb-1">Enlace</label>
        <a :href="item.link" target="_blank" rel="noopener"
           class="text-blue-600 underline hover:text-blue-800 break-all">
          {{ item.link }}
        </a>
      </div>

      <hr class="border-gray-100" />

      <!-- Dates -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <label class="block font-medium text-gray-500 mb-1">Fecha Actualización (Manual)</label>
          <div>{{ fmtDate(item.updateDate) }}</div>
        </div>
        <div>
          <label class="block font-medium text-gray-500 mb-1">Creado</label>
          <div>{{ fmtDate(item.createdAt) }}</div>
        </div>
        <div>
          <label class="block font-medium text-gray-500 mb-1">Última Modificación (Sistema)</label>
          <div>{{ fmtDate(item.updatedAt) }}</div>
        </div>
      </div>

      <!-- User Info -->
      <div v-if="item.user" class="pt-2">
        <label class="block text-sm font-medium text-gray-500 mb-2">Usuario Asignado</label>
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500">
             <img v-if="item.user.image" :src="item.user.image" alt="avatar" class="w-full h-full object-cover" />
             <span v-else class="text-xs uppercase">{{ item.user.username.slice(0,2) }}</span>
          </div>
          <div>
            <div class="font-medium text-sm">{{ item.user.username }}</div>
            <div class="text-xs text-gray-400">{{ item.user.id }}</div>
          </div>
        </div>
      </div>

       <hr class="border-gray-100" />

       <!-- Add Songs Section -->
       <div>
         <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Añadir Canciones</h2>
            <div v-if="!isConnected">
               <button @click="connectSpotify" class="bg-[#1DB954] text-white px-4 py-2 rounded-full font-medium hover:bg-[#1ed760] transition-colors flex items-center gap-2">
                 <i class="fa-brands fa-spotify"></i> Conectar Spotify
               </button>
            </div>
            <div v-else class="text-green-600 text-sm font-medium flex items-center gap-1">
               <i class="fa-solid fa-check-circle"></i> Conectado
            </div>
         </div>

         <div v-if="isConnected" class="space-y-4">
            <div class="relative">
               <input 
                  v-model="searchQuery" 
                  @keyup.enter="performSearch"
                  type="text" 
                  placeholder="Buscar canción..." 
                  class="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-black/20"
               />
               <i class="fa-solid fa-search absolute left-3 top-3 text-gray-400"></i>
               <button 
                  @click="performSearch"
                  class="absolute right-2 top-1.5 bg-black text-white px-3 py-1 text-sm rounded-lg hover:bg-gray-800"
                  :disabled="searching"
                >
                  {{ searching ? '...' : 'Buscar' }}
               </button>
            </div>

            <!-- Search Results -->
            <div v-if="searchResults.length > 0" class="border rounded-xl divide-y">
               <div v-for="track in searchResults" :key="track.id" class="p-3 flex items-center justify-between hover:bg-gray-50">
                  <div class="flex items-center gap-3 overflow-hidden">
                     <img :src="track.album.images[0]?.url" class="w-10 h-10 rounded object-cover bg-gray-200" />
                     <div class="min-w-0">
                        <div class="font-medium truncate">{{ track.name }}</div>
                        <div class="text-xs text-gray-500 truncate">{{ track.artists.map(a => a.name).join(', ') }}</div>
                     </div>
                  </div>
                  <button 
                    @click="addTrack(track)" 
                    class="ml-2 px-3 py-1.5 text-xs font-medium border rounded-lg hover:bg-black hover:text-white transition-colors flex-shrink-0"
                    :disabled="addingId === track.id"
                  >
                    {{ addingId === track.id ? 'Añadiendo...' : 'Añadir' }}
                  </button>
               </div>
            </div>
            <div v-else-if="searched && !searching" class="text-center text-gray-500 py-4 text-sm">
               No se encontraron resultados.
            </div>
         </div>
         <div v-else class="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl text-center">
            Conecta tu cuenta de Spotify para buscar y añadir canciones a esta lista.
         </div>
       </div>
    
    </div>
    
    <div v-else class="text-gray-500">
      No se encontró el elemento.
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSpotify, type Spotify, type SpotifyEstado } from '@services/spotify/spotify';
import { useSpotifyAuthStore } from '../../stores/spotifyAuth';
import { searchTracks, addTrackToPlaylist } from '../../helpers/SpotifyFunctions';
import SwalService from '@services/swal/SwalService';

const route = useRoute();
const router = useRouter();
const spotifyAuth = useSpotifyAuthStore();

const item = ref<Spotify | null>(null);
const loading = ref(false);
const error = ref('');

// Search state
const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const searching = ref(false);
const searched = ref(false);
const addingId = ref<string | null>(null);

const isConnected = computed(() => spotifyAuth.isConnected);

onMounted(async () => {
  spotifyAuth.checkExpiration();
  const id = route.params.id as string;
  if (!id) {
    error.value = 'ID no proporcionado';
    return;
  }
  
  loading.value = true;
  try {
    item.value = await getSpotify(id);
  } catch (e: any) {
    console.error(e);
    error.value = e?.response?.data?.message || 'Error cargando detalle';
  } finally {
    loading.value = false;
  }
});

function goBack() {
  router.back();
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

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

// --- Spotify Actions ---
function connectSpotify() {
  spotifyAuth.login();
}

async function performSearch() {
  if (!searchQuery.value.trim() || !spotifyAuth.accessToken) return;
  
  searching.value = true;
  searched.value = true;
  try {
     searchResults.value = await searchTracks(searchQuery.value, spotifyAuth.accessToken) || [];
  } catch (e) {
     console.error(e);
     SwalService.error('Error buscando canciones');
  } finally {
     searching.value = false;
  }
}

async function addTrack(track: any) {
   if (!item.value || !spotifyAuth.accessToken) return;

   // Extract Playlist ID from link
   // Link format: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
   const linkParts = item.value.link.split('/');
   // It might satisfy the regex or simply take the last part if we assume it's clean
   // If link has query params, remove them
   let playlistId = linkParts[linkParts.length - 1].split('?')[0];

   if (!playlistId) {
      SwalService.error('No se pudo identificar el ID de la playlist');
      return;
   }

   addingId.value = track.id;
   try {
      const success = await addTrackToPlaylist(playlistId, track.uri, spotifyAuth.accessToken);
      if (success) {
         SwalService.success(`"${track.name}" añadida a la playlist`);
      } else {
         SwalService.error('No se pudo añadir la canción. Verifica que la playlist es tuya o colaborativa.');
      }
   } catch (e) {
      console.error(e);
      SwalService.error('Error añadiendo canción');
   } finally {
      addingId.value = null;
   }
}
</script>
