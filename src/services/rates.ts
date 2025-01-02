import api from './api';

export interface RatePayload {
  discId: string;
  rate: number;
  cover: number;
}

export async function postRate(payload: RatePayload): Promise<void> {
  await api.post('/rates', payload);
}
