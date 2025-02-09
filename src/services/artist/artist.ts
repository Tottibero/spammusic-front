import api from "@services/api/api.ts";

export async function postArtist(payload: any): Promise<void> {
  const response = await api.post("/artists", payload);
  return response.data;
}

export async function updateArtist(
  id: string,
  data: {
    name: string;
  }
): Promise<void> {
  console.log("entra", id);
  console.log("Datos enviados al backend:", data); // Asegúrate de que 'image' esté presente aquí

  await api.patch(`/artists/${id}`, data);
}

export async function deleteArtist(id: string): Promise<void> {
  await api.delete(`/artists/${id}`);
}
