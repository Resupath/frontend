"use client";

import { useEffect, useState } from "react";
import { pipe } from "fp-ts/function";
import {
    Experience,
    createExperience,
    listExperiences,
    ExperienceCreateRequest,
    updateExperience,
} from "@/src/types/experience";
import { FiPlus, FiTrash2, FiEdit } from "react-icons/fi";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";

interface ExperiencesTabProps {
    initialData: Experience[];
}

export default function ExperiencesTab({ initialData }: ExperiencesTabProps) {
    const [experiences, setExperiences] = useState<Experience[]>(initialData);
    const [selectedExperience, setSelectedExperience] = useState<O.Option<Experience>>(O.none);
    const [newExperiences, setNewExperiences] = useState<Omit<ExperienceCreateRequest, "sequence">[]>([
        {
            companyName: "",
            position: "",
            startDate: "",
            endDate: "",
        },
    ]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = (value: string, fieldName: string): string => {
        if (!value.trim()) return `${fieldName}을(를) 입력해주세요`;
        return "";
    };

    const validateDates = (startDate: string, endDate: string): string => {
        if (!startDate || !endDate) return ""; // 빈 값은 개별 필드 검증에서 처리
        return new Date(startDate) <= new Date(endDate) ? "" : "시작일은 종료일보다 빨라야 합니다";
    };

    const handleInputChange = (
        index: number,
        field: keyof Omit<ExperienceCreateRequest, "sequence">,
        value: string
    ) => {
        setNewExperiences((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };

            // 필드별 유효성 검사
            let error = "";
            switch (field) {
                case "companyName":
                    error = validateField(value, "회사명");
                    break;
                case "position":
                    error = validateField(value, "직책");
                    break;
                case "startDate":
                case "endDate":
                    error = validateDates(
                        field === "startDate" ? value : updated[index].startDate,
                        field === "endDate" ? value : updated[index].endDate
                    );
                    break;
            }

            if (error) {
                setErrors((prev) => ({
                    ...prev,
                    [`${field}_${index}`]: error,
                }));
            } else {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[`${field}_${index}`];
                    return newErrors;
                });
            }

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

    const validateExperience = (experience: Omit<ExperienceCreateRequest, "sequence">, index: number): boolean => {
        let isValid = true;
        const newErrors: Record<string, string> = {};

        // 회사명 검증
        const companyNameError = validateField(experience.companyName, "회사명");
        if (companyNameError) {
            newErrors[`companyName_${index}`] = companyNameError;
            isValid = false;
        }

        // 직책 검증
        const positionError = validateField(experience.position, "직책");
        if (positionError) {
            newErrors[`position_${index}`] = positionError;
            isValid = false;
        }

        // 날짜 검증
        const dateError = validateDates(experience.startDate, experience.endDate);
        if (dateError) {
            newErrors[`date_${index}`] = dateError;
            isValid = false;
        }

        const startDateError = validateField(experience.startDate, "시작일");
        if (startDateError) {
            newErrors[`startDate_${index}`] = startDateError;
            isValid = false;
        }

        const endDateError = validateField(experience.endDate, "종료일");
        if (endDateError) {
            newErrors[`endDate_${index}`] = endDateError;
            isValid = false;
        }

        setErrors((prev) => ({
            ...prev,
            ...newErrors,
        }));

        return isValid;
    };

    const handleSubmit = () => {
        // 모든 경험 데이터 검증
        const isValid = newExperiences.every((exp, index) => validateExperience(exp, index));

        if (!isValid) return;

        const validExperiences = newExperiences.filter(
            (exp) =>
                exp.companyName.trim() !== "" ||
                exp.position.trim() !== "" ||
                exp.startDate.trim() !== "" ||
                exp.endDate.trim() !== ""
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

    const handleSelectExperience = (experience: Experience) => {
        if (O.isSome(selectedExperience)) {
            if (confirm("현재 수정 중인 경럭이 있습니다. 취소하시겠습니까?")) {
                setSelectedExperience(O.some(experience));
            }
        } else {
            setSelectedExperience(O.some(experience));
        }
    };

    const handleCancelEdit = () => {
        setSelectedExperience(O.none);
    };

    const handleEditInputChange = (
        experience: Experience,
        field: keyof Omit<Experience, "id" | "sequence">,
        value: string
    ) => {
        setSelectedExperience(
            O.some({
                ...experience,
                [field]: value,
            })
        );
    };

    const handleUpdateExperience = (selectedExperience: O.Option<Experience>) => {
        pipe(
            selectedExperience,
            O.fold(
                () => TE.left(new Error("No experience selected")),
                (experience) =>
                    pipe(
                        updateExperience(experience),
                        TE.chain(() => listExperiences()),
                        TE.map((updatedExperiences) => {
                            setExperiences(updatedExperiences);
                            setSelectedExperience(O.none);
                        })
                    )
            ),
            TE.mapLeft((error) => console.error(error))
        )();
    };

    useEffect(() => {
        if (initialData.length === 0) {
            pipe(
                listExperiences(),
                TE.map(setExperiences),
                TE.mapLeft((error) => console.error(error))
            )();
        }
    }, [initialData]);

    return (
        <div className="space-y-6">
            <div className="border border-solid border-gray-300 dark:border-gray-700 rounded-lg  p-6">
                <h3 className="text-xl font-semibold mb-4">경력 추가</h3>
                <div className="space-y-6">
                    {newExperiences.map((experience, index) => (
                        <div key={index} className="space-y-4">
                            {index > 0 && <div className="border-t border-gray-200 dark:border-gray-700 pt-4" />}
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-medium">경력 {index + 1}</h4>
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
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 ${
                                            errors[`companyName_${index}`]
                                                ? "border-red-500"
                                                : "border-gray-300 dark:border-gray-600"
                                        }`}
                                    />
                                    {errors[`companyName_${index}`] && (
                                        <p className="text-sm text-red-500 mt-1">{errors[`companyName_${index}`]}</p>
                                    )}
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
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 ${
                                            errors[`position_${index}`]
                                                ? "border-red-500"
                                                : "border-gray-300 dark:border-gray-600"
                                        }`}
                                    />
                                    {errors[`position_${index}`] && (
                                        <p className="text-sm text-red-500 mt-1">{errors[`position_${index}`]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        시작일
                                    </label>
                                    <input
                                        type="date"
                                        value={experience.startDate}
                                        onChange={(e) => handleInputChange(index, "startDate", e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 ${
                                            errors[`startDate_${index}`]
                                                ? "border-red-500"
                                                : "border-gray-300 dark:border-gray-600"
                                        }`}
                                    />
                                    {errors[`startDate_${index}`] && (
                                        <p className="text-sm text-red-500 mt-1">{errors[`startDate_${index}`]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        종료일
                                    </label>
                                    <input
                                        type="date"
                                        value={experience.endDate}
                                        onChange={(e) => handleInputChange(index, "endDate", e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 ${
                                            errors[`endDate_${index}`]
                                                ? "border-red-500"
                                                : "border-gray-300 dark:border-gray-600"
                                        }`}
                                    />
                                    {errors[`endDate_${index}`] && (
                                        <p className="text-sm text-red-500 mt-1">{errors[`endDate_${index}`]}</p>
                                    )}
                                </div>
                            </div>
                            {errors[`date_${index}`] && (
                                <p className="text-sm text-red-500">{errors[`date_${index}`]}</p>
                            )}
                        </div>
                    ))}
                    <div className="flex gap-4">
                        <button
                            onClick={addNewExperience}
                            className="flex items-center gap-2 px-4 py-2 text-primary transition-colors"
                        >
                            <FiPlus className="h-5 w-5" />새 경력 추가
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 py-2 px-4 bg-primary  text-on-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            저장
                        </button>
                    </div>
                </div>
            </div>

            <div className="border border-solid border-gray-300 dark:border-gray-700 rounded-lg  p-6">
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
                                {O.isSome(selectedExperience) && selectedExperience.value.id === experience.id ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    회사명
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedExperience.value.companyName}
                                                    onChange={(e) =>
                                                        handleEditInputChange(
                                                            selectedExperience.value,
                                                            "companyName",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    직책
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedExperience.value.position}
                                                    onChange={(e) =>
                                                        handleEditInputChange(
                                                            selectedExperience.value,
                                                            "position",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    시작일
                                                </label>
                                                <input
                                                    type="date"
                                                    value={selectedExperience.value.startDate}
                                                    onChange={(e) =>
                                                        handleEditInputChange(
                                                            selectedExperience.value,
                                                            "startDate",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    종료일
                                                </label>
                                                <input
                                                    type="date"
                                                    value={selectedExperience.value.endDate}
                                                    onChange={(e) =>
                                                        handleEditInputChange(
                                                            selectedExperience.value,
                                                            "endDate",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                                            >
                                                취소
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleUpdateExperience(selectedExperience);
                                                }}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                            >
                                                저장
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium text-lg">{experience.companyName}</h4>
                                            <p className="text-gray-600 dark:text-gray-400">{experience.position}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                                {experience.startDate} - {experience.endDate}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    handleSelectExperience(experience);
                                                }}
                                                className="text-primary transition-colors"
                                            >
                                                <FiEdit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => {}}
                                                className="text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <FiTrash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
