import api from "@services/api/api.ts";

export async function postReunion(payload: any): Promise<void> {
  const response = await api.post("/reunions", payload);
  return response.data;
}

export async function getReunionDetails(reunionId: string): Promise<void> {
  console.log("reunionId", reunionId);
  const response = await api.get<any>(`/reunions/${reunionId}`); // Usamos la ruta correcta para obtener un detalle específico
  return response.data;
}

export async function updateReunion(id: string, data: any): Promise<void> {
  console.log("entra", id);
  console.log("Datos enviados al backend:", data); // Asegúrate de que 'image' esté presente aquí

  await api.patch(`/reunions/${id}`, data);
}

export async function getReunions(limit: number, offset: number): Promise<any> {
  const response = await api.get<any>("/reunions", {
    params: { limit, offset }, // Usa limit y offset según PaginationDto
  });
  return response.data;
}
