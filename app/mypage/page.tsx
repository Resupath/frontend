import { MyPageNavigate } from "@/src/components/mypage/MyPageNavigate";
import { ProfileTabContainer } from "@/src/components/mypage/ProfileTabContainer";
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

export function ProfileSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="flex items-center space-x-4">
                {/* 프로필 이미지 스켈레톤 */}
                <div className="w-20 h-20 bg-gray-200 rounded-full" />

                <div className="space-y-3 flex-1">
                    {/* 이름 스켈레톤 */}
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    {/* 이메일 스켈레톤 */}
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
            </div>

            {/* 추가 정보 스켈레톤 */}
            <div className="mt-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
        </div>
    );
}
