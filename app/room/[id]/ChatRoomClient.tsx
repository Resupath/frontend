"use client";

import { useEffect, useState, useRef } from "react";
import { Chat } from "@/src/types/chat";
import { FiSend, FiUser } from "react-icons/fi";
import { createChat } from "@/src/types/chat";
import { pipe } from "fp-ts/function";
import { RoomWithCharacter } from "@/src/types/room";
import * as TE from "fp-ts/TaskEither";

interface ChatRoomClientProps {
    initialChats: Chat[];
    roomInfo: RoomWithCharacter;
    roomId: string;
}

export function ChatRoomClient({ initialChats, roomInfo, roomId }: ChatRoomClientProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chats, setChats] = useState<Chat[]>(initialChats);
    const [message, setMessage] = useState("");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chats]);

    const asyncCreateChat = async (message: Chat["message"]) => {
        if (isLoading) return;
        setIsLoading(true);

        pipe(
            convertUserMessage(message),
            (data) => createChat(roomId)(data.message),
            TE.map((response) => convertCharacterMessage(response.data)),
            TE.map((data) => setChats((prev) => [...prev, data])),
            TE.map(() => setMessage("")),
            TE.mapLeft((error) => console.error(error)),
            TE.map(() => setIsLoading(false))
        )();
    };

    const convertUserMessage = (message: Chat["message"]): Chat => {
        const newMessage: Chat = {
            id: Date.now().toString(),
            message: message,
            createdAt: new Date().toISOString(),
            userId: roomInfo?.user.id || null,
            characterId: null,
        };
        setChats((prev) => [...prev, newMessage]);
        return newMessage;
    };

    const convertCharacterMessage = (message: Chat["message"]): Chat => {
        return {
            id: Date.now().toString(),
            message: message,
            createdAt: new Date().toISOString(),
            userId: null,
            characterId: roomInfo?.character.id || null,
        };
    };

    return (
        <div className="w-full h-full">
            <div className="h-full flex flex-col mx-auto max-w-4xl">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {roomInfo && (
                        <div className="flex justify-start items-end gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                {roomInfo.character.image ? (
                                    <img
                                        src={roomInfo.character.image}
                                        alt={roomInfo.character.nickname}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FiUser className="w-5 h-5 text-gray-500" />
                                )}
                            </div>
                            <div className="max-w-[70%] rounded-lg p-3 bg-[#F2FBFB] dark:bg-gray-800 rounded-bl-none">
                                <p className="text-sm">{`안녕하세요, ${roomInfo.character.nickname}입니다. 잘 부탁드립니다.`}</p>
                                <span className="text-xs opacity-70 mt-1 block">{new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>
                    )}
                    {chats.length === 0 && (
                        <div className="flex flex-col gap-2 items-end mt-4">
                            <button
                                onClick={() => asyncCreateChat("저도 반갑습니다! 어떤 이야기를 나누고 싶으신가요?")}
                                className="w-full max-w-md p-2 text-left text-sm rounded-lg bg-[#F2FBFB]  text-black transition-colors"
                            >
                                저도 반갑습니다! 어떤 이야기를 나누고 싶으신가요?
                            </button>
                            <button
                                onClick={() => asyncCreateChat("당신에 대해 더 자세히 알고 싶어요. 어떤 분이신가요?")}
                                className="w-full max-w-md p-2 text-left text-sm rounded-lg bg-[#F2FBFB]  text-black transition-colors"
                            >
                                당신에 대해 더 자세히 알고 싶어요. 어떤 분이신가요?
                            </button>
                            <button
                                onClick={() =>
                                    asyncCreateChat("오늘 하루는 어떠셨나요? 저와 이야기 나누고 싶은 것이 있으신가요?")
                                }
                                className="w-full max-w-md p-2 text-left text-sm rounded-lg bg-[#F2FBFB]  text-black transition-colors"
                            >
                                오늘 하루는 어떠셨나요? 저와 이야기 나누고 싶은 것이 있으신가요?
                            </button>
                        </div>
                    )}
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`flex ${chat.userId ? "justify-end" : "justify-start"} items-end gap-2`}
                        >
                            {!chat.userId && (
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    {roomInfo?.character.image ? (
                                        <img
                                            src={roomInfo.character.image}
                                            alt={roomInfo.character.nickname}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FiUser className="w-5 h-5 text-gray-500" />
                                    )}
                                </div>
                            )}
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                    chat.userId
                                        ? "bg-[#F2FBFB] text-black rounded-br-none dark:bg-gray-800 dark:text-white"
                                        : "bg-[#F2FBFB] dark:bg-gray-800 rounded-bl-none"
                                }`}
                            >
                                <p
                                    className={`text-sm ${
                                        chat.userId ? "text-black dark:text-white" : "text-gray-900 dark:text-gray-100"
                                    }`}
                                >
                                    {chat.message}
                                </p>
                                <span
                                    className={`text-xs mt-1 block ${
                                        chat.userId
                                            ? "text-black/70 dark:text-white/70"
                                            : "text-gray-600 dark:text-gray-300"
                                    }`}
                                >
                                    {new Date(chat.createdAt).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start items-end gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                {roomInfo?.character.image ? (
                                    <img
                                        src={roomInfo.character.image}
                                        alt={roomInfo.character.nickname}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FiUser className="w-5 h-5 text-gray-500" />
                                )}
                            </div>
                            <div className="max-w-[70%] rounded-lg p-3 bg-white dark:bg-gray-800 rounded-bl-none">
                                <span className="text-xs font-medium block mb-1">{roomInfo?.character.nickname}</span>
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                                    <div
                                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.2s" }}
                                    />
                                    <div
                                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.4s" }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    if (message.trim()) asyncCreateChat(message.trim());
                                }
                            }}
                            disabled={isLoading}
                            placeholder={isLoading ? "메시지를 전송 중입니다..." : "메시지를 입력하세요..."}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={() => asyncCreateChat(message.trim())}
                            disabled={isLoading || !message.trim()}
                            className="px-4 py-2 bg-primary text-on-primary rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiSend className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
