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
                    <div key={character.id} className="relative group">
                        <CharacterCard key={character.id} character={character} onClick={() => {}} />
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => router.push(`/characters/${character.id}/edit`)}
                                className="p-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-colors shadow-lg"
                                title="캐릭터 수정"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={() => {
                                    const baseURL =
                                        process.env.NODE_ENV === "development"
                                            ? process.env.NEXT_PUBLIC_API_URL_DEV
                                            : process.env.NEXT_PUBLIC_API_URL_PROD;
                                    navigator.clipboard.writeText(`${baseURL}/characters/share/${character.id}`);
                                    alert("캐릭터 공유 링크가 클립보드에 복사되었습니다.");
                                }}
                                className="p-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-colors shadow-lg"
                                title="공유 링크 복사"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
