"use client";

import React, { FC, useState, useEffect } from "react";
import { pipe } from "fp-ts/lib/function";
import { useRouter } from "next/navigation";
import { RoomItem } from "../room/RoomItem";
import { useRoomStore } from "@/src/stores/useRoomStore";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { Room, RoomWithCharacter, deleteRoom } from "@/src/types/room";
/**
 * @author bkdragon
 * @function Sidebar
 **/

type DateGroup = {
    today: RoomWithCharacter[];
    yesterday: RoomWithCharacter[];
    lastWeek: RoomWithCharacter[];
    older: RoomWithCharacter[];
};

function groupRoomsByDate(rooms: RoomWithCharacter[]): DateGroup {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    return rooms.reduce(
        (acc, room) => {
            const roomDate = new Date(room.createdAt);
            if (roomDate >= today) {
                acc.today.push(room);
            } else if (roomDate >= yesterday) {
                acc.yesterday.push(room);
            } else if (roomDate >= lastWeek) {
                acc.lastWeek.push(room);
            } else {
                acc.older.push(room);
            }
            return acc;
        },
        { today: [], yesterday: [], lastWeek: [], older: [] } as DateGroup
    );
}

export const Sidebar: FC<{}> = ({}) => {
    const router = useRouter();
    const { rooms, asyncListRooms } = useRoomStore((state) => state);

    const [width, setWidth] = useState(300);

    const handleResize = (e: React.MouseEvent<HTMLDivElement>) => {
        const startX = e.clientX;
        const startWidth = width;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            const newWidth = Math.min(Math.max(startWidth + deltaX, 250), 500); // 최소 250px, 최대 500px
            setWidth(newWidth);
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const calculateWidth = (isOpen: boolean): number =>
        pipe(
            isOpen,
            E.fromNullable(new Error("isOpen is required")),
            E.fold(
                () => 250,
                (isOpen) => (isOpen ? 0 : 250)
            )
        );

    const asyncDeleteRoom = async (roomId: Room["id"]) => {
        const currentPath = window.location.pathname;
        const roomIdFromPath = currentPath.split("/").pop();
        if (roomIdFromPath === roomId) {
            router.push("/");
        }

        pipe(
            deleteRoom(roomId),
            TE.map((room) => asyncListRooms()),
            TE.mapLeft((error) => console.error(error))
        )();
    };

    useEffect(() => {
        asyncListRooms();
    }, []);

    const groupedRooms = groupRoomsByDate(rooms);

    return (
        <>
            <aside
                style={{ width: `${width}px` }}
                className="h-full bg-background flex flex-col transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-300 dark:border-gray-700"
            >
                <div className="w-full px-6 py-4 flex flex-row justify-between items-center mb-8">
                    <button
                        onClick={() => router.push("/")}
                        className="text-xl font-bold flex flex-row items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="#4DCACD" />
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M15.9987 11.3333C15.9987 14.2722 13.6216 16.656 10.6852 16.6666C10.7424 17.5692 10.8727 18.6345 11.0964 19.9595L15.5273 15.5286C15.5278 15.5281 15.5284 15.5275 15.5289 15.527L20.8543 10.2016C20.8749 10.1804 20.897 10.1605 20.9205 10.1421C21.0066 10.0744 21.1056 10.0308 21.2082 10.0115C21.2707 9.99971 21.3341 9.99704 21.3963 10.0031C21.5221 10.0152 21.645 10.0629 21.7488 10.1463C21.7758 10.1679 21.8013 10.1918 21.8251 10.2179C21.8381 10.2322 21.8503 10.2468 21.8618 10.2619C23.4694 12.3006 24.5953 13.9137 25.3546 15.5066C25.975 16.808 26.3432 18.0793 26.5457 19.5379C26.624 19.9013 26.6653 20.2785 26.6654 20.6653L26.6654 20.6697C26.6637 23.6138 24.2766 26 21.332 26C18.3865 26 15.9987 23.6122 15.9987 20.6667C15.9987 17.7278 18.3758 15.344 21.3122 15.3334C21.255 14.4308 21.1247 13.3655 20.901 12.0405L16.4701 16.4714C16.4696 16.4719 16.469 16.4725 16.4685 16.473L11.1432 21.7983C11.1229 21.8192 11.1011 21.8389 11.0779 21.8571C10.992 21.925 10.8932 21.9687 10.7907 21.9882C10.6042 22.0237 10.4054 21.9791 10.2495 21.8545C10.2229 21.8332 10.1977 21.8097 10.1742 21.7841C10.1605 21.7692 10.1475 21.7538 10.1354 21.738C8.52792 19.6993 7.40212 18.0863 6.64277 16.4934C6.02235 15.192 5.65421 13.9207 5.45171 12.4621C5.37331 12.0982 5.33203 11.7206 5.33203 11.3333V11.3325C5.33248 8.38737 7.72012 6 10.6654 6C13.6109 6 15.9987 8.38781 15.9987 11.3333Z"
                                fill="white"
                            />
                        </svg>
                        <span>면시</span>
                    </button>
                </div>

                <div className="flex-[2] overflow-y-auto px-4">
                    {groupedRooms.today.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-primary mb-2">오늘</h3>
                            <div className="space-y-2">
                                {groupedRooms.today.map((room) => (
                                    <RoomItem
                                        key={room.id}
                                        room={room}
                                        onDelete={() => asyncDeleteRoom(room.id)}
                                        onClick={(r) => router.push(`/room/${r.id}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {groupedRooms.yesterday.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-primary mb-2">어제</h3>
                            <div className="space-y-2">
                                {groupedRooms.yesterday.map((room) => (
                                    <RoomItem
                                        key={room.id}
                                        room={room}
                                        onDelete={() => asyncDeleteRoom(room.id)}
                                        onClick={(r) => router.push(`/room/${r.id}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {groupedRooms.lastWeek.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-primary mb-2">지난 7일</h3>
                            <div className="space-y-2">
                                {groupedRooms.lastWeek.map((room) => (
                                    <RoomItem
                                        key={room.id}
                                        room={room}
                                        onDelete={() => asyncDeleteRoom(room.id)}
                                        onClick={(r) => router.push(`/room/${r.id}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {groupedRooms.older.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-primary mb-2">이전</h3>
                            <div className="space-y-2">
                                {groupedRooms.older.map((room) => (
                                    <RoomItem
                                        key={room.id}
                                        room={room}
                                        onDelete={() => asyncDeleteRoom(room.id)}
                                        onClick={(r) => router.push(`/room/${r.id}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};
