"use client";

import { useEffect, useState } from "react";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { Experience, createExperience, listExperiences, ExperienceCreateRequest } from "@/src/types/experience";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export default function ExperiencesTab() {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [newExperiences, setNewExperiences] = useState<Omit<ExperienceCreateRequest, "sequence">[]>([
        {
            companyName: "",
            position: "",
            startDate: "",
            endDate: "",
        },
    ]);

    const handleInputChange = (
        index: number,
        field: keyof Omit<ExperienceCreateRequest, "sequence">,
        value: string
    ) => {
        setNewExperiences((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addNewExperience = () => {
        setNewExperiences((prev) => [
            ...prev,
            {
                companyName: "",
                position: "",
                startDate: "",
                endDate: "",
            },
        ]);
    };

    const removeExperience = (index: number) => {
        setNewExperiences((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        const validExperiences = newExperiences.filter(
            (exp) => exp.companyName.trim() !== "" || exp.position.trim() !== ""
        );

        if (validExperiences.length === 0) return;

        const requests = validExperiences.map((exp, index) => ({
            ...exp,
            sequence: experiences.length + index,
        }));

        pipe(
            createExperience(requests),
            TE.mapLeft((error) => console.error(error))
        )().then(() => {
            setNewExperiences([
                {
                    companyName: "",
                    position: "",
                    startDate: "",
                    endDate: "",
                },
            ]);
            pipe(
                listExperiences(),
                TE.map(setExperiences),
                TE.mapLeft((error) => console.error(error))
            )();
        });
    };

    useEffect(() => {
        pipe(
            listExperiences(),
            TE.map(setExperiences),
            TE.mapLeft((error) => console.error(error))
        )();
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">경력 추가</h3>
                <div className="space-y-6">
                    {newExperiences.map((experience, index) => (
                        <div key={index} className="space-y-4">
                            {index > 0 && <div className="border-t border-gray-200 dark:border-gray-700 pt-4" />}
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-medium">경험 {index + 1}</h4>
                                {index > 0 && (
                                    <button
                                        onClick={() => removeExperience(index)}
                                        className="text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        <FiTrash2 className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        회사명
                                    </label>
                                    <input
                                        type="text"
                                        value={experience.companyName}
                                        onChange={(e) => handleInputChange(index, "companyName", e.target.value)}
                                        placeholder="회사명을 입력하세요"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        직책
                                    </label>
                                    <input
                                        type="text"
                                        value={experience.position}
                                        onChange={(e) => handleInputChange(index, "position", e.target.value)}
                                        placeholder="직책을 입력하세요"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        시작일
                                    </label>
                                    <input
                                        type="date"
                                        value={experience.startDate}
                                        onChange={(e) => handleInputChange(index, "startDate", e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        종료일
                                    </label>
                                    <input
                                        type="date"
                                        value={experience.endDate}
                                        onChange={(e) => handleInputChange(index, "endDate", e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex gap-4">
                        <button
                            onClick={addNewExperience}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            <FiPlus className="h-5 w-5" />새 경력 추가
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            저장
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">나의 경력</h3>
                <div className="space-y-4">
                    {experiences.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">아직 추가된 경력 없습니다.</p>
                    ) : (
                        experiences.map((experience) => (
                            <div
                                key={experience.id}
                                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-lg">{experience.companyName}</h4>
                                        <p className="text-gray-600 dark:text-gray-400">{experience.position}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                            {experience.startDate} - {experience.endDate}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {}}
                                        className="text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        <FiTrash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
