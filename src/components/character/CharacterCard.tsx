import { Character } from "@/src/types/character";
import { FiUser } from "react-icons/fi";

interface CharacterCardProps {
    character: Character;
    onClick: (character: Character) => void;
}

export default function CharacterCard({ character, onClick }: CharacterCardProps) {
    return (
        <div onClick={() => onClick(character)} className="cursor-pointer group relative h-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full">
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4">
                    <div className="flex flex-wrap gap-1">
                        {character.personalities?.map((personality, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-blue-600/80 text-white rounded-md">
                                {personality.keyword}
                            </span>
                        ))}
                    </div>
                </div>

                {character.image ? (
                    <img src={character.image} alt={character.nickname} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <FiUser className="w-20 h-20 text-gray-400 dark:text-gray-500" />
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <h3 className="text-lg font-semibold mb-1">{character.nickname}</h3>
                    <div className="flex items-center justify-between text-sm opacity-80">
                        <span>{character.experienceYears}년차</span>
                        <span>
                            {new Date(character.createdAt)
                                .toLocaleDateString("ko-KR", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                })
                                .replace(/\. /g, ".")
                                .slice(0, -1)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
