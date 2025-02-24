import { RoomWithCharacter } from "@/src/types/room";
import { Chat } from "@/src/types/chat";
import { Suspense } from "react";
import { ChatRoomClient } from "../../../src/components/chat/ChatRoomClient";
import { cookies } from "next/headers";
import { api } from "@/src/utils/api";

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

type tParams = Promise<{ id: string }>;

export default async function ChatRoom(props: { params: tParams }) {
    const params = await props.params;

    const roomId = params.id;
    const cookieStore = await cookies();
    const auth = cookieStore.get("auth");
    const userToken = cookieStore.get("userToken");

    try {
        const [roomInfo, initialChats] = await Promise.all([
            getRoomInfoInServerSide(roomId, auth?.value || "", userToken?.value || ""),
            getChatsInServerSide(roomId, auth?.value || "", userToken?.value || ""),
        ]);

        return (
            <Suspense fallback={<div className="w-full h-full flex justify-center items-center">Loading...</div>}>
                <ChatRoomClient roomId={roomId} roomInfo={roomInfo} initialChats={initialChats} />
            </Suspense>
        );
    } catch (error) {
        console.error("Failed to fetch data:", error);
        throw error;
    }
}
