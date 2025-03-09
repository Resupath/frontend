import { MyPageNavigate } from "@/src/components/mypage/MyPageNavigate";
import { Suspense } from "react";
import { ProfileSkeleton } from "@/src/components/skeleton/ProfileSkeleton";
import { ExperienceContainer } from "@/src/components/mypage/ExperienceContainer";

export default function MyPage() {
    return (
        <main className="w-full h-full overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

                    <div>
                        <MyPageNavigate />
                        <div className="rounded-xl">
                            <Suspense fallback={<ProfileSkeleton />}>
                                <ExperienceContainer />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
