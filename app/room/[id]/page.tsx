import { Suspense } from "react";
import { ChatMessageSkeleton } from "@/src/components/skeleton/ChatMessageSkeleton";
import ChatRoomContainer from "@/src/components/chat/ChatRoomContainer";

type tParams = Promise<{ id: string }>;

export default async function ChatRoom(props: { params: tParams }) {
    const params = await props.params;
    const roomId = params.id;

    return (
        <Suspense
            fallback={
                <div className="max-w-4xl mx-auto h-full p-6">
                    <ChatMessageSkeleton />
                </div>
            }
        >
            <ChatRoomContainer roomId={roomId} />
        </Suspense>
    );
}
