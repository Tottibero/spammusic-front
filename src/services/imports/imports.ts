import api from "@services/api/api.ts";


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
  