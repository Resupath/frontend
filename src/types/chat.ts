import { api } from "../utils/api";
import { Room } from "./room";
import * as TE from "fp-ts/TaskEither";

interface Chat {
    id: string;
    createdAt: string;
    userId: string | null;
    characterId: string | null;
    message: string;
}

const listChats = (roomId: Room["id"]) =>
    TE.tryCatch(
        () => api.get<Chat[]>(`/chats/${roomId}`),
        (error) => new Error("Failed to fetch chats")
    );

const createChat = (roomId: Room["id"]) => (message: Chat["message"]) =>
    TE.tryCatch(
        () => api.post<string>(`/chats/${roomId}`, { message }),
        (error) => new Error("Failed to create chat")
    );

export { createChat, listChats };

export type { Chat };
