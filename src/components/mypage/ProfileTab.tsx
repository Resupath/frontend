"use client";

import { useEffect, useState } from "react";
import { Member } from "@/src/types/member";
import { pipe } from "fp-ts/lib/function";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { getMyInfo } from "@/src/types/member";
import * as TE from "fp-ts/TaskEither";

export default function ProfileTab() {
    const [info, setInfo] = useState<Member | null>(null);
    const { user } = useAuthStore();

    const router = useRouter();

    const asyncGetMyInfo = () =>
        pipe(
            getMyInfo(),
            TE.map((info) => setInfo(info)),
            TE.mapLeft((error) => console.error(error))
        )();

    useEffect(() => {
        asyncGetMyInfo();
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-4xl text-gray-500 dark:text-gray-400">👤</span>
                    </div>
                    <div className="ml-6">
                        <h2 className="text-2xl font-semibold mb-2">{info?.name}</h2>
                        {info?.providers.map((provider) => (
                            <p key={provider.id} className="text-gray-600 dark:text-gray-300">
                                {provider.type}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">설정</h3>
                <div className="space-y-4">
                    <button
                        onClick={() => router.push("/characters")}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        캐릭터 관리
                    </button>
                    <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        프로필 수정
                    </button>
                    <button className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors">
                        비밀번호 변경
                    </button>
                </div>
            </div>
        </div>
    );
}
