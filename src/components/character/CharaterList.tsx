"use client";
import { Character, listCharacters } from "@/src/types/character";
import { pipe } from "fp-ts/lib/function";
import React, { FC, useEffect, useState } from "react";
import * as TE from "fp-ts/TaskEither";
import Image from "next/image";

/**
 * @author
 * @function CharacterList
 **/

export const CharacterList: FC<{}> = ({}) => {
    const [characters, setCharacters] = useState<Character[]>([]);

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

    return (
        <div className="max-w-5xl mx-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {characters.map((character) => (
                    <CharacterCard key={character.id} character={character} />
                ))}
            </div>
        </div>
    );
};

interface CharacterCardProps {
    character: Character;
}

function CharacterCard({ character }: CharacterCardProps) {
    return (
        <div className="bg-gray-900/80 backdrop-blur rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
            <div className="aspect-square relative overflow-hidden">
                <div className="w-full h-full relative">
                    {/* <Image
                        src="/default-anime-avatar.jpg"
                        alt={character.nickname}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    /> */}
                </div>
            </div>

            <div className="p-4 bg-gradient-to-t from-gray-900/90 to-gray-900/40">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-white mb-1">{character.nickname}</h3>
                    <div className="text-sm text-gray-300/80">{/* description */}</div>
                </div>

                <div className="mt-2 flex items-center justify-center gap-2">
                    <span
                        className={`
                        px-2 py-0.5 text-xs rounded-full
                        ${character.isPublic ? "bg-emerald-500/20 text-emerald-300" : "bg-gray-500/20 text-gray-300"}
                    `}
                    >
                        {character.isPublic ? "Public" : "Private"}
                    </span>
                    <span className="text-xs text-gray-400">@{character.memberId}</span>
                </div>
            </div>
        </div>
    );
}
