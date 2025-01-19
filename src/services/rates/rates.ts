import api from "@services/api/api.ts";

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
}


export async function postRateService(payload: any): Promise<void> {
  await api.post('/rates', payload);
}

export async function updateRateService( ratingId: string, updateRateDto: any) {
  // PATCH /rates/:id
  console.log("update rate", updateRateDto)
  return api.patch(`/rates/${ratingId}`, updateRateDto);
}

export async function getDiscRates(discId: string): Promise<DiscRate[]> {
  const response = await api.get<DiscRate[]>(`/rates/disc/${discId}`);

  return response.data;
}
