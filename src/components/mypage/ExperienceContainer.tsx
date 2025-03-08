import { api } from "@/src/utils/api";
import { cookies } from "next/headers";
import ExperiencesTab from "./ExperiencesTab";

export async function ExperienceContainer() {
    const cookieStore = await cookies();
    const auth = cookieStore.get("auth");

    const experiences = await api
        .get("/experiences", {
            headers: {
                "X-Member": `Bearer ${auth?.value}`,
            },
        })
        .then((res) => res.data)
        .catch((error) => {
            console.error(error);
            return [];
        });

    return <ExperiencesTab initialData={experiences} />;
}
