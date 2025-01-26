import { defineStore } from "pinia";
import {
  getAsignationsByListService,
  deleteAsignationService,
  updateAsignationService,
} from "@services/asignation/asignation";

export const useAsignationStore = defineStore("asignation", {
  state: () => ({
    asignations: [] as any[], // Array de asignaciones
  }),

  actions: {
    async loadAsignations(listId: string) {
      try {
        const response = await getAsignationsByListService(listId);
        this.asignations = response.data;
      } catch (error) {
        console.error("Error loading asignations:", error);
        throw error;
      }
    },

    addAsignation(asignation: any) {
      this.asignations.push(asignation);
    },

    async updateAsignationStore(updatedAsignation: any) {
      try {
        console.log("Calling updateAsignation with:", updatedAsignation);
    
        const data = {
          done: updatedAsignation.done,
          userId: updatedAsignation.userId,
        };
    
        console.log("Data to be sent to service:", data);
    
        await updateAsignationService(updatedAsignation.id, data);
    
        const index = this.asignations.findIndex(
          (a) => a.id === updatedAsignation.id
        );
        if (index !== -1) {
          this.asignations[index] = {
            ...this.asignations[index],
            ...updatedAsignation,
          };
        }
        console.log("Asignation updated successfully:", this.asignations[index]);
      } catch (error) {
        console.error("Error updating asignation:", error);
        throw error;
      }
    },
    
    async removeAsignation(asignationId: string) {
      try {
        await deleteAsignationService(asignationId);
        this.asignations = this.asignations.filter(
          (a) => a.id !== asignationId
        );
      } catch (error) {
        console.error("Error removing asignation:", error);
        throw error; // Opcional: puedes lanzar el error para manejarlo en el componente
      }
    },
  },

  getters: {
    getAsignationById: (state) => (id: string) => {
      return state.asignations.find((a) => a.id === id);
    },
  },
});
