import { cookies } from "next/headers";
import { api } from "@/src/utils/api";
import ProfileTab from "./ProfileTab";

export async function ProfileTabContainer() {
    const cookieStore = await cookies();
    const auth = cookieStore.get("auth");

    const memberInfo = await api
        .get("/members/info", {
            headers: {
                "X-Member": `Bearer ${auth?.value}`,
            },
        })
        .then((res) => res.data)
        .catch((error) => {
            console.error(error);
            return null;
        });

    return <ProfileTab initialData={memberInfo} />;
}
