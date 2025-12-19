<template>
    <div class="space-y-6">
        <div v-if="asignations.length === 0"
            class="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
            <i class="fa-solid fa-compact-disc text-4xl mb-3 opacity-30"></i>
            <p class="text-sm font-medium">No hay discos en esta lista</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div v-for="asignation in asignations" :key="asignation.id"
                class="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group flex flex-col h-full">

                <!-- Main Content -->
                <div class="flex items-start gap-4 mb-2 flex-grow">
                    <!-- Cover & Flag Column -->
                    <div class="flex flex-col items-center gap-2 flex-shrink-0">
                        <!-- Cover Placeholder -->
                        <div
                            class="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 font-bold overflow-hidden shadow-inner">
                            <img v-if="asignation.disc.image" :src="asignation.disc.image"
                                class="w-full h-full object-cover" />
                            <span v-else>{{ asignation.disc.artist.name.charAt(0) }}</span>
                        </div>

                        <!-- Flag -->
                        <div v-if="(asignation.disc.artist?.country?.isoCode?.length >= 2)"
                            class="w-5 h-5 flex-shrink-0" :title="asignation.disc.artist.country.name">
                            <CircleFlags :country="asignation.disc.artist.country.isoCode.slice(0, 2).toLowerCase()"
                                :show-flag-name="false" />
                        </div>
                    </div>

                    <div class="min-w-0 flex-1">
                        <h5 class="font-bold text-gray-900 text-base leading-tight truncate mb-1 text-left"
                            :title="asignation.disc.name">
                            {{ asignation.disc.name }}
                        </h5>

                        <!-- Artist & Genre Row -->
                        <div class="flex items-center gap-2 mb-2 min-w-0">
                            <p class="text-xs text-gray-500 font-medium truncate" :title="asignation.disc.artist.name">
                                {{ asignation.disc.artist.name }}
                            </p>
                            <span v-if="asignation.disc.genre"
                                class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm truncate max-w-[100px] flex-shrink-0"
                                :style="{ backgroundColor: asignation.disc.genre.color || '#9ca3af' }">
                                {{ asignation.disc.genre.name }}
                            </span>
                        </div>

                        <!-- Actions Row -->
                        <div class="flex items-center gap-2">
                            <!-- Spotify -->
                            <div class="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors cursor-pointer shadow-sm border border-green-200"
                                title="Spotify">
                                <SpotifyArtistButton :artistName="asignation.disc.artist.name"
                                    class="!text-xs !bg-transparent !text-inherit !p-0 !w-full !h-full flex items-center justify-center !shadow-none" />
                            </div>
                            <!-- Copy Info -->
                            <button @click="copyArtistAndDisc(asignation.disc.artist.name, asignation.disc.name)"
                                class="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors shadow-sm border border-purple-200"
                                title="Copiar Info">
                                <i class="fa-solid fa-clipboard text-xs"></i>
                            </button>
                            <!-- Copy Image -->
                            <button @click="copyToClipboard(asignation.disc.image)"
                                class="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors shadow-sm border border-blue-200"
                                title="Copiar Imagen">
                                <i class="fa-solid fa-image text-xs"></i>
                            </button>
                            <!-- Delete -->
                            <button @click="remove(asignation.id)"
                                class="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors shadow-sm border border-red-200"
                                title="Eliminar">
                                <i class="fa-solid fa-trash text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Footer: User & Check -->
                <div class="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3">

                    <!-- Checkbox -->
                    <label
                        class="relative flex items-center justify-center cursor-pointer group/check w-8 flex-shrink-0">
                        <input type="checkbox" :checked="asignation.done" @change="toggleDone(asignation)"
                            class="peer sr-only" />
                        <div
                            class="w-6 h-6 border-2 border-gray-300 rounded-lg peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors shadow-sm">
                        </div>
                        <i
                            class="fa-solid fa-check text-[10px] text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></i>
                    </label>

                    <!-- User Selector Compact -->
                    <div class="flex items-center w-full min-w-0">
                        <div v-if="editingUserAsignationId !== asignation.id" @click="startEditingUser(asignation)"
                            class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 -ml-1.5 rounded-lg transition-colors group/user w-full min-w-0"
                            title="Asignar usuario">
                            <div
                                class="w-7 h-7 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-indigo-700 ring-2 ring-white overflow-hidden shadow-sm">
                                <img v-if="asignation.user?.image" :src="asignation.user.image"
                                    class="w-full h-full object-cover" />
                                <span v-else>{{ asignation.user?.username?.charAt(0) || '?' }}</span>
                            </div>
                            <span class="text-xs font-semibold text-gray-600 truncate">
                                {{ asignation.user?.username || 'Sin asignar' }}
                            </span>
                        </div>
                        <select v-else @change="changeUser(asignation, $event)" @blur="editingUserAsignationId = null"
                            class="text-xs p-1.5 border rounded-lg border-indigo-300 focus:ring-0 w-full bg-white">
                            <option v-for="user in users" :key="user.id" :value="user.id"
                                :selected="user.id === asignation.user?.id">
                                {{ user.username }}
                            </option>
                        </select>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, nextTick } from "vue";
import { useAsignationStore } from "@stores/asignation/asignation";
import { useUserStore } from "@stores/user/users";
import SpotifyArtistButton from "@components/SpotifyArtistButton.vue";
import SwalService from "@services/swal/SwalService";

export default defineComponent({
    name: "MejoresAsignationList",
    components: {
        SpotifyArtistButton,
    },
    setup() {
        const asignationStore = useAsignationStore();
        const userStore = useUserStore();
        const asignations = ref<any[]>([]);

        const users = computed(() => userStore.usersRv);
        const editingUserAsignationId = ref<string | null>(null);

        // Initial Load
        if (userStore.usersRv.length === 0) {
            userStore.loadRvUsers();
        }

        // Watch Store
        watch(
            () => asignationStore.asignations,
            (newAsignations) => {
                asignations.value = [...newAsignations].sort((a, b) => {
                    const userA = a.user?.username || 'zzz'; // 'zzz' to put unassigned at the end
                    const userB = b.user?.username || 'zzz';
                    return userA.localeCompare(userB);
                });
            },
            { immediate: true, deep: true }
        );

        // User Edit
        const startEditingUser = async (asignation: any) => {
            editingUserAsignationId.value = asignation.id;
            await nextTick();
        };

        const changeUser = async (asignation: any, event: Event) => {
            const select = event.target as HTMLSelectElement;
            const newUserId = select.value;

            if (newUserId && newUserId !== asignation.user?.id) {
                try {
                    const payload = { id: asignation.id, userId: newUserId };
                    await asignationStore.updateAsignationStore(payload);

                    const newUser = userStore.usersRv.find((u: any) => u.id === newUserId);
                    if (newUser) {
                        const index = asignations.value.findIndex(a => a.id === asignation.id);
                        if (index !== -1) {
                            asignations.value[index] = { ...asignations.value[index], user: newUser };
                        }
                    }
                    SwalService.success('Usuario actualizado');
                } catch (error) {
                    console.error("Failed", error);
                }
            }
            editingUserAsignationId.value = null;
        };

        // Actions
        const remove = (id: string) => {
            asignations.value = asignations.value.filter(a => a.id !== id);
            asignationStore.removeAsignation(id);
        };

        const toggleDone = async (asignation: any) => {
            const updated = { ...asignation, done: !asignation.done };
            try {
                await asignationStore.updateAsignationStore(updated);
                const idx = asignations.value.findIndex(a => a.id === asignation.id);
                if (idx !== -1) asignations.value[idx] = updated;
            } catch (e) {
                console.error(e);
            }
        };

        const copyArtistAndDisc = (artist: string, disc: string) => {
            navigator.clipboard.writeText(`**${artist}** - *${disc}*`).then(() => {
                SwalService.success("Info copiada");
            });
        };

        const copyToClipboard = (text: string) => {
            navigator.clipboard.writeText(text).then(() => {
                SwalService.success("Enlace imagen copiado");
            });
        };

        return {
            asignations,
            users,
            editingUserAsignationId,
            startEditingUser,
            changeUser,
            remove,
            toggleDone,
            copyArtistAndDisc,
            copyToClipboard
        };
    }
});
</script>
