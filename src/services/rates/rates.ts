import api from "@services/api/api.ts";
import type { Disc } from "@services/discs/discs";

export interface RatePayload {
  discId: string;
  rate: number;
  cover: number;
}

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
  disc?: Disc;
}

export async function postRateService(payload: any): Promise<void> {
  const response = await api.post("/rates", payload);
  return response.data;
}

export async function updateRateService(ratingId: string, updateRateDto: any) {
  // PATCH /rates/:id
  console.log("update rate", updateRateDto);
  return api.patch(`/rates/${ratingId}`, updateRateDto);
}

export async function getRatesByUser(
  limit: number,
  offset: number,
  query?: string,
  dateRange?: any,
  genre?: string,
): Promise<DiscRate[]> {
  const response = await api.get<DiscRate[]>("/rates", {
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

export async function getDiscRates(discId: string): Promise<DiscRate[]> {
  const response = await api.get<DiscRate[]>(`/rates/disc/${discId}`);

  return response.data;
}
