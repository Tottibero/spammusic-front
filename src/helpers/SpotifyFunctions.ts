import axios from "axios";

/**
 * Obtiene un token de acceso para la API de Spotify.
 * @returns {Promise<string | undefined>} Retorna el token de acceso o undefined si hay un error.
 */
export const obtenerTokenSpotify = async (): Promise<string | undefined> => {
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
    return undefined;
  }
};

/**
 * Busca el enlace de Spotify para un artista por su nombre.
 * @param {string} artistName - El nombre del artista a buscar.
 * @returns {Promise<string | undefined>} Retorna el enlace de Spotify del artista o undefined si no se encuentra.
 */
export const obtenerEnlaceArtistaSpotify = async (
  artistName: string
): Promise<string | undefined> => {
  try {
    // Obtén el token de acceso
    const token = await obtenerTokenSpotify();
    if (!token) {
      console.error("No se pudo obtener el token de Spotify.");
      return undefined;
    }

    // Realiza la búsqueda del artista
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: artistName,
        type: "artist",
        limit: 1, // Limitar la búsqueda al primer resultado
      },
    });

    // Verifica si hay resultados y retorna el enlace
    const artist = response.data.artists.items[0];
    if (artist) {
      return artist.external_urls.spotify;
    } else {
      console.warn("Artista no encontrado en Spotify.");
      return undefined;
    }
  } catch (error) {
    console.error("Error al buscar el artista en Spotify:", error);
    return undefined;
  }
};
