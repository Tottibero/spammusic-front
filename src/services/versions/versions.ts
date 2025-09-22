// @services/versions/versions.ts
import api from '@services/api/api';

// =========================
// Tipos
// =========================
export type ChangeType =
  | 'feat' | 'fix' | 'docs' | 'style' | 'refactor'
  | 'perf' | 'test' | 'build' | 'ci' | 'chore' | 'revert';

export type DevState = 'todo' | 'in_progress' | 'in_review' | 'done';

export interface VersionItem {
  id: string;
  type: ChangeType;
  description: string;
  scope?: string;
  breaking?: boolean;
  publicVisible: boolean;
  state: DevState;
}

export interface Version {
  id: string;
  version: string;
  releaseDate?: string;   // ISO
  notes?: string;
  isActive: boolean;
  publishedAt?: string;   // ISO
  createdAt: string;      // ISO
  updatedAt: string;      // ISO
  items: VersionItem[];
}

// Respuesta cursor
export interface VersionsInfiniteResponse {
  data: Version[];
  nextCursor?: string;
}

// Crear/Actualizar DTOs (frontend)
export interface CreateVersionItemDto {
  type: ChangeType;
  description: string;
  scope?: string;
  breaking?: boolean;
  publicVisible?: boolean;
  state?: DevState;
}

export interface UpdateVersionItemDto extends Partial<CreateVersionItemDto> {}

export interface CreateVersionDto {
  version: string;
  releaseDate?: string; // 'YYYY-MM-DD'
  notes?: string;
  isActive?: boolean;
  publishedAt?: string; // ISO
  items?: CreateVersionItemDto[];
}

export interface UpdateVersionDto extends Partial<CreateVersionDto> {}

// Utils
export const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// =========================
// Endpoints PÚBLICOS
// =========================

// Última versión activa (para footer)
export async function getLatestPublicVersion(): Promise<Version | null> {
  const { data } = await api.get<Version | null>('/versions/public/latest');
  return data;
}

// Scroll infinito (cursor-based)
export async function getPublicVersionsInfinite(
  limit = 20,
  cursor?: string
): Promise<VersionsInfiniteResponse> {
  const { data } = await api.get<VersionsInfiniteResponse>('/versions/public/infinite', {
    params: { limit, cursor },
  });
  return data;
}

// (Opcional) listar públicas sin cursor (no recomendado para infinito)
export async function getPublicVersions(): Promise<Version[]> {
  const { data } = await api.get<Version[]>('/versions/public');
  return data;
}

// =========================
// CRUD de Version (admin)
// =========================

export async function createVersion(dto: CreateVersionDto): Promise<Version> {
  const { data } = await api.post<Version>('/versions', dto);
  return data;
}

export interface ListVersionsParams {
  limit?: number;    // si tu endpoint soporta offset/limit clásico
  offset?: number;
  query?: string;    // si añades búsqueda en el backend
  isActive?: boolean;
}

export async function listVersions(params: ListVersionsParams = {}): Promise<Version[]> {
  const { data } = await api.get<Version[]>('/versions', { params });
  return data;
}

export async function getVersion(id: string): Promise<Version> {
  const { data } = await api.get<Version>(`/versions/${id}`);
  return data;
}

export async function updateVersion(id: string, dto: UpdateVersionDto): Promise<Version> {
  const { data } = await api.patch<Version>(`/versions/${id}`, dto);
  return data;
}

export async function removeVersion(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/versions/${id}`);
  return data;
}

// Activar / desactivar una versión
export async function setVersionActive(id: string, active: boolean): Promise<Version> {
  const { data } = await api.patch<Version>(`/versions/${id}/active`, { active });
  return data;
}

// =========================
// CRUD anidado de Items
// =========================

// Listar items de una versión (puedes añadir filtros como ?state=)
export async function listVersionItems(
  versionId: string,
  opts?: { state?: DevState }
): Promise<VersionItem[]> {
  const { data } = await api.get<VersionItem[]>(`/versions/${versionId}/items`, {
    params: opts,
  });
  return data;
}

// Crear item
export async function createVersionItem(
  versionId: string,
  dto: CreateVersionItemDto
): Promise<VersionItem> {
  const { data } = await api.post<VersionItem>(`/versions/${versionId}/items`, dto);
  return data;
}

// Actualizar item
export async function updateVersionItem(
  versionId: string,
  itemId: string,
  dto: UpdateVersionItemDto
): Promise<VersionItem> {
  const { data } = await api.patch<VersionItem>(`/versions/${versionId}/items/${itemId}`, dto);
  return data;
}

// Eliminar item
export async function removeVersionItem(
  versionId: string,
  itemId: string
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/versions/${versionId}/items/${itemId}`);
  return data;
}

export async function getLatestDraftVersion(): Promise<Version | null> {
  const { data } = await api.get<Version | null>('/versions/draft/latest');
  return data;
}

