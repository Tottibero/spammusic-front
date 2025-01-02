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
