import { CharacterList } from "@/src/components/character/CharaterList";
import { listCharacters } from "@/src/types/character";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

export default async function Home() {
    const characters = await pipe(
        listCharacters(),
        TE.match(
            (error) => {
                console.error(error);
                return {
                    data: [],
                    meta: {
                        page: 0,
                        take: 0,
                        totalCount: 0,
                        totalPage: 0,
                    },
                };
            },
            (response) => response
        )
    )();

    return (
        <div className="w-full h-full">
            <CharacterList initialCharacters={characters} />
        </div>
    );
}
