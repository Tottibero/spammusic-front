import api from "@services/api/api.ts";

export interface Country {
  id: string;
  name: string;
  isoCode: string | null; // por si viene null en BD
}

export interface CountriesResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  data: Country[];
}

/** Obtener la lista de países con paginación */
export async function getCountries(
  limit: number,
  offset: number
): Promise<CountriesResponse> {
  const response = await api.get<CountriesResponse>("/countries", {
    params: { limit, offset },
  });
  return response.data;
}

/** Obtener todos los países sin paginación */
export async function getAllCountries(): Promise<Country[]> {
  const response = await api.get<Country[]>("/countries/all");
  return response.data;
}

