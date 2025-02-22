import { Character } from "@/src/types/character";
import { FiUser } from "react-icons/fi";

interface CharacterCardProps {
    character: Character;
    onClick: (character: Character) => void;
}

export default function CharacterCard({ character, onClick }: CharacterCardProps) {
    const position = character.positions[0];
    return (
        <div
            onClick={() => onClick(character)}
            className="cursor-pointer relative h-full overflow-hidden border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
        >
            <div className="bg-white dark:bg-gray-800  overflow-hidden h-2/3 relative group">
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 h-full">
                    <div className="flex flex-wrap gap-1">
                        {character.personalities?.map((personality, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-primary text-on-primary rounded-md">
                                {personality.keyword}
                            </span>
                        ))}
                    </div>
                </div>

                {character.image ? (
                    <img src={character.image} alt={character.nickname} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <FiUser className="w-20 h-20 text-gray-400 dark:text-gray-500" />
                    </div>
                )}
            </div>

            <div className="p-4 bg-background text-text h-1/3 flex flex-col justify-center">
                <h3 className="text-lg font-semibold mb-1">{character.nickname}</h3>
                <div className="flex items-center justify-between text-sm opacity-80">
                    <span>
                        {character.experienceYears}년차 {position.keyword}
                    </span>
                </div>
            </div>
        </div>
    );
}
