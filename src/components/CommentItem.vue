<template>
  <div :class="depth > 0 ? 'ml-6 border-l pl-3' : ''" class="space-y-2 text-left">
    <!-- Formulario de edición -->
    <div v-if="showEditForm" class="p-3 bg-gray-100 rounded">
      <input v-model="editText" type="text"
        class="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div class="flex space-x-2 mt-2">
        <button @click="submitEdit" class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">
          Guardar
        </button>
        <button @click="cancelEdit" class="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600">
          Cancelar
        </button>
      </div>
    </div>

    <!-- Vista del comentario (si no está en edición) -->
    <div v-else class="p-3 bg-gray-100 rounded flex items-start space-x-3">

      <!-- Avatar del usuario -->
      <div class="relative w-9 h-9 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-500">
        <img v-if="localComment.user.avatarUrl" :src="localComment.user.avatarUrl" alt="Avatar"
          class="w-full h-full object-cover" />
        <svg v-else class="absolute w-11 h-11 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
        </svg>
      </div>


      <!-- Contenido del comentario -->
      <div class="flex-1">
        <p class="text-gray-800 text-left">{{ localComment.comment }}</p>

        <!-- Mostrar autor y fecha solo si el comentario NO está eliminado -->
        <div v-if="!localComment.isDeleted" class="text-xs text-gray-500 mt-1">
          Por: {{ localComment.user.username }} - {{ formatDate(localComment.createdAt) }}
        </div>
        <!-- Botones: Responder, Editar, Borrar -->
        <div class="mt-2 flex space-x-2">
          <button @click="toggleReplyForm" class="text-blue-500 text-xs" v-if="!localComment.isDeleted">
            Responder
          </button>
          <button @click="startEdit" class="text-green-500 text-xs"
            v-if="!localComment.isDeleted && localComment.user.id === user.id">
            Editar
          </button>
          <button @click="deleteComment" class="text-red-500 text-xs"
            v-if="!localComment.isDeleted && localComment.user.id === user.id">
            Borrar
          </button>
        </div>
      </div>
    </div>

    <!-- Formulario para responder, solo si el comentario no está eliminado -->
    <div v-if="showReplyForm && !localComment.isDeleted" class="ml-4 mt-2">
      <form @submit.prevent="submitReply" class="flex space-x-2">
        <input v-model="replyText" type="text" placeholder="Escribe tu respuesta..."
          class="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" />
        <button type="submit"
          class="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600 transition-colors">
          Enviar
        </button>
      </form>
    </div>

    <!-- Renderizado recursivo de las respuestas -->
    <div v-if="localComment.replies && localComment.replies.length" class="mt-2 space-y-2">
      <CommentItem v-for="reply in localComment.replies" :key="reply.id" :comment="reply" :disc-id="discId"
        :depth="depth + 1" @reply-added="$emit('reply-added', $event)" @deleted="$emit('deleted', $event)"
        @comment-updated="$emit('comment-updated', $event)" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import {
  postcommentService,
  updateCommentService,
  deleteCommentService,
} from "@services/comments/comments";
import { useAuthStore } from "@stores/auth/auth.ts";
import SwalService from "@services/swal/SwalService";
export default defineComponent({
  name: "CommentItem",
  props: {
    comment: { type: Object, required: true },
    discId: { type: String, required: true },
    depth: { type: Number, default: 0 },
  },
  emits: ["reply-added", "deleted", "comment-updated"],
  setup(props, { emit }) {
    // Copia local para manipular el comentario sin afectar directamente las props
    const localComment = ref({ ...props.comment });

    // Actualiza la copia local si las props cambian desde el padre
    watch(
      () => props.comment,
      (newVal) => {
        localComment.value = { ...newVal };
      },
      { deep: true, immediate: true }
    );

    const showReplyForm = ref(false);
    const replyText = ref("");
    const showEditForm = ref(false);
    const editText = ref(localComment.value.comment);

    // Store de usuario para comprobar permisos
    const authStore = useAuthStore();
    const user = computed(() => authStore.loggedUser);

    // Toggle del formulario de respuesta
    const toggleReplyForm = () => {
      if (!localComment.value.isDeleted) {
        showReplyForm.value = !showReplyForm.value;
      }
    };

    // Envío de respuesta
    const submitReply = async () => {
      if (!replyText.value.trim()) {
        alert("La respuesta no puede estar vacía.");
        return;
      }
      try {
        const newReply = await postcommentService({
          discId: props.discId,
          comment: replyText.value,
          parentId: localComment.value.id,
        });
        if (!localComment.value.replies) {
          localComment.value.replies = [];
        }
        localComment.value.replies.push(newReply);
        SwalService.success("Respuesta añadida");
        emit("reply-added", {
          parentId: localComment.value.id,
          reply: newReply,
        });
        replyText.value = "";
        showReplyForm.value = false;
      } catch (error) {
        console.error("Error al enviar la respuesta:", error);
        alert("Hubo un error al enviar la respuesta.");
      }
    };

    // Editar
    const startEdit = () => {
      if (localComment.value.isDeleted) return;
      showEditForm.value = true;
      editText.value = localComment.value.comment;
    };

    const cancelEdit = () => {
      showEditForm.value = false;
      editText.value = localComment.value.comment;
    };

    const submitEdit = async () => {
      if (!editText.value.trim()) {
        alert("El comentario no puede estar vacío.");
        return;
      }
      try {
        const updatedComment = await updateCommentService(
          localComment.value.id,
          {
            comment: editText.value,
          }
        );
        // Actualiza la copia local
        SwalService.success("Respuesta modificada");
        localComment.value.comment = updatedComment.comment;
        localComment.value.editedAt = updatedComment.editedAt;
        showEditForm.value = false;

        // Emite un evento para que el padre actualice su árbol
        emit("comment-updated", updatedComment);
      } catch (error) {
        console.error("Error al actualizar el comentario:", error);
        alert("Hubo un error al actualizar el comentario.");
      }
    };

    // Borrar (lógico o marcándolo como eliminado)
    const deleteComment = async () => {
      if (localComment.value.isDeleted) return;
      if (!confirm("¿Estás seguro de que deseas borrar este comentario?"))
        return;
      try {
        await deleteCommentService(localComment.value.id);
        // Emite el evento para que el padre lo marque como eliminado
        emit("deleted", localComment.value.id);
        SwalService.success("Comentario borrado");
      } catch (error) {
        console.error("Error al borrar el comentario:", error);
        alert("Hubo un error al borrar el comentario.");
      }
    };

    // Formatear fecha
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    return {
      localComment,
      showReplyForm,
      replyText,
      toggleReplyForm,
      submitReply,
      showEditForm,
      editText,
      startEdit,
      cancelEdit,
      submitEdit,
      deleteComment,
      formatDate,
      user,
    };
  },
});
</script>
