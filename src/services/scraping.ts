import api from "./api";

export interface ScrapingResponse {
  message: string;
  data: any;
}

/**
 * Fetches scraped data from the given API endpoint.
 * @param apiType The type of API to call (e.g., "boolintunes", "heavymusichq").
 * @param month The month to scrape data for.
 * @param day (Optional) The specific day to scrape data for.
 */
export async function fetchScrapingData(
  apiType: string,
  month: string,
  day?: number
): Promise<ScrapingResponse> {
  const response = await api.post<ScrapingResponse>(`/scraping/${apiType}`, {
    month,
    day,
  });
  return response.data;
}

/**
 * Envia datos manuales para ser procesados en el backend.
 * @param date Fecha en formato MM-DD-YYYY.
 * @param albums Lista de álbumes.
 */
export async function fetchManualData(date: string, albums: string[]) {
    try {
      const response = await api.post(`/scraping/process-manual-data`, {
        date,
        albums,
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Error processing data');
      } else {
        throw new Error('Network error or server is unreachable');
      }
    }
  }
  