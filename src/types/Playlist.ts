import { UserPreviewDTO } from "./User";

enum PlaylistVisibility {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE",
}

export interface PlaylistPreviewDTO {
    id: string;
    name: string;
    coverUrl: string;
    owner: UserPreviewDTO;
    visibility: PlaylistVisibility;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
}