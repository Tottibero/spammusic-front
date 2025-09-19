import api from "@services/api/api.ts";

export async function postcommentService(payload: any): Promise<void> {
  const response = await api.post("/comments", payload);
  return response.data;
}

export async function updatecommentService(
  ratingId: string,
  updatecommentDto: any
) {
  // PATCH /comments/:id
  console.log("update comment", updatecommentDto);
  return api.patch(`/comments/${ratingId}`, updatecommentDto);
}

export async function getDisccomments(discId: string): Promise<any[]> {
  const response = await api.get<any[]>(`/comments/disc/${discId}`);

  return response.data;
}

export async function deleteCommentService(id: string): Promise<void> {
  console.log(`Deleting comment with id: ${id}`);
  await api.delete(`/comments/${id}`);
}

export async function updateCommentService(
  ratingId: string,
  updatecommentDto: any
) {
  // PATCH /comments/:id
  console.log("update comment", updatecommentDto);
  const response = await api.patch(`/comments/${ratingId}`, updatecommentDto);
  return response.data; 
}
