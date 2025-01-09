"use client";

import React, { FC, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { pipe } from "fp-ts/lib/function";
import { useRouter } from "next/navigation";

import * as E from "fp-ts/Either";
import { useLoginModalStore } from "@/src/stores/useLoginModalStore";

/**
 * @author bkdragon
 * @function Sidebar
 **/

export const Sidebar: FC<{}> = ({}) => {
    const router = useRouter();
    const { setIsOpen } = useLoginModalStore();
    const { checkLogin, clearAuth } = useAuthStore((state) => state);

    const isLogin = checkLogin();

    const [width, setWidth] = useState(250);

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

    return (
        <>
            {!width && (
                <button
                    onClick={() => setWidth(calculateWidth(width > 0))}
                    className="fixed left-4 top-4 p-2 transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700 dark:border-gray-800"
                >
                    <FiChevronsRight />
                </button>
            )}
            <aside
                style={{ width: `${width}px` }}
                className="h-full bg-foreground flex flex-col transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200 dark:border-gray-800"
            >
                <div className="w-full px-4 py-4 flex flex-row justify-between items-center">
                    <button onClick={() => router.push("/")} className="text-xl font-bold">
                        Resupath
                    </button>
                    <button
                        onClick={() => {
                            setWidth(calculateWidth(width > 0));
                        }}
                        className="p-2 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ml-auto"
                    >
                        <FiChevronsLeft />
                    </button>
                </div>

                <div className="w-full flex flex-row flex-1">
                    <div className="flex-1 p-4 h-full flex flex-col">
                        <div className="mt-auto w-full flex flex-col justify-center items-center gap-2">
                            {isLogin && (
                                <>
                                    <button
                                        onClick={() => router.push("/mypage")}
                                        className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
                                    >
                                        <FaUserCircle className="text-4xl" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            clearAuth();
                                            router.push("/");
                                        }}
                                        className="text-sm"
                                    >
                                        로그아웃
                                    </button>
                                </>
                            )}
                            {!isLogin && (
                                <button onClick={() => setIsOpen(true)} className="text-sm">
                                    로그인
                                </button>
                            )}
                        </div>
                    </div>
                    <div
                        onMouseDown={handleResize}
                        className="w-1 cursor-ew-resize   bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                    ></div>
                </div>
            </aside>
        </>
    );
};
