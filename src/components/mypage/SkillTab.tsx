"use client";

import { useEffect, useState } from "react";
import { Skill, SkillCreateRequest, createSkill, listSkills } from "@/src/types/skill";
import { pipe } from "fp-ts/function";

import * as TE from "fp-ts/TaskEither";
import { Pagination } from "@/src/types/pagination";

export default function SkillTab() {
    const [skills, setSkills] = useState<Pagination<Skill>>({
        data: [],
        meta: { page: 1, take: 10, totalCount: 0, totalPage: 1 },
    });
    const [newSkill, setNewSkill] = useState("");

    const asyncCreateSkill = (skill: SkillCreateRequest) =>
        pipe(
            createSkill(skill),
            TE.mapLeft((error) => console.error(error))
        )().then(() => {
            setNewSkill("");
            asyncListSkills();
        });

    const asyncListSkills = () =>
        pipe(
            listSkills(),
            TE.map((skills) => setSkills(skills)),
            TE.mapLeft((error) => console.error(error))
        )();

    useEffect(() => {
        asyncListSkills();
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">스킬 추가</h3>
                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="스킬 이름"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                asyncCreateSkill({ keyword: newSkill.trim() });
                            }
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />

                    <button
                        onClick={() => asyncCreateSkill({ keyword: newSkill.trim() })}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        추가
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">보유 스킬</h3>
                {skills.data.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">아직 추가된 스킬이 없습니다.</p>
                ) : (
                    <div className="space-y-3">
                        {skills.data.map((skill) => (
                            <div
                                key={skill.id}
                                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                                <div>
                                    <h4 className="font-medium">{skill.keyword}</h4>
                                </div>
                                <button
                                    onClick={() => {}}
                                    className="text-red-500 hover:text-red-600 transition-colors"
                                >
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
