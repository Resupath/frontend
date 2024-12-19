"use client";
import { Character, listCharacters } from "@/src/types/character";
import { pipe } from "fp-ts/lib/function";
import React, { FC, useEffect, useState } from "react";
import * as TE from "fp-ts/TaskEither";
import { FiChevronsRight } from "react-icons/fi";

/**
 * @author
 * @function CharacterList
 **/

export const CharacterList: FC<{}> = ({}) => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | undefined>();
    const [sidebarWidth, setSidebarWidth] = useState(0);

    const handleResize = (e: React.MouseEvent<HTMLDivElement>) => {
        const startX = e.clientX;
        const startWidth = sidebarWidth;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = startX - e.clientX;
            const newWidth = Math.min(Math.max(startWidth + deltaX, 300), 600);
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const asyncListCharacters = async () =>
        pipe(
            listCharacters(),
            TE.fold(
                (error) => async () => [],
                (characters) => async () => characters
            )
        )().then(setCharacters);

    useEffect(() => {
        asyncListCharacters();
    }, []);

    function handleCharacterClick(character: Character) {
        setSelectedCharacter(character);
        setSidebarWidth(384); // 사이드바 열기
    }

    return (
        <div className="flex">
            <div
                style={{ width: `calc(100% - ${sidebarWidth}px)` }}
                className={`transition-[width] duration-300 ease-in-out w-full`}
            >
                <div className="mx-auto px-4 py-8 max-w-5xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {characters.map((character) => (
                            <div
                                key={character.id}
                                className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
                                onClick={() => handleCharacterClick(character)}
                            >
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold">{character.nickname}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">''</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div
                style={{ width: `${sidebarWidth}px` }}
                className={`fixed top-0 right-0 h-full bg-foreground  shadow-xl transform transition-transform duration-300 ease-in-out ${
                    sidebarWidth > 0 ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="relative h-full">
                    <div
                        className="absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-gray-300 dark:hover:bg-gray-700"
                        onMouseDown={handleResize}
                    />

                    {selectedCharacter && (
                        <div className="p-4">
                            <button
                                onClick={() => setSidebarWidth(0)} // 사이드바 닫기
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <FiChevronsRight />
                            </button>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">캐릭터 상세 정보...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
