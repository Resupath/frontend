"use client";

import React, { FC, useEffect, useState } from "react";
import { Character, listCharacters, retrieveCharacter } from "@/src/types/character";
import { pipe } from "fp-ts/lib/function";
import { FiChevronsRight, FiSearch, FiUser } from "react-icons/fi";
import type { Pagination } from "@/src/types/pagination";
import { Pagination as PaginationComponent } from "@/src/components/common/Pagination";
import { createRoom } from "@/src/types/room";
import CharacterCard from "./CharacterCard";
import { useRouter } from "next/navigation";
import { useRoomStore } from "@/src/stores/useRoomStore";

import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";

export const CharacterList: FC<{ initialCharacters: Pagination<Character> }> = ({ initialCharacters }) => {
    const router = useRouter();
    const { asyncListRooms: refreshRooms } = useRoomStore((state) => state);
    const [characters, setCharacters] = useState<Pagination<Character>>(initialCharacters);

    const [selectedCharacter, setSelectedCharacter] = useState<O.Option<Character>>(O.none);

    const [sidebarWidth, setSidebarWidth] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

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

    const asyncListCharacters = async (page: number = 1) =>
        pipe(
            listCharacters(page),
            TE.map((characters) => {
                setCharacters(characters);
                setCurrentPage(page);
            }),
            TE.mapLeft((error) => console.error(error))
        )();

    function handleCharacterClick(character: Character) {
        pipe(
            retrieveCharacter(character.id),
            TE.map((character) => {
                setSelectedCharacter(O.some(character));
                setSidebarWidth(600);
            }),
            TE.mapLeft((error) => {
                console.error("Failed to fetch character details:", error);
                setSelectedCharacter(O.none);
                setSidebarWidth(0);
            })
        )();
    }

    const asyncCreateRoom = async (characterId: Character["id"]) =>
        pipe(
            createRoom(characterId),
            TE.map((room) => {
                refreshRooms();
                router.push(`/room/${room.data.id}`);
            }),
            TE.mapLeft((error) => console.error(error))
        )();

    useEffect(() => {
        asyncListCharacters(currentPage);
    }, [currentPage]);

    const filteredCharacters = characters.data.filter((character: Character) =>
        character.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 검색어가 변경될 때마다 첫 페이지로 돌아가기
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <div className="flex w-full h-full">
            <div
                style={{ width: `calc(100% - ${sidebarWidth}px)` }}
                className={`transition-[width] duration-300 ease-in-out h-full`}
            >
                <div className="mx-auto px-4 py-8 max-w-7xl flex flex-col h-full">
                    {/* 검색 바 */}
                    <div className="mb-8">
                        <div className="relative w-full mx-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="h-5 w-5 text-text" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="캐릭터 검색..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* 캐릭터 그리드 */}
                    <div
                        style={{
                            flex: 1,
                            gridAutoRows: "300px",
                            padding: "8px",
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto"
                    >
                        <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                            <div className="flex flex-col items-center p-6">
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                                    <svg
                                        className="w-6 h-6 text-gray-400 dark:text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">새 캐릭터 추가</span>
                            </div>
                        </div>
                        {filteredCharacters.map((character: Character) => (
                            <CharacterCard key={character.id} character={character} onClick={handleCharacterClick} />
                        ))}
                    </div>
                    <div className="mt-auto">
                        <PaginationComponent
                            meta={characters.meta}
                            onPageChange={(page) => asyncListCharacters(page)}
                        />
                    </div>
                </div>
            </div>

            <div
                style={{ width: `${sidebarWidth}px` }}
                className={`fixed top-0 right-0 h-full bg-background shadow-xl border-l border-gray-300 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
                    sidebarWidth > 0 ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="relative h-full">
                    <div
                        className="absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-gray-300 dark:hover:bg-gray-700"
                        onMouseDown={sidebarWidth > 0 ? handleResize : undefined}
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
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="flex-shrink-0">
                                                {character.image ? (
                                                    <img
                                                        src={character.image}
                                                        alt={character.nickname}
                                                        className="w-32 h-32 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                        <FiUser className="w-16 h-16 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <h2 className="text-2xl font-bold">{character.nickname}</h2>
                                                <div className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                                                    {character.experienceYears}년차 {character.positions[0].keyword}
                                                </div>
                                                <div className="flex gap-3">
                                                    {/* TODO : 연결된 소셜 미디어 아이콘 추가 */}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full mb-4">
                                            <button
                                                onClick={() => asyncCreateRoom(character.id)}
                                                className="w-full px-4 py-2 bg-primary text-on-primary rounded-lg transition-colors"
                                            >
                                                면접 진행하기
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">성격</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {character.personalities?.map((personality, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-gray-50 text-gray-500 dark:text-gray-400 dark:bg-gray-800 rounded-md text-sm"
                                                        >
                                                            {personality.keyword}
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
                                                            className="px-3 py-1 bg-secondary text-on-secondary rounded-md text-sm"
                                                        >
                                                            {skill.keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">경력사항</h3>
                                                <div className="space-y-4">
                                                    {character.experiences?.map((experience, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                                                    {experience.companyName}
                                                                </h4>
                                                            </div>
                                                            <div className="mb-1">
                                                                <span className="py-1 text-sm rounded-full font-medium">
                                                                    {experience.position}
                                                                </span>
                                                            </div>
                                                            {experience.description && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed mb-1">
                                                                    {experience.description}
                                                                </p>
                                                            )}
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                                {experience.startDate} - {experience.endDate || "현재"}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
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
