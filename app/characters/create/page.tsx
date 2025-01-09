"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiPlus, FiTrash2, FiCheck } from "react-icons/fi";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { Personality } from "@/src/types/personality";
import { Experience } from "@/src/types/experience";
import { listPersonalities } from "@/src/types/personality";
import { listExperiences } from "@/src/types/experience";
import { CharacterCreateRequest, createCharacter } from "@/src/types/character";
import { Listbox } from "@headlessui/react";
import SelectionModal from "@/src/components/modal/SelectionModal";

interface InputField {
    id: string;
    value: string;
}

interface SourceField {
    id: string;
    type: "file" | "link";
    subtype: string;
    url: string;
}

export default function CreateCharacterPage() {
    const router = useRouter();
    const [personalities, setPersonalities] = useState<Personality[]>([]);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [selectedPersonalities, setSelectedPersonalities] = useState<Personality[]>([]);
    const [selectedExperiences, setSelectedExperiences] = useState<Experience[]>([]);
    const [positions, setPositions] = useState<InputField[]>([{ id: "", value: "" }]);
    const [skills, setSkills] = useState<InputField[]>([{ id: "", value: "" }]);
    const [sources, setSources] = useState<SourceField[]>([{ id: "", type: "link", subtype: "", url: "" }]);
    const [nickname, setNickname] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [image, setImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // 모달 상태
    const [personalityModalOpen, setPersonalityModalOpen] = useState(false);
    const [experienceModalOpen, setExperienceModalOpen] = useState(false);
    const [tempSelectedPersonalities, setTempSelectedPersonalities] = useState<Personality[]>([]);
    const [tempSelectedExperiences, setTempSelectedExperiences] = useState<Experience[]>([]);

    useEffect(() => {
        // 성격 목록 조회
        pipe(
            listPersonalities(),
            TE.map((response) => setPersonalities(response.data)),
            TE.mapLeft((error) => console.error(error))
        )();

        // 경험 목록 조회
        pipe(
            listExperiences(),
            TE.map((response) => setExperiences(response)),
            TE.mapLeft((error) => console.error(error))
        )();
    }, []);

    const handleAddField = (
        setter: React.Dispatch<React.SetStateAction<InputField[]>>,
        currentFields: InputField[]
    ) => {
        setter([...currentFields, { id: Date.now().toString(), value: "" }]);
    };

    const handleRemoveField = (
        setter: React.Dispatch<React.SetStateAction<InputField[]>>,
        currentFields: InputField[],
        id: string
    ) => {
        setter(currentFields.filter((field) => field.id !== id));
    };

    const handleFieldChange = (
        setter: React.Dispatch<React.SetStateAction<InputField[]>>,
        currentFields: InputField[],
        id: string,
        value: string
    ) => {
        setter(currentFields.map((field) => (field.id === id ? { ...field, value } : field)));
    };

    const handleSourceChange = (id: string, field: keyof SourceField, value: string) => {
        setSources(sources.map((source) => (source.id === id ? { ...source, [field]: value } : source)));
    };

    const handleSubmit = () => {
        const request: CharacterCreateRequest = {
            nickname,
            isPublic,
            image,
            personalities: selectedPersonalities.map((p) => ({ id: p.id })),
            experiences: selectedExperiences.map((e) => ({ id: e.id })),
            positions: positions.map((p) => ({ keyword: p.value })),
            skills: skills.map((s) => ({ keyword: s.value })),
            sources: sources.map((s) => ({ type: s.type, subtype: s.subtype, url: s.url })),
        };

        pipe(
            createCharacter(request),
            TE.map(() => router.push("/characters")),
            TE.mapLeft((error) => console.error(error))
        )();
    };

    const handleImageChange = (file: File) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleImageChange(file);
        }
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <FiArrowLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-3xl font-bold">새 캐릭터 생성</h1>
                </div>

                <div className="space-y-6">
                    {/* 기본 정보 입력 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="nickname" className="block text-sm font-medium mb-1">
                                    닉네임
                                </label>
                                <input
                                    id="nickname"
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="닉네임을 입력하세요"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">공개 여부</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={isPublic}
                                            onChange={() => setIsPublic(true)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span>공개</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={!isPublic}
                                            onChange={() => setIsPublic(false)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span>비공개</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="image" className="block text-sm font-medium mb-1">
                                    이미지
                                </label>
                                <div
                                    className={`relative mt-2 ${
                                        image ? "h-64" : "h-48"
                                    } rounded-lg border-2 border-dashed transition-colors duration-200 flex flex-col items-center justify-center overflow-hidden
                                    ${
                                        isDragging
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {image ? (
                                        <div className="relative w-full h-full group">
                                            <img src={image} alt="Preview" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                                <button
                                                    onClick={() => setImage(null)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    이미지 제거
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageChange(file);
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="text-center">
                                                <FiPlus className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
                                                    <span className="relative cursor-pointer rounded-md font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                                        이미지를 선택하거나
                                                    </span>
                                                    <p className="pl-1">드래그하여 업로드하세요</p>
                                                </div>
                                                <p className="text-xs leading-5 text-gray-600 dark:text-gray-400">
                                                    PNG, JPG, GIF up to 10MB
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 성격 선택 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">성격</h2>
                            <button
                                onClick={() => {
                                    setTempSelectedPersonalities(selectedPersonalities);
                                    setPersonalityModalOpen(true);
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                선택하기
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedPersonalities.length === 0 ? (
                                <p className="text-gray-500">선택된 성격이 없습니다.</p>
                            ) : (
                                selectedPersonalities.map((personality) => (
                                    <span
                                        key={personality.id}
                                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                                    >
                                        {personality.keyword}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 경험 선택 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">경험</h2>
                            <button
                                onClick={() => {
                                    setTempSelectedExperiences(selectedExperiences);
                                    setExperienceModalOpen(true);
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                선택하기
                            </button>
                        </div>
                        <div className="space-y-2">
                            {selectedExperiences.length === 0 ? (
                                <p className="text-gray-500">선택된 경험이 없습니다.</p>
                            ) : (
                                selectedExperiences.map((experience) => (
                                    <div key={experience.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="font-medium">{experience.companyName}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {experience.position}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 포지션 입력 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">포지션</h2>
                            <button
                                onClick={() => handleAddField(setPositions, positions)}
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <FiPlus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {positions.map((position) => (
                                <div key={position.id} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={position.value}
                                        onChange={(e) =>
                                            handleFieldChange(setPositions, positions, position.id, e.target.value)
                                        }
                                        placeholder="포지션을 입력하세요"
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                    />
                                    {positions.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveField(setPositions, positions, position.id)}
                                            className="text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            <FiTrash2 className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 스킬 입력 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">스킬</h2>
                            <button
                                onClick={() => handleAddField(setSkills, skills)}
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <FiPlus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {skills.map((skill) => (
                                <div key={skill.id} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={skill.value}
                                        onChange={(e) => handleFieldChange(setSkills, skills, skill.id, e.target.value)}
                                        placeholder="스킬을 입력하세요"
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                    />
                                    {skills.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveField(setSkills, skills, skill.id)}
                                            className="text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            <FiTrash2 className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 소스 입력 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">소스</h2>
                            <button
                                onClick={() =>
                                    setSources([
                                        ...sources,
                                        { id: Date.now().toString(), type: "link", subtype: "", url: "" },
                                    ])
                                }
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <FiPlus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {sources.map((source) => (
                                <div key={source.id} className="space-y-3">
                                    <div className="flex gap-2">
                                        <select
                                            value={source.type}
                                            onChange={(e) =>
                                                handleSourceChange(source.id, "type", e.target.value as "file" | "link")
                                            }
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                        >
                                            <option value="file">파일</option>
                                            <option value="link">링크</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={source.subtype}
                                            onChange={(e) => handleSourceChange(source.id, "subtype", e.target.value)}
                                            placeholder="서브타입을 입력하세요"
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                        />
                                        {sources.length > 1 && (
                                            <button
                                                onClick={() => setSources(sources.filter((s) => s.id !== source.id))}
                                                className="text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <FiTrash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={source.url}
                                        onChange={(e) => handleSourceChange(source.id, "url", e.target.value)}
                                        placeholder="URL을 입력하세요"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            생성
                        </button>
                    </div>
                </div>
            </div>

            {/* 성격 선택 모달 */}
            <SelectionModal
                isOpen={personalityModalOpen}
                onClose={() => setPersonalityModalOpen(false)}
                title="성격 선택"
                onConfirm={() => setSelectedPersonalities(tempSelectedPersonalities)}
            >
                <Listbox value={tempSelectedPersonalities} onChange={setTempSelectedPersonalities} multiple>
                    <div className="space-y-2">
                        {personalities.map((personality) => (
                            <Listbox.Option
                                key={personality.id}
                                value={personality}
                                className={({ active, selected }) =>
                                    `relative cursor-pointer select-none p-4 rounded-lg flex items-center ${
                                        selected
                                            ? "bg-blue-50 dark:bg-blue-900/50 border-2 border-blue-500 dark:border-blue-400"
                                            : active
                                            ? "bg-gray-50 dark:bg-gray-700"
                                            : "border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                    }`
                                }
                            >
                                {({ selected }) => (
                                    <>
                                        <div className="flex-1">
                                            <span className={`block ${selected ? "font-medium" : "font-normal"}`}>
                                                {personality.keyword}
                                            </span>
                                        </div>
                                        {selected && (
                                            <div className="text-blue-500 dark:text-blue-400">
                                                <FiCheck className="h-5 w-5" />
                                            </div>
                                        )}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </div>
                </Listbox>
            </SelectionModal>

            {/* 경험 선택 모달 */}
            <SelectionModal
                isOpen={experienceModalOpen}
                onClose={() => setExperienceModalOpen(false)}
                title="경험 선택"
                onConfirm={() => setSelectedExperiences(tempSelectedExperiences)}
            >
                <Listbox value={tempSelectedExperiences} onChange={setTempSelectedExperiences} multiple>
                    <div className="space-y-2">
                        {experiences.map((experience) => (
                            <Listbox.Option
                                key={experience.id}
                                value={experience}
                                className={({ active, selected }) =>
                                    `relative cursor-pointer select-none p-4 rounded-lg ${
                                        selected
                                            ? "bg-blue-50 dark:bg-blue-900/50 border-2 border-blue-500 dark:border-blue-400"
                                            : active
                                            ? "bg-gray-50 dark:bg-gray-700"
                                            : "border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                    }`
                                }
                            >
                                {({ selected }) => (
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className={`${selected ? "font-medium" : "font-normal"}`}>
                                                {experience.companyName}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {experience.position}
                                            </div>
                                        </div>
                                        {selected && (
                                            <div className="text-blue-500 dark:text-blue-400">
                                                <FiCheck className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Listbox.Option>
                        ))}
                    </div>
                </Listbox>
            </SelectionModal>
        </main>
    );
}
