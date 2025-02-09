<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">Lista de Usuarios</h2>

    <button
      @click="showForm = true"
      class="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
    >
      Crear Usuario
    </button>

    <div v-if="showForm" class="mb-4 p-4 border rounded bg-gray-100">
      <h3 class="text-lg font-semibold mb-2">Nuevo Usuario</h3>
      <input
        v-model="newUser.email"
        placeholder="Email"
        class="p-1 border rounded w-full mb-2"
      />
      <input
        v-model="newUser.username"
        placeholder="Username"
        class="p-1 border rounded w-full mb-2"
      />
      <input
        type="password"
        v-model="newUser.password"
        placeholder="Password"
        class="p-1 border rounded w-full mb-2"
      />
      <p
        v-if="passwordValidation(newUser.password)"
        class="text-red-500 text-sm mb-2"
      >
        {{ passwordValidation(newUser.password) }}
      </p>
      <div class="flex space-x-2">
        <button
          @click="createUser"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Guardar
        </button>
        <button
          @click="showForm = false"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Cancelar
        </button>
      </div>
    </div>

    <table class="w-full border border-gray-300">
      <thead class="bg-gray-200">
        <tr>
          <th class="p-2 border">ID</th>
          <th class="p-2 border">Email</th>
          <th class="p-2 border">Username</th>
          <th class="p-2 border">Roles</th>
          <th class="p-2 border">Password</th>
          <th class="p-2 border">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id" class="border">
          <td class="p-2 border">{{ user.id }}</td>
          <td class="p-2 border">
            <input v-model="user.email" class="p-1 border rounded w-full" />
          </td>
          <td class="p-2 border">
            <input v-model="user.username" class="p-1 border rounded w-full" />
          </td>
          <td class="p-2 border">
            <label>
              <input type="checkbox" v-model="user.roles" value="user" /> User
            </label>
            <label class="ml-4">
              <input type="checkbox" v-model="user.roles" value="superUser" />
              Superuser
            </label>
          </td>
          <td class="p-2 border">
            <input
              type="password"
              v-model="user.password"
              class="p-1 border rounded w-full"
            />
            <p
              v-if="passwordValidation(user.password)"
              class="text-red-500 text-sm"
            >
              {{ passwordValidation(user.password) }}
            </p>
          </td>
          <td class="p-2 border text-center">
            <button
              @click="updateUser(user)"
              class="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Guardar
            </button>
            <button
              @click="confirmDeleteUser(user)"
              class="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
            >
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useUserStore } from "@stores/user/users";
import SwalService from "@services/swal/SwalService";

export default defineComponent({
  name: "EditListForm",
  setup() {
    const userStore = useUserStore();
    const users = ref([]);
    const showForm = ref(false);
    const newUser = ref({ email: "", username: "", password: "" });

    onMounted(async () => {
      try {
        await userStore.loadUsers();
        users.value = userStore.users.map((user) => ({
          ...user,
          password: "",
        }));
      } catch (error) {
        console.error("Error loading users:", error);
        SwalService.error("Failed to load users.");
      }
    });

    const passwordValidation = (password: string) => {
      if (!password) return "";
      if (password.length < 6)
        return "La contraseña debe tener al menos 6 caracteres.";
      if (!/[A-Z]/.test(password))
        return "Debe incluir al menos una letra mayúscula.";
      if (!/[a-z]/.test(password))
        return "Debe incluir al menos una letra minúscula.";
      if (!/[0-9]/.test(password)) return "Debe incluir al menos un número.";
      return "";
    };

    const updateUser = async (user) => {
      try {
        await userStore.updateUserSuperAdminStore(user.id, {
          email: user.email,
          username: user.username,
          roles: user.roles,
          password: user.password || undefined,
        });
        SwalService.success("User updated successfully!");
      } catch (error) {
        console.error("Error updating user:", error);
        SwalService.error("Failed to update user.");
      }
    };

    const createUser = async () => {
      if (passwordValidation(newUser.value.password)) return;
      try {
        const createdUser = await userStore.createUser({
          email: newUser.value.email,
          username: newUser.value.username,
          roles: newUser.value.roles,
          password: newUser.value.password,
        });
        users.value.push({ ...createdUser, password: "" });
        newUser.value = { email: "", username: "", password: "" };
        showForm.value = false;
        SwalService.success("User created successfully!");
      } catch (error) {
        console.error("Error creating user:", error);
        SwalService.error("Failed to create user.");
      }
    };

    const confirmDeleteUser = (user) => {
      SwalService.confirm(
        "¿Estás seguro?",
        "Esta acción no se puede deshacer",
        "warning"
      ).then(async (result) => {
        if (result.isConfirmed) {
          await deleteUser(user);
        }
      });
    };

    const deleteUser = async (user) => {
      try {
        await userStore.removeUser(user.id);
        users.value = users.value.filter((u) => u.id !== user.id);
        SwalService.success("Usuario eliminado con éxito");
      } catch (error) {
        console.error("Error eliminando usuario:", error);
        SwalService.error("No se pudo eliminar el usuario");
      }
    };

    return {
      users,
      showForm,
      newUser,
      updateUser,
      createUser,
      passwordValidation,
      confirmDeleteUser,
    };
  },
});
</script>
