import api from "./api";

// Interfaces
export interface User {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
  roles: string[];
  image: string | null;
}

export interface DiscRate {
  id: string;
  rate: string;
  cover: string;
  user: User;
}

// Servicio
export async function getDiscRates(discId: string): Promise<DiscRate[]> {
  const response = await api.get<DiscRate[]>(`/rates/disc/${discId}`);

  return response.data;
}
