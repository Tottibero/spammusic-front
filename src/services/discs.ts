import api from "./api";

export interface Disc {
  id: string;
  name: string;
  description: string;
  image: string;
  releaseDate: string;
  artist: {
    id: string;
    name: string;
    description: string;
    image: string;
  };
  userRate: any;
}

export interface DiscsResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  data: Disc[];
}

export async function getDiscs(
  limit: number,
  offset: number
): Promise<DiscsResponse> {
  const response = await api.get<DiscsResponse>("/discs", {
    params: { limit, offset }, // Usa limit y offset según PaginationDto
  });
  return response.data;
}

export async function updateDisc(
  id: string,
  data: { name?: string; genreId?: string; link?: string; image?: string, releaseDate?: any }
): Promise<void> {
  console.log("entra", id);
  console.log("Datos enviados al backend:", data); // Asegúrate de que 'image' esté presente aquí

  await api.patch(`/discs/${id}`, data);
}

export async function deleteDisc(id: string): Promise<void> {
  console.log(`Deleting disc with id: ${id}`);
  await api.delete(`/discs/${id}`);
}
