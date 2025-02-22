"use client";

import React, { FC, useState, useEffect } from "react";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { pipe } from "fp-ts/lib/function";
import { useRouter } from "next/navigation";
import { RoomItem } from "../room/RoomItem";
import { useRoomStore } from "@/src/stores/useRoomStore";
import * as E from "fp-ts/Either";
import { RoomWithCharacter } from "@/src/types/room";
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

    useEffect(() => {
        asyncListRooms();
    }, []);

    const groupedRooms = groupRoomsByDate(rooms);

    return (
        <>
            {/* {!width && (
                <button
                    onClick={() => setWidth(calculateWidth(width > 0))}
                    className="fixed left-4 top-4 p-2 transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700 dark:border-gray-800"
                >
                    <FiChevronsRight />
                </button>
            )} */}
            <aside
                style={{ width: `${width}px` }}
                className="h-full bg-background flex flex-col transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-300 dark:border-gray-700"
            >
                <div className="w-full px-6 py-4 flex flex-row justify-between items-center mb-8">
                    <button onClick={() => router.push("/")} className="text-xl font-bold">
                        면시
                    </button>
                    {/* <button
                        onClick={() => {
                            setWidth(calculateWidth(width > 0));
                        }}
                        className="p-2 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ml-auto"
                    >
                        <FiChevronsLeft />
                    </button> */}
                </div>

                <div className="flex-[2] overflow-y-auto px-4">
                    {groupedRooms.today.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-primary mb-2">오늘</h3>
                            <div className="space-y-2">
                                {groupedRooms.today.map((room) => (
                                    <RoomItem key={room.id} room={room} onClick={(r) => router.push(`/room/${r.id}`)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {groupedRooms.yesterday.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-primary mb-2">어제</h3>
                            <div className="space-y-2">
                                {groupedRooms.yesterday.map((room) => (
                                    <RoomItem key={room.id} room={room} onClick={(r) => router.push(`/room/${r.id}`)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {groupedRooms.lastWeek.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-primary mb-2">지난 7일</h3>
                            <div className="space-y-2">
                                {groupedRooms.lastWeek.map((room) => (
                                    <RoomItem key={room.id} room={room} onClick={(r) => router.push(`/room/${r.id}`)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {groupedRooms.older.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-primary mb-2">이전</h3>
                            <div className="space-y-2">
                                {groupedRooms.older.map((room) => (
                                    <RoomItem key={room.id} room={room} onClick={(r) => router.push(`/room/${r.id}`)} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};
