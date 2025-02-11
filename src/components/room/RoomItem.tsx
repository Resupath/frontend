import { FC } from "react";
import { RoomWithCharacter } from "@/src/types/room";

interface RoomItemProps {
    room: RoomWithCharacter;
    onClick?: (room: RoomWithCharacter) => void;
}

export const RoomItem: FC<RoomItemProps> = ({ room, onClick }) => {
    const formattedDate = new Date(room.createdAt).toLocaleDateString();

    return (
        <button
            onClick={() => onClick?.(room)}
            className="w-full p-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                    {room.character.image ? (
                        <img
                            src={room.character.image}
                            alt={room.character.nickname}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span>{room.character.nickname[0]}</span>
                    )}
                </div>
                <div className="flex-1">
                    <p className="font-medium">{room.character.nickname}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</p>
                </div>
            </div>
        </button>
    );
};
