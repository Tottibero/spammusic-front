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
