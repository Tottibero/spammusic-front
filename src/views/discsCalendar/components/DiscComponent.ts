import { computed, defineComponent, reactive, ref } from "vue";
import type { PropType } from "vue";
import { updateDisc, deleteDisc } from "@services/discs/discs"; // Ajusta según tu estructura
import Swal from "sweetalert2";
import axios from "axios";
import SpotifyArtistButton from "@components/SpotifyArtistButton.vue";

export default defineComponent({
  name: "Disc",
  components: {SpotifyArtistButton},
  props: {
    disc: {
      type: Object as PropType<{
        id: string;
        name: string;
        artist: { name: string };
        genreId: string;
        link: string | null;
        image: string | null;
        ep: boolean;
        verified: boolean;
        releaseDate: Date;
      }>,
      required: true,
    },
    genres: {
      type: Array as PropType<{ id: string; name: string }[]>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const editingName = ref(false);
    const editingLink = ref(false);
    const editedData = reactive({
      name: props.disc.name,
      link: props.disc.link,
      genreId: props.disc.genreId,
      releaseDate: props.disc.releaseDate,
    });

    const editingDate = ref(false);

    const formattedDate = computed(() => {
      return new Date(props.disc.releaseDate).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    });

    const enableEditing = (field: "name" | "link" | "releaseDate") => {
      if (field === "name") editingName.value = true;
      if (field === "link") editingLink.value = true;
      if (field === "releaseDate") editingDate.value = true;
    };

    const saveChanges = async (
      field: "name" | "link" | "genreId" | "releaseDate"
    ) => {
      try {
        await updateDisc(props.disc.id, { [field]: editedData[field] });
        Object.assign(props.disc, { [field]: editedData[field] });
        if (field === "name") editingName.value = false;
        if (field === "link") editingLink.value = false;
        if (field === "releaseDate") {
          emit("date-changed", {
            ...props.disc,
            releaseDate: editedData.releaseDate,
          });
          editingDate.value = false;
        }

        Swal.fire({
          title: "¡Éxito!",
          text: `El ${field} del disco se ha actualizado correctamente.`,
          icon: "success",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      } catch (error) {
        console.error(`Error al actualizar ${field}:`, error);
        Swal.fire({
          title: "Error",
          text: `No se pudo actualizar el ${field}.`,
          icon: "error",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      }
    };

    const toggleEp = async () => {
      try {
        await updateDisc(props.disc.id, { ep: !props.disc.ep });
        props.disc.ep = !props.disc.ep;
      } catch (error) {
        console.error("Error al actualizar EP:", error);
      }
    };

    const toggleVerified = async () => {
      try {
        await updateDisc(props.disc.id, { verified: !props.disc.verified });
        props.disc.verified = !props.disc.verified;
      } catch (error) {
        console.error("Error al actualizar verificación:", error);
      }
    };

    const confirmDelete = async (discId) => {
      const confirm = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Esta acción no se puede deshacer!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminarlo",
        cancelButtonText: "Cancelar",
      });

      if (confirm.isConfirmed) {
        deleteDiscFunction(discId);
      }
    };

    const deleteDiscFunction = async (discId) => {
      try {
        await deleteDisc(discId);
        Swal.fire({
          title: "¡Eliminado!",
          text: "El disco se eliminó correctamente.",
          icon: "success",
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
        emit("disc-deleted", props.disc.id); // Emitimos un evento al padre
      } catch (error) {
        console.error("Error al eliminar el disco:", error);
      }
    };

    const getGenreColor = (genreId: string) => {
      const genre = props.genres.find((g) => g.id === genreId);
      return genre?.color || "transparent";
    };

    const getLinkText = (link: string) => {
      if (link.includes("bandcamp.com")) return "Bandcamp";
      if (link.includes("youtube.com") || link.includes("youtu.be"))
        return "YouTube";
      if (link.includes("spotify.com")) return "Spotify";
      return "Enlace";
    };

      const obtenerTokenSpotify = async () => {
      const client_id = import.meta.env.VITE_CLIENT_ID;
      const client_secret = import.meta.env.VITE_CLIENT_SECRET;
      const credentials = btoa(`${client_id}:${client_secret}`);

      try {
        const response = await axios.post(
          "https://accounts.spotify.com/api/token",
          "grant_type=client_credentials",
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${credentials}`,
            },
          }
        );
        return response.data.access_token;
      } catch (error) {
        console.error("Error al obtener el token de Spotify:", error);
      }
    };

    const buscarGeneroSpotify = async (disc: any) => {
      const token = await obtenerTokenSpotify();
      if (!token) {
        console.error("No se pudo obtener el token de Spotify");
        return;
      }

      try {
        // Paso 1: Busca el artista
        const query = encodeURIComponent(`artist:${disc.artist.name}`);
        const response = await axios.get(
          `https://api.spotify.com/v1/search?q=${query}&type=artist&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.artists.items.length > 0) {
          const artist = response.data.artists.items[0];
          const artistId = artist.id;

          // Paso 2: Obtén los álbumes/tracks más recientes del artista
          const albumsResponse = await axios.get(
            `https://api.spotify.com/v1/artists/${artistId}/albums`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: {
                include_groups: "album,single", // Solo álbumes y sencillos
                limit: 1, // Solo el lanzamiento más reciente
              },
            }
          );

          if (albumsResponse.data.items.length > 0) {
            const genres = artist.genres; // Géneros asociados al artista

            if (genres.length > 0) {
              disc.genero = genres.join(", "); // Agrega los géneros al disco
              Swal.fire({
                title: "¡Éxito!",
                text: `El género del último track: ${disc.genero}`,
                icon: "success",
                position: "top-end",
                timer: 6000,
                timerProgressBar: true,
                showConfirmButton: false,
                toast: true,
              });
            } else {
              Swal.fire({
                title: "Sin géneros",
                text: `No se encontraron géneros asociados al artista "${disc.artist.name}".`,
                icon: "warning",
                position: "top-end",
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
                toast: true,
              });
            }
          } else {
            Swal.fire({
              title: "No se encontraron lanzamientos",
              text: `No se encontraron tracks recientes para el artista "${disc.artist.name}".`,
              icon: "warning",
              position: "top-end",
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false,
              toast: true,
            });
          }
        } else {
          Swal.fire({
            title: "Artista no encontrado",
            text: `No se encontró información para el artista "${disc.artist.name}" en Spotify.`,
            icon: "warning",
            position: "top-end",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
          });
        }
      } catch (error) {
        console.error("Error al buscar el género por último track:", error);
        Swal.fire({
          title: "Error",
          text: "Ocurrió un error al buscar el género del último track.",
          icon: "error",
          position: "top-end",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
        });
      }
    };


    return {
      editingName,
      editingLink,
      editedData,
      editingDate,
      formattedDate,
      enableEditing,
      saveChanges,
      toggleEp,
      toggleVerified,
      confirmDelete,
      getGenreColor,
      getLinkText,
      buscarGeneroSpotify
    };
  },
});
