import MyCharacterList from "@/src/components/characters/MyCharacterList";
import { api } from "@/src/utils/api";
import { cookies } from "next/headers";

export default async function CharactersPage() {
    const cookieStore = await cookies();
    const auth = cookieStore.get("auth");

    const getCharactersInServerSide = async () => {
        try {
            const response = await api.get("/members/characters", {
                headers: {
                    "X-Member": `Bearer ${auth?.value}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error(error);
            return {
                data: [],
                meta: { page: 1, take: 10, totalCount: 0, totalPage: 1 },
            };
        }
    };

    const charactersData = await getCharactersInServerSide();

    return (
        <main className="container mx-auto px-4 py-8">
            <MyCharacterList initialData={charactersData} />
        </main>
    );
}
