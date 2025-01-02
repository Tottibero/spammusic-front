import api from "./api";

// Interfaces
export interface Artist {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Disc {
  id: string;
  name: string;
  description: string;
  image: string;
  releaseDate: string;
  artist: Artist;
  verified: boolean;
  EP: boolean;
}

export interface GroupedDiscs {
  releaseDate: string;
  discs: Disc[];
}

export interface DiscsResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  data: GroupedDiscs[];
}

// Servicio
export async function getDiscsDated(
  limit: number,
  offset: number
): Promise<DiscsResponse> {
  const response = await api.get<DiscsResponse>("/discs/date", {
    params: { limit, offset }, // Pasa limit y offset como parámetros
  });

  return response.data;
}
