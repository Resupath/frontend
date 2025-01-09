"use client";

import { useEffect, useState } from "react";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { Pagination } from "@/src/types/pagination";
import { listPersonalities, createPersonality, Personality, PersonalityCreateRequest } from "@/src/types/personality";
import { Listbox } from "@headlessui/react";
import { FiChevronDown, FiCheck, FiTrash2 } from "react-icons/fi";

const PERSONALITY_OPTIONS = [
    { id: 1, keyword: "적극적인" },
    { id: 2, keyword: "창의적인" },
    { id: 3, keyword: "분석적인" },
    { id: 4, keyword: "책임감 있는" },
    { id: 5, keyword: "협력적인" },
    { id: 6, keyword: "꼼꼼한" },
    { id: 7, keyword: "열정적인" },
    { id: 8, keyword: "리더십 있는" },
    { id: 9, keyword: "긍정적인" },
    { id: 10, keyword: "유연한" },
    { id: 11, keyword: "체계적인" },
    { id: 12, keyword: "의사소통 능력이 좋은" },
    { id: 13, keyword: "문제해결 능력이 뛰어난" },
    { id: 14, keyword: "도전적인" },
    { id: 15, keyword: "성실한" },
];

export default function PersonalitiesTab() {
    const [personalities, setPersonalities] = useState<Pagination<Personality>>({
        data: [],
        meta: { page: 1, take: 10, totalCount: 0, totalPage: 1 },
    });
    const [selectedPersonalities, setSelectedPersonalities] = useState<typeof PERSONALITY_OPTIONS>([]);

    const asyncCreatePersonalities = () =>
        pipe(
            createPersonality({ keywords: selectedPersonalities.map((p) => p.keyword) }),
            TE.mapLeft((error) => console.error(error))
        )().then(() => {
            setSelectedPersonalities([]);
            asyncListPersonalities();
        });

    const asyncListPersonalities = () =>
        pipe(
            listPersonalities(),
            TE.map((personalities) => setPersonalities(personalities)),
            TE.mapLeft((error) => console.error(error))
        )();

    useEffect(() => {
        asyncListPersonalities();
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">성격 추가</h3>
                <div className="space-y-4">
                    <Listbox value={selectedPersonalities} onChange={setSelectedPersonalities} multiple>
                        <div className="relative">
                            <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <span className="block truncate">
                                    {selectedPersonalities.length === 0
                                        ? "성격을 선택하세요"
                                        : selectedPersonalities.map((p) => p.keyword).join(", ")}
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <FiChevronDown className="h-5 w-5 text-gray-400" />
                                </span>
                            </Listbox.Button>
                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                {PERSONALITY_OPTIONS.map((personality) => (
                                    <Listbox.Option
                                        key={personality.id}
                                        value={personality}
                                        className={({ active }) =>
                                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                active
                                                    ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                                                    : "text-gray-900 dark:text-gray-100"
                                            }`
                                        }
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span
                                                    className={`block truncate ${
                                                        selected ? "font-medium" : "font-normal"
                                                    }`}
                                                >
                                                    {personality.keyword}
                                                </span>
                                                {selected ? (
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                                        <FiCheck className="h-5 w-5" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </div>
                    </Listbox>
                    <button
                        onClick={asyncCreatePersonalities}
                        disabled={selectedPersonalities.length === 0}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    >
                        추가
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">나의 성격</h3>
                <div className="space-y-3">
                    {personalities.data.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">아직 추가된 성격이 없습니다.</p>
                    ) : (
                        personalities.data.map((personality) => (
                            <div
                                key={personality.id}
                                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                                <div>
                                    <h4 className="font-medium">{personality.keyword}</h4>
                                </div>
                                <button
                                    onClick={() => {}}
                                    className="text-red-500 hover:text-red-600 transition-colors"
                                >
                                    <FiTrash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
