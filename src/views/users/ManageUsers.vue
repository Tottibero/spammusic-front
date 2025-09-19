<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">Lista de usuarios</h2>

    <button @click="showForm = true" class="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
      Crear Usuario
    </button>

    <div v-if="showForm" class="mb-4 p-4 border rounded bg-gray-100">
      <h3 class="text-lg font-semibold mb-2">Nuevo Usuario</h3>
      <input v-model="newUser.email" placeholder="Email" class="input-field" />
      <input v-model="newUser.username" placeholder="Username" class="input-field" />
      <input type="password" v-model="newUser.password" placeholder="Password" class="input-field" />
      <p v-if="passwordValidation(newUser.password)" class="error-text">
        {{ passwordValidation(newUser.password) }}
      </p>
 <div class="flex flex-wrap gap-2 mt-2">
          <label><input type="checkbox" v-model="newUser.roles" value="babyUser" /> Baby User</label>
          <label><input type="checkbox" v-model="newUser.roles" value="user" /> User</label>
          <label><input type="checkbox" v-model="newUser.roles" value="superUser" /> Superuser</label>
          <label><input type="checkbox" v-model="newUser.roles" value="riffValley" /> Riff Valley</label>
        </div>
        <div class="flex space-x-2 mt-2">
        <button @click="createUser" class="btn-save">Guardar</button>
        <button @click="showForm = false" class="btn-cancel">Cancelar</button>
      </div>
    </div>

    <!-- Tabla responsiva -->
    <div class="overflow-x-auto w-full">
      <table class="w-full border border-gray-300 min-w-[600px]">
        <thead class="bg-gray-200 hidden md:table-header-group">
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
          <tr v-for="user in users" :key="user.id" class="border md:table-row flex flex-col md:flex-row">
            <td class="p-2 border font-bold md:font-normal">{{ user.id }}</td>
            <td class="p-2 border"><input v-model="user.email" class="input-field" /></td>
            <td class="p-2 border"><input v-model="user.username" class="input-field" /></td>
            <td class="p-2 border">
              <div class="flex flex-wrap gap-2">
                <label><input type="checkbox" v-model="user.roles" value="babyUser" /> Baby User</label>
                <label><input type="checkbox" v-model="user.roles" value="user" /> User</label>
                <label><input type="checkbox" v-model="user.roles" value="superUser" /> Superuser</label>
                <label><input type="checkbox" v-model="user.roles" value="riffValley" /> Riff Valley</label>
              </div>
            </td>
            <td class="p-2 border">
              <input type="password" v-model="user.password" class="input-field" />
              <p v-if="passwordValidation(user.password)" class="error-text">
                {{ passwordValidation(user.password) }}
              </p>
            </td>
            <td class="p-2 border text-center flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-2">
              <button @click="updateUser(user)" class="btn-save">Guardar</button>
              <button @click="confirmDeleteUser(user)" class="btn-cancel">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
    const newUser = ref({ email: "", username: "", password: "", roles: [] })

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

<style scoped>
.input-field {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.error-text {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.btn-save {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 5px;
  text-align: center;
}

.btn-save:hover {
  background-color: #2563eb;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border-radius: 5px;
  text-align: center;
}

.btn-cancel:hover {
  background-color: #dc2626;
}

/* Responsividad */
@media (max-width: 768px) {
  .overflow-x-auto {
    overflow-x: scroll;
  }

  table {
    display: block;
    width: 100%;
    white-space: nowrap;
  }

  tbody {
    display: block;
  }

  tr {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    background: #fff;
    border-radius: 10px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  td {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
