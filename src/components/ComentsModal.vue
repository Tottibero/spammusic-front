<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div
      class="bg-white rounded-lg shadow-lg relative max-w-2xl w-full flex flex-col h-[90vh]"
    >
      <!-- Botón para cerrar el modal -->
      <button
        @click="$emit('close')"
        class="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Cabecera -->
      <div class="border-b px-4 py-3">
        <h2 class="text-xl font-bold">Notas</h2>
      </div>

      <!-- Lista de comentarios en forma de árbol -->
      <div class="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :disc-id="discId"
          :depth="0"
          @reply-added="onReplyAdded"
          @deleted="handleCommentDeleted"
          @comment-updated="handleCommentUpdated"
        />
      </div>

      <!-- Formulario para añadir un comentario de primer nivel -->
      <div class="border-t px-4 py-3">
        <form @submit.prevent="submitTopComment" class="flex space-x-2">
          <input
            v-model="topCommentText"
            type="text"
            placeholder="Escribe un comentario..."
            class="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import CommentItem from "./CommentItem.vue";
import { getDisccomments, postcommentService } from "@services/comments/comments";
import SwalService from "@services/swal/SwalService";
/**
 * Construye un árbol de comentarios a partir de un array plano,
 * organizándolos como replies dentro de 'replies'.
 */
function buildCommentTree(flatComments: any[]): any[] {
  const commentMap: Record<string, any> = {};
  // Crea un map de id -> comentario
  flatComments.forEach((c) => {
    commentMap[c.id] = { ...c, replies: [] };
  });

  const rootComments: any[] = [];
  flatComments.forEach((c) => {
    if (c.parentId) {
      if (commentMap[c.parentId]) {
        commentMap[c.parentId].replies.push(commentMap[c.id]);
      } else {
        // Si no encontramos al padre, se añade a raíz
        rootComments.push(commentMap[c.id]);
      }
    } else {
      // Comentario sin padre => raíz
      rootComments.push(commentMap[c.id]);
    }
  });

  return rootComments;
}

/**
 * Marca un comentario como eliminado (isDeleted = true) en el árbol.
 * No se elimina físicamente, solo se cambia su contenido a "Comentario eliminado".
 */
function markCommentAsDeleted(comments: any[], commentId: string): any[] {
  comments.forEach((comment) => {
    if (comment.id === commentId) {
      comment.isDeleted = true;
      comment.comment = "Comentario eliminado";
    }
    if (comment.replies && comment.replies.length) {
      markCommentAsDeleted(comment.replies, commentId);
    }
  });
  return comments;
}

/**
 * Función recursiva para actualizar un comentario en el árbol
 * con la info devuelta por la API tras editarlo.
 */
function updateCommentInTree(commentList: any[], updated: any) {
  commentList.forEach((c) => {
    if (c.id === updated.id) {
      c.comment = updated.comment;
      c.editedAt = updated.editedAt;
      // Si tu API retorna más campos, también podrías actualizarlos aquí
    } else if (c.replies && c.replies.length) {
      updateCommentInTree(c.replies, updated);
    }
  });
}

export default defineComponent({
  name: "ComentsModal",
  components: {
    CommentItem,
  },
  props: {
    discId: { type: String, required: true },
  },
  setup(props, { emit }) {
    const comments = ref<any[]>([]);
    const topCommentText = ref("");

    // Carga inicial de comentarios
    const fetchComments = async () => {
      try {
        const fetchedComments = await getDisccomments(props.discId);
        comments.value = buildCommentTree(fetchedComments);
      } catch (error) {
        console.error("Error al cargar los comentarios:", error);
        alert("Hubo un error al cargar los comentarios.");
      }
    };

    // Enviar comentario de primer nivel
    const submitTopComment = async () => {
      if (!topCommentText.value.trim()) {
        alert("El comentario no puede estar vacío.");
        return;
      }
      try {
        const newComment = await postcommentService({
          discId: props.discId,
          comment: topCommentText.value,
        });
        // Insertamos el nuevo comentario como raíz
        comments.value.push({ ...newComment, replies: [] });
        topCommentText.value = "";
        SwalService.success("Comentario creado");
      } catch (error) {
        console.error("Error al enviar el comentario:", error);
        alert("Hubo un error al enviar el comentario.");
      }
    };

    // Cuando se añade una respuesta en el hijo
    const onReplyAdded = (payload: { parentId: string; reply: any }) => {
      // Si deseas manipular el árbol en el padre, puedes hacerlo aquí;
      // de momento, el hijo ya lo añade localmente.
    };

    // Maneja la eliminación (lógica) de un comentario
    const handleCommentDeleted = (commentId: string) => {
      comments.value = markCommentAsDeleted(comments.value, commentId);
    };

    // Maneja la edición de un comentario (actualiza el texto en el árbol)
    const handleCommentUpdated = (updated: any) => {
      updateCommentInTree(comments.value, updated);
    };

    onMounted(() => {
      fetchComments();
    });

    return {
      comments,
      topCommentText,
      submitTopComment,
      onReplyAdded,
      handleCommentDeleted,
      handleCommentUpdated,
    };
  },
});
</script>
