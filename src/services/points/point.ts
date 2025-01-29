import api from "@services/api/api.ts";


export async function postPoint(payload: any): Promise<void> {
    const response = await api.post("/points", payload);
    return response.data;
}

export async function updatePoint(id: string, data: any): Promise<void> {
  await api.patch(`/points/${id}`, data);
}

export async function deletePoint(id: string): Promise<void> {
  await api.delete(`/points/${id}`);
}
