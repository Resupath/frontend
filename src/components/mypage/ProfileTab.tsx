"use client";

import { useEffect, useState } from "react";
import { Member } from "@/src/types/member";
import { pipe } from "fp-ts/lib/function";
import { useRouter } from "next/navigation";
import { getMyInfo } from "@/src/types/member";
import * as TE from "fp-ts/TaskEither";
import { FiUser } from "react-icons/fi";
import { notionVerify, VerifyPageResponse } from "@/src/types/auth";
import { useAlertStore } from "@/src/stores/useAlertStore";
import { SiNotion } from "react-icons/si";
import { notionLogin } from "@/src/utils/notion";

import { FaGoogle } from "react-icons/fa";

interface ProfileTabProps {
    initialData: Member | null;
}

const renderProviderIcon = (provider: string) => {
    if (provider === "google") {
        return <FaGoogle />;
    }
    if (provider === "notion") {
        return <SiNotion />;
    }
    return null;
};

export default function ProfileTab({ initialData }: ProfileTabProps) {
    const { addAlert } = useAlertStore();
    const [info, setInfo] = useState<Member | null>(initialData);
    const [isVerified, setIsVerified] = useState<boolean>(false);

    console.log(info, "info");

    const [notionVerifyInfo, setNotionVerifyInfo] = useState<VerifyPageResponse[]>([]);

    console.log(notionVerifyInfo);

    const router = useRouter();

    const asyncGetMyInfo = () =>
        pipe(
            getMyInfo(),
            TE.map((info) => setInfo(info)),
            TE.mapLeft((error) => console.error(error))
        )();

    const asyncNotionVerify = () =>
        pipe(
            notionVerify(),
            TE.map((notionVerify) => setNotionVerifyInfo(notionVerify)),
            TE.mapLeft((error) => setNotionVerifyInfo([]))
        )();

    const ready = () => {
        addAlert("준비중입니다.", "info");
    };

    useEffect(() => {
        if (!initialData) {
            asyncGetMyInfo();
        }
        asyncNotionVerify();
    }, [initialData]);

    return (
        <div className="space-y-6">
            <div className="border border-solid border-gray-300 dark:border-gray-700 rounded-lg  p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">{info?.name}</h2>
                        <div className="flex items-center gap-2">
                            {info?.providers.map((provider) => (
                                <p key={provider.id} className="text-gray-600 text-lg dark:text-gray-300">
                                    {renderProviderIcon(provider.type)}
                                </p>
                            ))}
                        </div>
                    </div>
                    {!isVerified && (
                        <button
                            onClick={() => {
                                pipe(
                                    notionLogin(),
                                    TE.map((url) => window.open(url, "_blank")),
                                    TE.mapLeft((error) => console.error(error))
                                )();
                            }}
                            className="flex items-center gap-2 py-2.5 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors border-2 border-blue-500 hover:border-blue-600"
                        >
                            <SiNotion className="w-5 h-5 text-blue-500" />
                            <p className="text-blue-500">노션페이지 연동하기</p>
                        </button>
                    )}
                </div>

                {notionVerifyInfo.length > 0 && (
                    <div className="flex  flex-col gap-2">
                        {notionVerifyInfo.map((info) => (
                            <a
                                key={info.id}
                                href={info.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                            >
                                {info.title} 페이지
                            </a>
                        ))}
                    </div>
                )}
            </div>

            <div className="border border-solid border-gray-300 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">설정</h3>
                <div className="space-y-4">
                    <button onClick={() => router.push("/characters")} className="w-full btn-primary">
                        캐릭터 관리
                    </button>
                    <button onClick={ready} className="w-full btn-primary">
                        프로필 수정
                    </button>
                    <button
                        onClick={ready}
                        className="w-full py-2 px-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                    >
                        비밀번호 변경
                    </button>
                    <button
                        onClick={ready}
                        className="w-full py-2 px-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-red-500 dark:text-red-700 rounded-lg transition-colors"
                    >
                        회원 탈퇴
                    </button>
                </div>
            </div>
        </div>
    );
}
