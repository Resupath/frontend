import { Character } from "@/src/types/character";
import { api } from "@/src/utils/api";
import { cookies } from "next/headers";
import EditCharacterClient from "./EditCharacterClient";

async function getCharacterInfoInServerSide(characterId: string, auth: string, userToken: string) {
    if (!auth || !userToken) {
        throw new Error("Unauthorized");
    }

    try {
        const response = await api.get<Character>(`/characters/${characterId}`, {
            headers: {
                "X-Member": `Bearer ${auth}`,
                "X-User": `Bearer ${userToken}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch character info:", error);
        throw new Error("Failed to fetch character info");
    }
}

export default async function EditCharacterPage({ params }: { params: { id: string } }) {
    const cookieStore = await cookies();
    const auth = cookieStore.get("auth");
    const userToken = cookieStore.get("userToken");

    const character = await getCharacterInfoInServerSide(params.id, auth?.value || "", userToken?.value || "");

    return <EditCharacterClient initialCharacter={character} />;
}
