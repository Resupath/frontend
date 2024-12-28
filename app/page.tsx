import Image from "next/image";

import { CharacterList } from "@/src/components/character/CharaterList";

export default function Home() {
    return (
        <div className="w-full h-full">
            <CharacterList />
        </div>
    );
}
