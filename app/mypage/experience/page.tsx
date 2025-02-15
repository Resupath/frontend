import ExperiencesTab from "@/src/components/mypage/ExperiencesTab";
import { MyPageNavigate } from "@/src/components/mypage/MyPageNavigate";
import { api } from "@/src/utils/api";
import { cookies } from "next/headers";

export default async function MyPage() {
    const cookieStore = await cookies();
    const auth = cookieStore.get("auth");

    const getExperiencesInServerSide = async () => {
        try {
            const experiences = await api.get("/experiences", {
                headers: {
                    "X-Member": `Bearer ${auth?.value}`,
                },
            });
            return experiences.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const experiences = await getExperiencesInServerSide();

    return (
        <main className="w-full h-full overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

                    <div>
                        <MyPageNavigate />
                        <div className="rounded-xl">
                            <ExperiencesTab initialData={experiences} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
