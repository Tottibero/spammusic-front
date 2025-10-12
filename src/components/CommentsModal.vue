<template>
  <transition name="fade" appear>
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <transition name="scale">
        <div ref="modal"
          class="bg-white rounded-lg shadow-lg relative w-full max-w-2xl sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col max-h-[90vh] sm:max-h-[90vh] h-auto">
          <!-- Botón para cerrar el modal -->
          <button @click="$emit('close')"
            class="absolute top-2 right-2 text-white hover:text-[#d9e021] bg-gray-700 hover:bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all">
            ✖
          </button>


          <!-- Cabecera -->
          <div class="border-b px-4 py-6 text-center">
            <h2 class="mb-4">
              <span class="bg-gray-700 text-white px-4 py-1 rounded-full text-md font-bold">
                CHAT
              </span>
            </h2>
            <p class="text-lg text-gray-800 mt-2">
              {{ artistName }} – <span class="italic">{{ albumName }}</span>
            </p>
          </div>

          <!-- Lista de comentarios en forma de árbol -->
          <div class="flex-1 overflow-y-auto px-4 py-3 space-y-4 max-h-[70vh] sm:max-h-[80vh]">
            <CommentItem v-for="comment in comments" :key="comment.id" :comment="comment" :disc-id="discId" :depth="0"
              :avatar-size="64" @reply-added="onReplyAdded" @deleted="handleCommentDeleted"
              @comment-updated="handleCommentUpdated"
              @open-user="openUserModal($event.username, $event.id, $event.avatar)" />
          </div>

          <UserModal
            v-if="showUserModal"
            :username="selectedUserName"
            :user-id="selectedUserId"
            :avatar-src="selectedUserAvatar"
            @close="showUserModal = false"
          />
          <!-- Formulario para añadir un comentario de primer nivel -->
          <div class="bg-gray-900 border-t px-4 py-3">
            <form @submit.prevent="submitTopComment" class="flex space-x-2">
              <input v-model="topCommentText" type="text" placeholder="Escribe un comentario..."
                class="flex-1 border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#d9e021]" />
              <button type="submit"
                class="bg-gradient-to-r from-[#d9e021] to-[#fcee21] text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-gradient-to-r from-[#d9e021] to-[#fcee21] hover:brightness-95 transition-all">
                Enviar
              </button>
            </form>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, toRefs } from "vue";
import CommentItem from "./CommentItem.vue";
import { getDisccomments, postcommentService } from "@services/comments/comments";
import SwalService from "@services/swal/SwalService";
import UserModal from "@/components/UserModal.vue";

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
  name: "CommentsModal",
  components: { CommentItem, UserModal },
  props: {
    discId: { type: String, required: true },
    artistName: { type: String, required: true },
    albumName: { type: String, required: true },
  },

  emits: ["close"], // opcional pero recomendable
  setup(props, { emit }) {
    const comments = ref<any[]>([]);
    const topCommentText = ref("");

    const { artistName, albumName, discId } = toRefs(props);

    // CommentsModal.vue (setup)
    const showUserModal = ref(false);
    const selectedUserName = ref("");
    const selectedUserId = ref("");
    const selectedUserAvatar = ref("");

    const openUserModal = (username: string, id: string, avatar?: string) => {
      selectedUserName.value = username;
      selectedUserId.value = id;
      selectedUserAvatar.value = avatar ?? "";
      showUserModal.value = true;
    };


    // Carga inicial de comentarios
    const fetchComments = async () => {
      try {
        const fetchedComments = await getDisccomments(discId.value);
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
      artistName,
      albumName,
      discId,
      showUserModal,
      selectedUserName,
      selectedUserId,
      openUserModal,
      selectedUserAvatar,
    };
  },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animación de escala SOLO en el modal */
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.scale-enter-to {
  opacity: 1;
  transform: scale(1);
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>