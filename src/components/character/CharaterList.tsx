"use client";

import { Character, listCharacters } from "@/src/types/character";
import { pipe } from "fp-ts/lib/function";
import React, { FC, useEffect, useState } from "react";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import { FiChevronsRight, FiSearch, FiUser } from "react-icons/fi";
import { Pagination } from "@/src/types/pagination";
import CharacterCard from "./CharacterCard";

export const CharacterList: FC<{}> = () => {
    const [characters, setCharacters] = useState<Pagination<Character>>({
        data: [],
        meta: {
            page: 0,
            take: 0,
            totalCount: 0,
            totalPage: 0,
        },
    });
    const [selectedCharacter, setSelectedCharacter] = useState<O.Option<Character>>(O.none);
    const [sidebarWidth, setSidebarWidth] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

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
            TE.map((characters) => setCharacters(characters)),
            TE.mapLeft((error) => console.error(error))
        )();

    function handleCharacterClick(character: Character) {
        setSelectedCharacter(O.some(character));
        setSidebarWidth(384);
    }

    useEffect(() => {
        asyncListCharacters();
    }, []);

    const filteredCharacters = characters.data.filter((character) =>
        character.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex">
            <div
                style={{ width: `calc(100% - ${sidebarWidth}px)` }}
                className={`transition-[width] duration-300 ease-in-out w-full`}
            >
                <div className="mx-auto px-4 py-8 max-w-7xl">
                    {/* 검색 바 */}
                    <div className="mb-8">
                        <div className="relative max-w-md mx-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="캐릭터 검색..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* 캐릭터 그리드 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {filteredCharacters.map((character) => (
                            <CharacterCard key={character.id} character={character} onClick={handleCharacterClick} />
                        ))}
                    </div>
                </div>
            </div>

            <div
                style={{ width: `${sidebarWidth}px` }}
                className={`fixed top-0 right-0 h-full bg-foreground shadow-xl transform transition-transform duration-300 ease-in-out ${
                    sidebarWidth > 0 ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="relative h-full">
                    <div
                        className="absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-gray-300 dark:hover:bg-gray-700"
                        onMouseDown={handleResize}
                    />

                    {pipe(
                        selectedCharacter,
                        O.fold(
                            () => null,
                            (character) => (
                                <div className="h-full flex flex-col">
                                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => {
                                                setSidebarWidth(0);
                                                setSelectedCharacter(O.none);
                                            }}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                        >
                                            <FiChevronsRight className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="flex-1 p-6 overflow-y-auto">
                                        <div className="flex flex-col items-center mb-8">
                                            {character.image ? (
                                                <img
                                                    src={character.image}
                                                    alt={character.nickname}
                                                    className="w-32 h-32 rounded-full object-cover mb-4"
                                                />
                                            ) : (
                                                <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                                                    <FiUser className="w-16 h-16 text-gray-400" />
                                                </div>
                                            )}
                                            <h2 className="text-2xl font-bold mb-1">{character.nickname}</h2>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {character.experienceYears}년차 백엔드 개발자
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">성격</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {character.personalities?.map((personality, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm"
                                                        >
                                                            {personality.keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">포지션</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {character.positions?.map((position, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md text-sm"
                                                        >
                                                            {position.keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">스킬</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {character.skills?.map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-md text-sm"
                                                        >
                                                            {skill.keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">경력사항</h3>
                                                <div className="space-y-2">
                                                    {character.experiences?.map((experience, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                                        >
                                                            <div className="font-medium">{experience.companyName}</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                {experience.position}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                                        <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                            커피챗하기
                                        </button>
                                        <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                            면접 진행하기
                                        </button>
                                    </div>
                                </div>
                            )
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
