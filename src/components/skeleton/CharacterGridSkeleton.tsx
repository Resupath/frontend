import { CharacterCardSkeleton } from "./CharacterCardSkeleton";

export function CharacterGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <CharacterCardSkeleton key={i} />
            ))}
        </div>
    );
}
