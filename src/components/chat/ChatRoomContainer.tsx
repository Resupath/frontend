import { cookies } from "next/headers";
import { api } from "@/src/utils/api";
import { ChatRoomClient } from "@/src/components/chat/ChatRoomClient";
import { RoomWithCharacter } from "@/src/types/room";
import { Chat } from "@/src/types/chat";
import { Character } from "@/src/types/character";

async function getRoomInfoInServerSide(roomId: string, auth: string, userToken: string) {
    try {
        const response = await api.get<RoomWithCharacter>(`/rooms/${roomId}`, {
            headers: {
                "X-Member": `Bearer ${auth}`,
                "X-User": `Bearer ${userToken}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch room info:", error);
        throw new Error("Failed to fetch room info");
    }
}

async function getChatsInServerSide(roomId: string, auth: string, userToken: string) {
    try {
        const response = await api.get<Chat[]>(`/chats/${roomId}`, {
            headers: {
                "X-Member": `Bearer ${auth}`,
                "X-User": `Bearer ${userToken}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch chats:", error);
        throw new Error("Failed to fetch chats");
    }
}

async function getCharacterInServerSide(characterId: string, auth: string, userToken: string) {
    try {
        const response = await api.get<Character>(`/characters/${characterId}`, {
            headers: {
                "X-Member": `Bearer ${auth}`,
                "X-User": `Bearer ${userToken}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch character:", error);
        throw new Error("Failed to fetch character");
    }
}

export default async function ChatRoomContainer({ roomId }: { roomId: string }) {
    const cookieStore = await cookies();
    const auth = cookieStore.get("auth");
    const userToken = cookieStore.get("userToken");

    try {
        const roomInfo = await getRoomInfoInServerSide(roomId, auth?.value || "", userToken?.value || "");

        const [initialChats, characterDetail] = await Promise.all([
            getChatsInServerSide(roomId, auth?.value || "", userToken?.value || ""),
            getCharacterInServerSide(roomInfo.character.id, auth?.value || "", userToken?.value || ""),
        ]);

        return (
            <ChatRoomClient
                roomId={roomId}
                roomInfo={roomInfo}
                initialChats={initialChats}
                characterDetail={characterDetail}
            />
        );
    } catch (error) {
        console.error("Failed to fetch data:", error);
        throw error;
    }
}
