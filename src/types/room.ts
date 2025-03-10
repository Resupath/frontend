import { api } from "../utils/api";
import { Character } from "./character";
import * as TE from "fp-ts/TaskEither";

interface Room {
    id: string;
    createdAt: string;
}

interface RoomWithCharacter extends Room {
    user: {
        id: string;
    };
    character: {
        id: string;
        createdAt: string;
        nickname: string;
        image: string | null;
    };
}

const createRoom = (characterId: Character["id"]) =>
    TE.tryCatch(
        () => api.post<{ id: Room["id"] }>(`/rooms`, { characterId }, { showLoading: true }),
        (error) => new Error("Failed to create room")
    );

const getRoom = (roomId: Room["id"]) =>
    TE.tryCatch(
        () => api.get<RoomWithCharacter>(`/rooms/${roomId}`),
        (error) => new Error("Failed to get room")
    );

const listRooms = () =>
    TE.tryCatch(
        () => api.get<RoomWithCharacter[]>("/rooms"),
        (error) => new Error("Failed to fetch rooms")
    );

const deleteRoom = (roomId: Room["id"]) =>
    TE.tryCatch(
        () => api.delete(`/rooms/${roomId}`),
        (error) => new Error("Failed to delete room")
    );

export { createRoom, getRoom, listRooms, deleteRoom };

export type { Room, RoomWithCharacter };
