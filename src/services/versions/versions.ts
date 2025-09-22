// @services/spotify/spotify.ts
import api from '@services/api/api';

// =========================
// Tipos
// =========================
export type SpotifyEstado =
  | 'actualizada'
  | 'publicada'
  | 'para_publicar'
  | 'por_actualizar'
  | 'en_desarrollo';

export const SPOTIFY_ESTADOS: SpotifyEstado[] = [
  'actualizada',
  'publicada',
  'para_publicar',
  'por_actualizar',
  'en_desarrollo',
];

export type SpotifyTipo = 'festival' | 'especial' | 'genero' | 'otras';

export const SPOTIFY_TIPOS: SpotifyTipo[] = ['festival', 'especial', 'genero', 'otras'];

export interface Spotify {
  id: string;
  nombre: string;
  estado: SpotifyEstado;
  enlace: string;
  tipo: SpotifyTipo;
  fechaActualizacion: string; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// =========================
// DTOs (frontend)
// =========================
export interface CreateSpotifyDto {
  nombre: string;
  estado: SpotifyEstado;
  enlace: string;
  tipo: SpotifyTipo;
  /** ISO8601, ej "2025-09-22T10:00:00Z" */
  fechaActualizacion: string;
}

export interface UpdateSpotifyDto extends Partial<CreateSpotifyDto> {}

// Utils
export const toISO = (d: Date) => d.toISOString();

// =========================
// Listado con filtros
// =========================
export interface ListSpotifyParams {
  limit?: number;
  offset?: number;
  /** búsqueda por texto si la añades en el backend (nombre, etc.) */
  q?: string;
  estado?: SpotifyEstado;
  tipo?: SpotifyTipo;
}

export async function listSpotify(params: ListSpotifyParams = {}): Promise<Spotify[]> {
  const { data } = await api.get<Spotify[]>('/spotify', { params });
  return data;
}

// =========================
// CRUD
// =========================
export async function createSpotify(dto: CreateSpotifyDto): Promise<Spotify> {
  const { data } = await api.post<Spotify>('/spotify', dto);
  return data;
}

export async function getSpotify(id: string): Promise<Spotify> {
  const { data } = await api.get<Spotify>(`/spotify/${id}`);
  return data;
}

export async function updateSpotify(id: string, dto: UpdateSpotifyDto): Promise<Spotify> {
  const { data } = await api.patch<Spotify>(`/spotify/${id}`, dto);
  return data;
}

export async function removeSpotify(id: string): Promise<{ ok: true } | { message: string }> {
  const { data } = await api.delete<{ ok: true } | { message: string }>(`/spotify/${id}`);
  return data;
}
