import api from "@services/api/api.ts";

export async function getUsers(): Promise<any> {
  const response = await api.get<any>("/auth/users");
  return response.data;
}

export async function getRvUsers(): Promise<any> {
  const response = await api.get<any>("/auth/usersRv");
  return response.data;
}

export async function postUserService(payload: any): Promise<void> {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export async function updateUserService( updateUserDto: any) {

  console.log("update rate", updateUserDto);
  return api.patch(`/auth`, updateUserDto);
}

export async function updateUserSuperAdminService( id: string, updateUserDto: any) {

  console.log("update rate", updateUserDto);
  return api.patch(`/auth/superadmin/${id}`, updateUserDto);
}

export async function deleteUserService(id: string): Promise<void> {
  console.log(`Deleting disc with id: ${id}`);
  await api.delete(`/auth/${id}`);
}
