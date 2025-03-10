"use client";

import { useRouter } from "next/navigation";
import { FiPlus, FiArrowLeft, FiUser } from "react-icons/fi";
import { Character } from "@/src/types/character";
import { Pagination } from "@/src/types/pagination";
import CharacterCard from "../character/CharacterCard";

interface MyCharacterListProps {
    initialData: Pagination<Character>;
}

export default function MyCharacterList({ initialData }: MyCharacterListProps) {
    const router = useRouter();

    const handleCreateClick = () => {
        router.push("/characters/create");
    };

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col">
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

            <div
                style={{
                    flex: 1,
                    gridAutoRows: "300px",
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 basis-0 overflow-y-auto"
            >
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
                {initialData.data.map((character) => (
                    <CharacterCard
                        key={character.id}
                        character={character}
                        onClick={() => router.push(`/characters/${character.id}/edit`)}
                    />
                ))}
            </div>
        </div>
    );
}
