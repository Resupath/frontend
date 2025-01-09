"use client";

import { Tab } from "@headlessui/react";
import { useRouter } from "next/navigation";
import PersonalitiesTab from "@/src/components/mypage/PersonalitiesTab";
import ExperiencesTab from "@/src/components/mypage/ExperiencesTab";
import { useAuthStore } from "@/src/stores/useAuthStore";

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

export default function MyPage() {
    const tabs = [
        { name: "프로필", component: <ProfileTab /> },
        { name: "성격", component: <PersonalitiesTab /> },
        { name: "경력", component: <ExperiencesTab /> },
    ];

    return (
        <main className="w-full h-full overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

                    <Tab.Group>
                        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-8">
                            {tabs.map((tab) => (
                                <Tab
                                    key={tab.name}
                                    className={({ selected }) =>
                                        classNames(
                                            "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                                            "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                                            selected
                                                ? "bg-white text-blue-700 shadow dark:bg-gray-800 dark:text-white"
                                                : "text-gray-600 hover:bg-white/[0.12] hover:text-white dark:text-gray-400"
                                        )
                                    }
                                >
                                    {tab.name}
                                </Tab>
                            ))}
                        </Tab.List>
                        <Tab.Panels>
                            {tabs.map((tab, idx) => (
                                <Tab.Panel
                                    key={idx}
                                    className={classNames(
                                        "rounded-xl",
                                        "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
                                    )}
                                >
                                    {tab.component}
                                </Tab.Panel>
                            ))}
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
        </main>
    );
}

function ProfileTab() {
    const { user } = useAuthStore();

    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-4xl text-gray-500 dark:text-gray-400">👤</span>
                    </div>
                    <div className="ml-6">
                        <h2 className="text-2xl font-semibold mb-2">{user?.name}</h2>
                        <p className="text-gray-600 dark:text-gray-300">example@email.com</p>
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
