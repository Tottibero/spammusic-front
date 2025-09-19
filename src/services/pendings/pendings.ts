import api from "@services/api/api.ts";

export async function postPendingService(payload: any): Promise<void> {
  const response = await api.post("/pendings", payload);
  return response.data;
}

export async function deletePendingService(id: string): Promise<void> {
  console.log(`Deleting pending with id: ${id}`);
  await api.delete(`/pendings/${id}`);
}

export async function getPendingsByUser(
  limit: number,
  offset: number,
  query?: string,
  dateRange?: any,
  genre?: string,
): Promise<any[]> {
  const response = await api.get<any[]>("/pendings", {
    params: {
      limit,
      offset,
      query,
      dateRange,
      genre,
    },
  });
  return response.data;
}
