import { MyPageNavigate } from "@/src/components/mypage/MyPageNavigate";
import { ProfileTabContainer } from "@/src/components/mypage/ProfileTabContainer";
import { ProfileSkeleton } from "@/src/components/skeleton/ProfileSkeleton";
import { Suspense } from "react";

export default async function MyPage() {
    return (
        <main className="w-full h-full overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

                    <div>
                        <MyPageNavigate />
                        <div className="rounded-xl">
                            <Suspense fallback={<ProfileSkeleton />}>
                                <ProfileTabContainer />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
