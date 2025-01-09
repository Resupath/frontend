"use client";
import { Tab } from "@headlessui/react";
import PersonalitiesTab from "@/src/components/mypage/PersonalitiesTab";
import ExperiencesTab from "@/src/components/mypage/ExperiencesTab";
import ProfileTab from "@/src/components/mypage/ProfileTab";

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
