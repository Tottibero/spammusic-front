import api from "@services/api/api";

// Interfaces
export type ContentType = "article" | "photos" | "list" | "radar" | "best" | "video" | "meeting";

export interface Content {
    id: string;
    type: ContentType;
    name: string;
    notes?: string;
    publicationDate?: string; // ISO date string
    reunionId?: string;
    authorId: string;
    author?: {
        id: string;
        username: string;
        email: string;
        image?: string;
        isActive?: boolean;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateContentDto {
    type: ContentType;
    name: string;
    notes?: string;
    publicationDate?: string;
    reunionId?: string;
    authorId: string;
}

export interface UpdateContentDto {
    type?: ContentType;
    name?: string;
    notes?: string;
    publicationDate?: string | null;
    reunionId?: string;
    authorId?: string;
}

export interface ContentsByMonthResponse {
    year: number;
    month: number;
    contents: Content[];
}

// Services
export async function getContents(): Promise<Content[]> {
    const response = await api.get<Content[]>("/contents");
    return response.data;
}

export async function getContentById(id: string): Promise<Content> {
    const response = await api.get<Content>(`/contents/${id}`);
    return response.data;
}

export async function createContent(data: CreateContentDto): Promise<Content> {
    const response = await api.post<Content>("/contents", data);
    return response.data;
}

export async function updateContent(
    id: string,
    data: UpdateContentDto
): Promise<Content> {
    const response = await api.patch<Content>(`/contents/${id}`, data);
    return response.data;
}

export async function deleteContent(id: string): Promise<void> {
    await api.delete(`/contents/${id}`);
}

export async function getContentsByMonth(
    year: number,
    month: number
): Promise<Content[]> {
    const response = await api.get<Content[]>(
        `/contents/by-month`,
        {
            params: { year, month },
        }
    );
    return response.data;
}
