import api from './api';

export interface RatePayload {
  discId: string;
  rate: number;
  cover: number;
}

export async function postRateService(payload: any): Promise<void> {
  await api.post('/rates', payload);
}

export async function updateRateService( ratingId: string, updateRateDto: any) {
  // PATCH /rates/:id
  console.log("update rate", updateRateDto)
  return api.patch(`/rates/${ratingId}`, updateRateDto);
}
