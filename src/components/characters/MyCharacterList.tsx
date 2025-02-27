"use client";

import { useRouter } from "next/navigation";
import { FiPlus, FiArrowLeft, FiUser } from "react-icons/fi";
import { Character } from "@/src/types/character";
import { Pagination } from "@/src/types/pagination";

interface MyCharacterListProps {
    initialData: Pagination<Character>;
}

export default function MyCharacterList({ initialData }: MyCharacterListProps) {
    const router = useRouter();

    const handleCreateClick = () => {
        router.push("/characters/create");
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <FiArrowLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-3xl font-bold">캐릭터 관리</h1>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg transition-colors"
                >
                    <FiPlus className="h-5 w-5" />새 캐릭터 생성
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {initialData.data.map((character) => (
                    <div
                        key={character.id}
                        className="border border-solid border-gray-300 dark:border-gray-700 rounded-lg bg-surface p-6"
                    >
                        <div className="flex items-center justify-center w-full h-40 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                            {character.image ? (
                                <img
                                    src={character.image}
                                    alt={character.nickname}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <span className="text-6xl">
                                    <FiUser className="w-20 h-20 text-gray-400 dark:text-gray-500" />
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-semibold mb-2">{character.nickname}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {character.personalities.length > 0
                                ? character.personalities.map((p) => p.keyword).join(", ")
                                : "아직 캐릭터 정보가 없습니다."}
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => router.push(`/characters/${character.id}`)}
                                className="px-4 py-2 text-primary transition-colors"
                            >
                                수정
                            </button>
                        </div>
                    </div>
                ))}

                <div
                    role="button"
                    onClick={handleCreateClick}
                    className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400 transition-colors group"
                >
                    <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        <FiPlus className="h-8 w-8 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        <span>새 캐릭터 생성</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
