import api from "@services/api/api.ts";

export async function postFavoriteService(payload: any): Promise<void> {
  const response = await api.post("/favorites", payload);
  return response.data;
}


export async function deleteFavoriteService(id: string): Promise<void> {
    console.log(`Deleting disc with id: ${id}`);
    await api.delete(`/favorites/${id}`);
  }
  
  export async function getFavoritesByUser(
    limit: number,
    offset: number,
    query?: string,
    dateRange?: any,
    genre?: string,
  ): Promise<any[]> {
    const response = await api.get<any[]>("/favorites", {
      params: {
        limit,
        offset,
        query, // Incluye el query en los parámetros si está definido
        dateRange,
        genre,
      },
    });
    return response.data;
  }
  