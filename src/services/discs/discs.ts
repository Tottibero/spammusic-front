import api from "@services/api/api.ts";

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
  userRate?: any; // Opcional para compatibilidad
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
  data: GroupedDiscs[] | Disc[]; // Compatible con ambas estructuras de datos
}

export interface DiscsStatsResponse {
  discs: Disc[];
  totalDiscs: number;
  totalVotes: number;
}

// Servicios
export async function getDiscsDated(
  limit: number,
  offset: number
): Promise<DiscsResponse> {
  const response = await api.get<DiscsResponse>("/discs/date", {
    params: { limit, offset }, // Pasa limit y offset como parámetros
  });

  return response.data;
}

export async function getDiscs(
  limit: number,
  offset: number,
  query?: string,
  dateRange?: any
): Promise<DiscsResponse> {
  const response = await api.get<DiscsResponse>("/discs", {
    params: {
      limit,
      offset,
      query, // Incluye el query en los parámetros si está definido
      dateRange
    },
  });
  return response.data;
}

export async function updateDisc(
  id: string,
  data: {
    name?: string;
    genreId?: string;
    link?: string;
    image?: string;
    releaseDate?: any;
    verified?: boolean;
    ep?: boolean;
  }
): Promise<void> {
  console.log("entra", id);
  console.log("Datos enviados al backend:", data); // Asegúrate de que 'image' esté presente aquí

  await api.patch(`/discs/${id}`, data);
}

export async function deleteDisc(id: string): Promise<void> {
  console.log(`Deleting disc with id: ${id}`);
  await api.delete(`/discs/${id}`);
}

export async function getTopRatedOrFeaturedAndStats(): Promise<DiscsStatsResponse> {
  const response = await api.get<DiscsStatsResponse>("/discs/pepe");
  return response.data;
}
