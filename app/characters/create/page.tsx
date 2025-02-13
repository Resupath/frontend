"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiPlus, FiTrash2, FiCheck, FiFile, FiFileText, FiImage, FiLink, FiUpload } from "react-icons/fi";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { Personality } from "@/src/types/personality";
import { Experience } from "@/src/types/experience";
import { listPersonalities } from "@/src/types/personality";
import { listExperiences } from "@/src/types/experience";
import { CharacterCreateRequest, createCharacter } from "@/src/types/character";
import { Listbox } from "@headlessui/react";
import SelectionModal from "@/src/components/modal/SelectionModal";
import { uploadFile } from "@/src/types/file";
import { validateForm, required, minLength, maxLength, url, minItems } from "@/src/utils/validation";
import { checkNotionUrl } from "@/src/utils/notion";
import { useAlertStore } from "@/src/stores/useAlertStore";

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

interface ValidationErrors {
    [key: string]: string;
}

const isValidUrl = (urlString: string): boolean => {
    try {
        new URL(urlString);
        return true;
    } catch {
        return false;
    }
};

export default function CreateCharacterPage() {
    const router = useRouter();
    const { addAlert } = useAlertStore();
    const [personalities, setPersonalities] = useState<Personality[]>([]);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [selectedPersonalities, setSelectedPersonalities] = useState<Personality[]>([]);
    const [selectedExperiences, setSelectedExperiences] = useState<Experience[]>([]);
    const [positions, setPositions] = useState<InputField[]>([{ id: "", value: "" }]);
    const [skills, setSkills] = useState<InputField[]>([{ id: "", value: "" }]);

    // source
    const [resumes, setResumes] = useState<SourceField[]>([
        { id: Date.now().toString(), type: "link", subtype: "resume", url: "" },
    ]);
    const [portfolios, setPortfolios] = useState<SourceField[]>([
        { id: Date.now().toString(), type: "link", subtype: "portfolio", url: "" },
    ]);
    const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});

    const [nickname, setNickname] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [image, setImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // 모달 상태
    const [personalityModalOpen, setPersonalityModalOpen] = useState(false);
    const [experienceModalOpen, setExperienceModalOpen] = useState(false);
    const [tempSelectedPersonalities, setTempSelectedPersonalities] = useState<Personality[]>([]);
    const [tempSelectedExperiences, setTempSelectedExperiences] = useState<Experience[]>([]);

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [dragTargetId, setDragTargetId] = useState<string | null>(null);

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
        value: string,
        fieldType: "position" | "skill"
    ) => {
        const newFields = currentFields.map((field) => (field.id === id ? { ...field, value } : field));
        setter(newFields);

        // Validate each field
        const newErrors: ValidationErrors = { ...errors };
        newFields.forEach((field, index) => {
            if (!field.value.trim()) {
                newErrors[`${fieldType}_${index}`] = `${fieldType === "position" ? "포지션" : "스킬"}을 입력해주세요`;
            } else {
                delete newErrors[`${fieldType}_${index}`];
            }
        });
        setErrors(newErrors);
    };

    const handleSourceChange = (id: string, field: keyof SourceField, value: string, type: "resume" | "portfolio") => {
        const newSources =
            type === "resume"
                ? resumes.map((resume) =>
                      resume.id === id
                          ? {
                                ...resume,
                                [field]: value,
                                // type이 변경될 때 url 초기화
                                ...(field === "type" && { url: "" }),
                            }
                          : resume
                  )
                : portfolios.map((portfolio) =>
                      portfolio.id === id
                          ? {
                                ...portfolio,
                                [field]: value,
                                // type이 변경될 때 url 초기화
                                ...(field === "type" && { url: "" }),
                            }
                          : portfolio
                  );

        if (type === "resume") {
            setResumes(newSources);
        } else {
            setPortfolios(newSources);
        }

        // Validate URL
        if (field === "url") {
            const newErrors: ValidationErrors = { ...errors };
            const sourceIndex = newSources.findIndex((s) => s.id === id);

            if (!value.trim()) {
                newErrors[`${type}_${sourceIndex}`] = `${
                    type === "resume" ? "이력서" : "포트폴리오"
                } URL을 입력해주세요`;
            } else if (!isValidUrl(value)) {
                newErrors[`${type}_${sourceIndex}`] = "올바른 URL 형식이 아닙니다";
            } else {
                delete newErrors[`${type}_${sourceIndex}`];
            }

            setErrors(newErrors);
        }
    };

    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNickname = e.target.value;
        setNickname(newNickname);

        const nicknameRules = [
            required("닉네임을 입력해주세요"),
            minLength(2, "닉네임은 2자 이상 입력해주세요"),
            maxLength(20, "닉네임은 20자까지 입력 가능합니다"),
        ];

        const result = validateForm({ nickname: newNickname }, { nickname: nicknameRules });
        const newErrors = { ...errors };
        if (result.nickname.isValid) {
            delete newErrors.nickname;
        } else {
            newErrors.nickname = result.nickname.message;
        }
        setErrors(newErrors);
    };

    const handlePersonalitiesChange = (newPersonalities: Personality[]) => {
        setTempSelectedPersonalities(newPersonalities);
    };

    const handleExperiencesChange = (newExperiences: Experience[]) => {
        setTempSelectedExperiences(newExperiences);
    };

    const handlePersonalitiesConfirm = () => {
        setSelectedPersonalities(tempSelectedPersonalities);
        const result = validateForm(
            { selectedPersonalities: tempSelectedPersonalities },
            { selectedPersonalities: [minItems(1, "최소 1개 이상의 성격을 선택해주세요")] }
        );
        const newErrors = { ...errors };
        if (result.selectedPersonalities.isValid) {
            delete newErrors.selectedPersonalities;
        } else {
            newErrors.selectedPersonalities = result.selectedPersonalities.message;
        }
        setErrors(newErrors);
        setPersonalityModalOpen(false);
    };

    const handleExperiencesConfirm = () => {
        setSelectedExperiences(tempSelectedExperiences);
        const result = validateForm(
            { selectedExperiences: tempSelectedExperiences },
            { selectedExperiences: [minItems(1, "최소 1개 이상의 경험을 선택해주세요")] }
        );
        const newErrors = { ...errors };
        if (result.selectedExperiences.isValid) {
            delete newErrors.selectedExperiences;
        } else {
            newErrors.selectedExperiences = result.selectedExperiences.message;
        }
        setErrors(newErrors);
        setExperienceModalOpen(false);
    };

    const validateInputs = () => {
        const validationRules = {
            nickname: [
                required("닉네임을 입력해주세요"),
                minLength(2, "닉네임은 2자 이상 입력해주세요"),
                maxLength(20, "닉네임은 20자까지 입력 가능합니다"),
            ],
            selectedPersonalities: [minItems(1, "최소 1개 이상의 성격을 선택해주세요")],
            selectedExperiences: [minItems(1, "최소 1개 이상의 경험을 선택해주세요")],
        };

        const values = {
            nickname,
            selectedPersonalities,
            selectedExperiences,
            positions: positions.filter((p) => p.value.trim()),
            skills: skills.filter((s) => s.value.trim()),
            resumes: resumes.filter((r) => r.url.trim()),
        };

        const validationResults = validateForm(values, validationRules);
        const newErrors: ValidationErrors = {};

        for (const [key, result] of Object.entries(validationResults)) {
            if (!result.isValid) {
                newErrors[key] = result.message;
            }
        }

        // 동적 필드 검증 (빈 값 체크)
        positions.forEach((position, index) => {
            if (!position.value.trim()) {
                newErrors[`position_${index}`] = "포지션을 입력해주세요";
            }
        });

        skills.forEach((skill, index) => {
            if (!skill.value.trim()) {
                newErrors[`skill_${index}`] = "스킬을 입력해주세요";
            }
        });

        resumes.forEach((resume, index) => {
            if (!resume.url.trim()) {
                newErrors[`resume_${index}`] = "이력서 URL을 입력해주세요";
            } else if (!isValidUrl(resume.url)) {
                newErrors[`resume_${index}`] = "올바른 URL 형식이 아닙니다";
            }
        });

        // 포트폴리오는 필수가 아니므로 URL 형식만 검증
        portfolios.forEach((portfolio, index) => {
            if (portfolio.url.trim() && !isValidUrl(portfolio.url)) {
                newErrors[`portfolio_${index}`] = "올바른 URL 형식이 아닙니다";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateInputs()) {
            return;
        }

        const request: CharacterCreateRequest = {
            nickname,
            isPublic,
            image,
            personalities: selectedPersonalities.map((p) => ({ id: p.id })),
            experiences: selectedExperiences.map((e) => ({ id: e.id })),
            positions: positions.map((p) => ({ keyword: p.value })),
            skills: skills.map((s) => ({ keyword: s.value })),
            sources: [...resumes, ...portfolios].map((s) => ({ type: s.type, subtype: s.subtype, url: s.url })),
        };

        pipe(
            createCharacter(request),
            TE.map(() => router.push("/characters")),
            TE.mapLeft((error) => console.error(error))
        )();
    };

    const handleImageChange = (file: File) => {
        if (file) {
            // const reader = new FileReader();
            // reader.onloadend = () => {
            //     setImage(reader.result as string);
            // };
            // reader.readAsDataURL(file);
            asyncUploadFile(file);
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

    const asyncUploadFile = (file: File) => {
        pipe(
            uploadFile(file),
            TE.map((response) => setImage(response.data)),
            TE.mapLeft((error) => console.error(error))
        )();
    };

    const handleFileUpload = async (file: File, sourceId: string, type: "resume" | "portfolio") => {
        if (file) {
            // 파일명 저장
            setFileNames((prev) => ({ ...prev, [sourceId]: file.name }));

            pipe(
                uploadFile(file),
                TE.map((response) => {
                    if (type === "resume") {
                        setResumes(
                            resumes.map((resume) =>
                                resume.id === sourceId ? { ...resume, url: response.data } : resume
                            )
                        );
                    } else {
                        setPortfolios(
                            portfolios.map((portfolio) =>
                                portfolio.id === sourceId ? { ...portfolio, url: response.data } : portfolio
                            )
                        );
                    }
                }),
                TE.mapLeft((error) => console.error(error))
            )();
        }
    };

    // 파일 아이콘을 결정하는 함수 추가
    const getFileIcon = (fileName: string) => {
        if (!fileName) return <FiFile className="h-5 w-5" />;

        const extension = fileName.split(".").pop()?.toLowerCase();

        switch (extension) {
            case "pdf":
                return <FiFileText className="h-5 w-5 text-red-500" />;
            case "doc":
            case "docx":
                return <FiFileText className="h-5 w-5 text-blue-500" />;
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
                return <FiImage className="h-5 w-5 text-green-500" />;
            default:
                return <FiFile className="h-5 w-5" />;
        }
    };

    const isValidFileType = (file: File, type: "resume" | "portfolio") => {
        const allowedTypes = [".pdf", ".doc", ".docx", ".md"];
        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        return allowedTypes.includes(extension);
    };

    const handleFileDrop = (e: React.DragEvent, sourceId: string, type: "resume" | "portfolio") => {
        e.preventDefault();
        setDragTargetId(null);
        const file = e.dataTransfer.files[0];
        if (file) {
            if (isValidFileType(file, type)) {
                handleFileUpload(file, sourceId, type);
            } else {
                addAlert(
                    "지원하지 않는 파일 형식입니다. PDF, DOC, DOCX, MD 파일만 업로드 가능합니다.",
                    "error"
                );
            }
        }
    };

    const handleFileSelect = (file: File, sourceId: string, type: "resume" | "portfolio") => {
        if (isValidFileType(file, type)) {
            handleFileUpload(file, sourceId, type);
        } else {
            addAlert(
                "지원하지 않는 파일 형식입니다. PDF, DOC, DOCX, MD 파일만 업로드 가능합니다.",
                "error"
            );
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
                                    닉네임 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="nickname"
                                    type="text"
                                    value={nickname}
                                    onChange={handleNicknameChange}
                                    placeholder="닉네임을 입력하세요"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 ${
                                        errors.nickname ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                    }`}
                                />
                                {errors.nickname && <p className="mt-1 text-sm text-red-500">{errors.nickname}</p>}
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
                            <h2 className="text-xl font-semibold">
                                성격 <span className="text-red-500">*</span>
                            </h2>
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
                        {errors.selectedPersonalities && (
                            <p className="mt-2 text-sm text-red-500">{errors.selectedPersonalities}</p>
                        )}
                    </div>

                    {/* 경험 선택 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                경험 <span className="text-red-500">*</span>
                            </h2>
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
                        {errors.selectedExperiences && (
                            <p className="mt-2 text-sm text-red-500">{errors.selectedExperiences}</p>
                        )}
                    </div>

                    {/* 포지션 입력 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                포지션 <span className="text-red-500">*</span>
                            </h2>
                            <button
                                onClick={() => handleAddField(setPositions, positions)}
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <FiPlus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {positions.map((position, index) => (
                                <div key={position.id} className="space-y-1">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={position.value}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    setPositions,
                                                    positions,
                                                    position.id,
                                                    e.target.value,
                                                    "position"
                                                )
                                            }
                                            placeholder="포지션을 입력하세요"
                                            className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 ${
                                                errors[`position_${index}`]
                                                    ? "border-red-500"
                                                    : "border-gray-300 dark:border-gray-600"
                                            }`}
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
                                    {errors[`position_${index}`] && (
                                        <p className="text-sm text-red-500">{errors[`position_${index}`]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.positions && <p className="mt-2 text-sm text-red-500">{errors.positions}</p>}
                    </div>

                    {/* 스킬 입력 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                스킬 <span className="text-red-500">*</span>
                            </h2>
                            <button
                                onClick={() => handleAddField(setSkills, skills)}
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <FiPlus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {skills.map((skill, index) => (
                                <div key={skill.id} className="space-y-1">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={skill.value}
                                            onChange={(e) =>
                                                handleFieldChange(setSkills, skills, skill.id, e.target.value, "skill")
                                            }
                                            placeholder="스킬을 입력하세요"
                                            className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 ${
                                                errors[`skill_${index}`]
                                                    ? "border-red-500"
                                                    : "border-gray-300 dark:border-gray-600"
                                            }`}
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
                                    {errors[`skill_${index}`] && (
                                        <p className="text-sm text-red-500">{errors[`skill_${index}`]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.skills && <p className="mt-2 text-sm text-red-500">{errors.skills}</p>}
                    </div>

                    {/* 소스 입력 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                이력서 <span className="text-red-500">*</span>
                            </h2>
                            <button
                                onClick={() =>
                                    setResumes([
                                        ...resumes,
                                        { id: Date.now().toString(), type: "link", subtype: "resume", url: "" },
                                    ])
                                }
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <FiPlus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {resumes.map((resume, index) => (
                                <div key={resume.id} className="space-y-3">
                                    <div className="flex gap-2">
                                        <select
                                            value={resume.type}
                                            onChange={(e) =>
                                                handleSourceChange(
                                                    resume.id,
                                                    "type",
                                                    e.target.value as "file" | "link",
                                                    "resume"
                                                )
                                            }
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                        >
                                            <option value="file">파일</option>
                                            <option value="link">링크</option>
                                        </select>
                                        {resumes.length > 1 && (
                                            <button
                                                onClick={() => setResumes(resumes.filter((s) => s.id !== resume.id))}
                                                className="text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <FiTrash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                    {resume.type === "file" ? (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileSelect(file, resume.id, "resume");
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                accept=".pdf,.doc,.docx,.md"
                                            />
                                            <div
                                                className={`w-full h-32 border-2 border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 
                                                ${dragTargetId === resume.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}
                                                ${resume.url ? "border-green-500 dark:border-green-400" : "border-gray-300 dark:border-gray-600"}
                                                flex flex-col items-center justify-center gap-2 transition-colors duration-200 group hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20`}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setDragTargetId(resume.id);
                                                }}
                                                onDragLeave={(e) => {
                                                    e.preventDefault();
                                                    setDragTargetId(null);
                                                }}
                                                onDrop={(e) => handleFileDrop(e, resume.id, "resume")}
                                            >
                                                {resume.url ? (
                                                    <div className="flex items-center gap-3">
                                                        {getFileIcon(fileNames[resume.id])}
                                                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                            {fileNames[resume.id] || "파일이 업로드됨"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                                                            <FiUpload className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                <span className="text-blue-500 dark:text-blue-400 font-medium">파일을 선택</span>하거나 드래그하여 업로드
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                PDF, DOC, DOCX, MD (최대 10MB)
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                value={resume.url}
                                                onChange={(e) =>
                                                    handleSourceChange(resume.id, "url", e.target.value, "resume")
                                                }
                                                placeholder="URL을 입력하세요"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 ${
                                                    errors[`resume_${index}`]
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                }`}
                                            />
                                        </>
                                    )}
                                    {checkNotionUrl(resume.url) && (
                                        <p className="text-sm text-red-500">노션 URL입니다.</p>
                                    )}
                                    {errors[`resume_${index}`] && (
                                        <p className="text-sm text-red-500">{errors[`resume_${index}`]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">포트폴리오</h2>
                            <button
                                onClick={() =>
                                    setPortfolios([
                                        ...portfolios,
                                        { id: Date.now().toString(), type: "link", subtype: "portfolio", url: "" },
                                    ])
                                }
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <FiPlus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {portfolios.map((portfolio, index) => (
                                <div key={portfolio.id} className="space-y-3">
                                    <div className="flex gap-2">
                                        <select
                                            value={portfolio.type}
                                            onChange={(e) =>
                                                handleSourceChange(
                                                    portfolio.id,
                                                    "type",
                                                    e.target.value as "file" | "link",
                                                    "portfolio"
                                                )
                                            }
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                        >
                                            <option value="file">파일</option>
                                            <option value="link">링크</option>
                                        </select>
                                        {portfolios.length > 1 && (
                                            <button
                                                onClick={() =>
                                                    setPortfolios(portfolios.filter((s) => s.id !== portfolio.id))
                                                }
                                                className="text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <FiTrash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                    {portfolio.type === "file" ? (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileSelect(file, portfolio.id, "portfolio");
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                accept=".pdf,.doc,.docx,.md"
                                            />
                                            <div
                                                className={`w-full h-32 border-2 border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 
                                                ${dragTargetId === portfolio.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}
                                                ${portfolio.url ? "border-green-500 dark:border-green-400" : "border-gray-300 dark:border-gray-600"}
                                                flex flex-col items-center justify-center gap-2 transition-colors duration-200 group hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20`}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setDragTargetId(portfolio.id);
                                                }}
                                                onDragLeave={(e) => {
                                                    e.preventDefault();
                                                    setDragTargetId(null);
                                                }}
                                                onDrop={(e) => handleFileDrop(e, portfolio.id, "portfolio")}
                                            >
                                                {portfolio.url ? (
                                                    <div className="flex items-center gap-3">
                                                        {getFileIcon(fileNames[portfolio.id])}
                                                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                            {fileNames[portfolio.id] || "파일이 업로드됨"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                                                            <FiUpload className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                <span className="text-blue-500 dark:text-blue-400 font-medium">파일을 선택</span>하거나 드래그하여 업로드
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                PDF, DOC, DOCX, MD (최대 10MB)
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={portfolio.url}
                                            onChange={(e) =>
                                                handleSourceChange(portfolio.id, "url", e.target.value, "portfolio")
                                            }
                                            placeholder="URL을 입력하세요"
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 ${
                                                errors[`portfolio_${index}`]
                                                    ? "border-red-500"
                                                    : "border-gray-300 dark:border-gray-600"
                                            }`}
                                        />
                                    )}

                                    {errors[`portfolio_${index}`] && (
                                        <p className="text-sm text-red-500">{errors[`portfolio_${index}`]}</p>
                                    )}
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
                onConfirm={handlePersonalitiesConfirm}
            >
                <Listbox value={tempSelectedPersonalities} onChange={handlePersonalitiesChange} multiple>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
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
                onConfirm={handleExperiencesConfirm}
            >
                <Listbox value={tempSelectedExperiences} onChange={handleExperiencesChange} multiple>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
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
