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

export async function updateDisc(id: string, data: { name: string; genreId: string }): Promise<void> {
  console.log("entra", id)
  await api.patch(`/discs/${id}`, data);
}
