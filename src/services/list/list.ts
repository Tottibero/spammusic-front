import api from "@services/api/api.ts";

export async function postList(payload: any): Promise<void> {
  const response = await api.post("/lists", payload);
  return response.data;
}

export async function getListDetails(listId: string): Promise<void> {
  console.log("listId", listId);
  const response = await api.get<any>(`/lists/${listId}`); // Usamos la ruta correcta para obtener un detalle específico
  return response.data;
}

export async function updateList(id: string, data: any): Promise<void> {
  console.log("entra", id);
  console.log("Datos enviados al backend:", data); // Asegúrate de que 'image' esté presente aquí

  await api.patch(`/lists/${id}`, data);
}

export async function getLists(
  limit?: number,
  offset?: number,
  statusExclusions?: string[] // Nuevo parámetro para excluir estados
): Promise<any> {
  const response = await api.get<any>("/lists", {
    params: { limit, offset, statusExclusions }, // Agregar statusExclusions como parámetro
  });
  return response.data;
}
