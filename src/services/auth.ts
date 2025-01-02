import api from "./api";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  password: string;
  username: string;
  token: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data; // La respuesta ya incluye `token`, `username`, etc.
}
