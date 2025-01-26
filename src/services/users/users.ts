import api from "@services/api/api.ts";

export async function getUsers(): Promise<any> {
  const response = await api.get<any>("/auth/users");
  return response.data;
}
