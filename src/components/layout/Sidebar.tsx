"use client";
import React, { FC, useState } from "react";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";

/**
 * @author bkdragon
 * @function Sidebar
 **/

export const Sidebar: FC<{}> = ({}) => {
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
                    className="fixed left-4 top-4 p-2 bg-white dark:bg-black transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700 dark:border-gray-800"
                >
                    <FiChevronsRight />
                </button>
            )}
            <aside
                style={{ width: `${width}px` }}
                className="h-full bg-gray-100 dark:bg-black flex flex-col transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200 dark:border-gray-800"
            >
                <div className="w-full px-4 py-4 flex flex-row justify-between items-center">
                    <span className="text-xl font-bold">Resupath</span>
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
                    <div className="flex-1 p-4">content</div>
                    <div
                        onMouseDown={handleResize}
                        className="w-1 cursor-ew-resize   bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                    ></div>
                </div>
            </aside>
        </>
    );
};
