import api from './api';

export interface RatePayload {
  discId: string;
  rate: number;
  cover: number;
}

export async function postRate(payload: RatePayload): Promise<void> {
  await api.post('/rates', payload);
}

export async function updateRate(rateId: string, updateRateDto: any) {
  // PATCH /rates/:id
  console.log("update rate", updateRateDto)
  return api.patch(`/rates/${rateId}`, updateRateDto);
}
