import { defineStore } from "pinia";
import { getUsers } from "@services/users/users";

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [] as any[], // Lista de usuarios
  }),

  actions: {
    async loadUsers() {
      try {
        const response = await getUsers();
        this.users = response;
      } catch (error) {
        console.error("Error loading users:", error);
        throw error; // Opcional: lanzar el error para manejarlo en el componente
      }
    },

    addUser(user: any) {
      this.users.push(user);
    },

    removeUser(userId: string) {
      this.users = this.users.filter((user) => user.id !== userId);
    },

    updateUser(updatedUser: any) {
      const index = this.users.findIndex((user) => user.id === updatedUser.id);
      if (index !== -1) {
        this.users[index] = {
          ...this.users[index],
          ...updatedUser,
        };
      }
    },
  },

  getters: {
    getUserById: (state) => (id: string) => {
      return state.users.find((user) => user.id === id);
    },
  },
});