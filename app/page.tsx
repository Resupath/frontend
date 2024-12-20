import Image from "next/image";

import { CharacterList } from "@/src/components/character/CharaterList";

export default function Home() {
    return (
        <div className="w-full h-full bg-white bg-background text-text">
            <CharacterList />
        </div>
    );
}
