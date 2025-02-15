"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiPlus, FiTrash2, FiCheck, FiImage } from "react-icons/fi";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { listPersonalitiesAll, Personality } from "@/src/types/personality";
import { Experience } from "@/src/types/experience";
import { listExperiences } from "@/src/types/experience";
import { Listbox } from "@headlessui/react";
import SelectionModal from "@/src/components/modal/SelectionModal";
import { uploadFile } from "@/src/types/file";
import { checkNotionUrl } from "@/src/utils/notion";
import { useAlertStore } from "@/src/stores/useAlertStore";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResumeForm } from "@/src/components/form/ResumeForm";
import { PortfolioForm } from "@/src/components/form/PortfolioForm";
import { CharacterCreateRequest, createCharacter } from "@/src/types/character";

interface InputField {
    id: string;
    keyword: string;
}

const InputFieldSchema = z.object({
    id: z.string(),
    keyword: z.string().min(1, "값을 입력해주세요."),
});

const CharacterDefaultSchema = z.object({
    nickname: z.string().min(2, "닉네임은 2자 이상 입력해주세요"),
    isPublic: z.boolean(),
    image: z.string().url("올바른 URL 형식이 아닙니다").nullable(),

    personalities: z.array(InputFieldSchema).min(1, "한개 이상의 성격을 선택해주세요."),
    experiences: z
        .array(
            z.object({
                id: z.string(),
                companyName: z.string(),
                position: z.string(),
                startDate: z.string(),
                endDate: z.string(),
                description: z.string().nullable(),
                sequence: z.number(),
            })
        )
        .min(1, "한개 이상의 경험을 선택해주세요."),
    positions: z.array(InputFieldSchema).min(1, "한개 이상의 포지션을 입력해주세요."),
    skills: z.array(InputFieldSchema).min(1, "한개 이상의 스킬을 입력해주세요."),
});

const SourceFieldSchema = z.object({
    id: z.string(),
    type: z.enum(["file", "link"]),
    subtype: z.enum(["resume", "portfolio"]),
    url: z.string().url("올바른 URL 형식이 아닙니다"),
});
export type SourceField = z.infer<typeof SourceFieldSchema>;

const SourceArrayFormSchema = z.object({
    portfolios: z.array(SourceFieldSchema),
});

const SourceArrayRequiredFormSchema = z.object({
    resumes: z.array(SourceFieldSchema).min(1, "최소 1개 이상 추가해주세요."),
});

export type SourceArrayForm = z.infer<typeof SourceArrayFormSchema>;
export type SourceArrayRequiredForm = z.infer<typeof SourceArrayRequiredFormSchema>;

export default function CreateCharacterPage() {
    const router = useRouter();
    const { addAlert } = useAlertStore();
    const [personalities, setPersonalities] = useState<Personality[]>([]);
    const [experiences, setExperiences] = useState<Experience[]>([]);

    console.log(experiences, "experiences");

    const {
        register: defaultRegister,
        control: defaultControl,
        formState: { errors: defaultErrors },
        setValue: defaultSetValue,
        watch: defaultWatch,
        trigger: defaultTrigger,
    } = useForm<z.infer<typeof CharacterDefaultSchema>>({
        resolver: zodResolver(CharacterDefaultSchema),
        mode: "onChange",
        defaultValues: {
            nickname: "",
            isPublic: true,
            image: null,
            personalities: [],
            experiences: [],
            positions: [{ id: Date.now().toString(), keyword: "" }],
            skills: [{ id: Date.now().toString(), keyword: "" }],
        },
    });

    console.log(defaultErrors, "defaultErrors");

    const { append: appendPositions, remove: removePositions } = useFieldArray({
        control: defaultControl,
        name: "positions",
    });

    const { append: appendSkills, remove: removeSkills } = useFieldArray({
        control: defaultControl,
        name: "skills",
    });

    const [image, setImage] = useState<string | null>(null);

    const {
        register: resumeRegister,
        control: resumeControl,
        formState: { errors: resumeErrors },
        trigger: resumeTrigger,
        getValues: resumeGetValues,
    } = useForm<SourceArrayRequiredForm>({
        resolver: zodResolver(SourceArrayRequiredFormSchema),
        mode: "onChange",
        defaultValues: { resumes: [{ id: Date.now().toString(), type: "file", subtype: "resume", url: "" }] },
    });

    const {
        register: portfolioRegister,
        control: portfolioControl,
        formState: { errors: portfolioErrors },
        trigger: portfolioTrigger,
        getValues: portfolioGetValues,
    } = useForm<SourceArrayForm>({
        resolver: zodResolver(SourceArrayFormSchema),
        mode: "onChange",
        defaultValues: { portfolios: [] },
    });

    const [isDragging, setIsDragging] = useState(false);

    // 모달 상태
    const [personalityModalOpen, setPersonalityModalOpen] = useState(false);
    const [experienceModalOpen, setExperienceModalOpen] = useState(false);

    const [tempSelectedPersonalities, setTempSelectedPersonalities] = useState<Personality[]>([]);
    const [tempSelectedExperiences, setTempSelectedExperiences] = useState<Experience[]>([]);

    useEffect(() => {
        // 성격 목록 조회
        pipe(
            listPersonalitiesAll(),
            TE.map((response) => setPersonalities(response)),
            TE.mapLeft((error) => console.error(error))
        )();

        // 경험 목록 조회
        pipe(
            listExperiences(),
            TE.map((response) => setExperiences(response)),
            TE.mapLeft((error) => console.error(error))
        )();
    }, []);

    const handlePersonalitiesChange = (newPersonalities: InputField[]) => {
        setTempSelectedPersonalities(newPersonalities);
    };

    const handleExperiencesChange = (newExperiences: Experience[]) => {
        setTempSelectedExperiences(newExperiences);
    };

    const handlePersonalitiesConfirm = () => {
        defaultSetValue("personalities", tempSelectedPersonalities, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        });
        setPersonalityModalOpen(false);
    };

    const handleExperiencesConfirm = () => {
        defaultSetValue("experiences", tempSelectedExperiences, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        });
        setExperienceModalOpen(false);
    };

    const handleSubmit = async () => {
        const isDefaultValid = await defaultTrigger();
        const isResumeValid = await resumeTrigger();
        const isPortfolioValid = await portfolioTrigger();

        if (!isDefaultValid || !isResumeValid || !isPortfolioValid) {
            const scrollToFirstError = () => {
                if (!isDefaultValid) {
                    const element = document.getElementById("nickname");
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "center" });
                        return;
                    }
                }

                if (!isResumeValid) {
                    const element = document.getElementById("resume-section");
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "center" });
                        return;
                    }
                }
                if (!isPortfolioValid) {
                    const element = document.getElementById("portfolio-section");
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "center" });
                        return;
                    }
                }
            };

            scrollToFirstError();

            return;
        }

        const request: CharacterCreateRequest = {
            nickname: defaultWatch("nickname"),
            isPublic: defaultWatch("isPublic"),
            image: image,
            personalities: tempSelectedPersonalities.map((p) => ({ id: p.id })),
            experiences: tempSelectedExperiences.map((e) => ({ id: e.id })),
            positions: defaultWatch("positions").map((p) => ({ keyword: p.keyword })),
            skills: defaultWatch("skills").map((s) => ({ keyword: s.keyword })),
            sources: [...resumeGetValues("resumes"), ...portfolioGetValues("portfolios")].map((s) => ({
                type: s.type,
                subtype: s.subtype,
                url: s.url,
            })),
        };
        pipe(
            createCharacter(request),
            TE.map(() => router.push("/characters")),
            TE.mapLeft((error) => console.error(error))
        )();
    };

    const handleImageChange = (file: File) => {
        if (file) {
            pipe(
                uploadFile(file),
                TE.map((response) => setImage(response.data)),
                TE.mapLeft((error) => console.error(error))
            )();
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
                                    닉네임 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="nickname"
                                    type="text"
                                    {...defaultRegister("nickname")}
                                    placeholder="닉네임을 입력하세요"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700`}
                                />
                                {defaultErrors.nickname && (
                                    <p className="mt-2 text-sm text-red-500">{defaultErrors.nickname.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">공개 여부</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={defaultWatch("isPublic")}
                                            onChange={() => defaultSetValue("isPublic", true)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span>공개</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={!defaultWatch("isPublic")}
                                            onChange={() => defaultSetValue("isPublic", false)}
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
                                    } rounded-lg border-2 border-dashed transition-colors duration-200 flex flex-col items-center justify-center overflow-hidden dark:bg-gray-700
                                    `}
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
                                                <FiImage className="mx-auto h-12 w-12 text-blue-500 dark:text-blue-400" />
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
                    <div id="personalities" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                성격 <span className="text-red-500">*</span>
                            </h2>
                            <button
                                onClick={() => {
                                    setTempSelectedPersonalities(defaultWatch("personalities"));
                                    setPersonalityModalOpen(true);
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                선택하기
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {defaultWatch("personalities").length === 0 ? (
                                <p className="text-gray-500">선택된 성격이 없습니다.</p>
                            ) : (
                                defaultWatch("personalities").map((personality) => (
                                    <span
                                        key={personality.id}
                                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                                    >
                                        {personality.keyword}
                                    </span>
                                ))
                            )}
                        </div>
                        {defaultErrors.personalities && (
                            <p className="mt-2 text-sm text-red-500">{defaultErrors.personalities.message}</p>
                        )}
                    </div>

                    {/* 경험 선택 */}
                    <div id="experiences" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                경험 <span className="text-red-500">*</span>
                            </h2>
                            <button
                                onClick={() => {
                                    setTempSelectedExperiences(defaultWatch("experiences"));
                                    setExperienceModalOpen(true);
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                선택하기
                            </button>
                        </div>
                        <div className="space-y-2">
                            {defaultWatch("experiences").length === 0 ? (
                                <p className="text-gray-500">선택된 경험이 없습니다.</p>
                            ) : (
                                defaultWatch("experiences").map((experience) => (
                                    <div key={experience.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="font-medium">{experience.companyName}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {experience.position}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {defaultErrors.experiences && (
                            <p className="mt-2 text-sm text-red-500">{defaultErrors.experiences.message}</p>
                        )}
                    </div>

                    {/* 포지션 입력 */}
                    <div id="positions" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                포지션 <span className="text-red-500">*</span>
                            </h2>
                            <button
                                onClick={() => appendPositions({ id: Date.now().toString(), keyword: "" })}
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <FiPlus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {defaultWatch("positions").map((position, index) => (
                                <div key={position.id} className="space-y-1">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            {...defaultRegister(`positions.${index}.keyword`)}
                                            placeholder="포지션을 입력하세요"
                                            className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700
                                               
                                            `}
                                        />
                                        {defaultWatch("positions").length > 1 && (
                                            <button
                                                onClick={() => removePositions(index)}
                                                className="text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <FiTrash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                    {defaultErrors.positions?.[index]?.keyword && (
                                        <p className="text-sm mt-2 text-red-500">
                                            {defaultErrors.positions?.[index]?.keyword?.message}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                        {defaultErrors.positions && (
                            <p className="mt-2 text-sm text-red-500">{defaultErrors.positions.message}</p>
                        )}
                    </div>

                    {/* 스킬 입력 */}
                    <div id="skills" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                스킬 <span className="text-red-500">*</span>
                            </h2>
                            <button
                                onClick={() => appendSkills({ id: Date.now().toString(), keyword: "" })}
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <FiPlus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {defaultWatch("skills").map((skill, index) => (
                                <div key={skill.id} className="space-y-1">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={skill.keyword}
                                            {...defaultRegister(`skills.${index}.keyword`)}
                                            placeholder="스킬을 입력하세요"
                                            className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 `}
                                        />
                                        {defaultWatch("skills").length > 1 && (
                                            <button
                                                onClick={() => removeSkills(index)}
                                                className="text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <FiTrash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                    {defaultErrors.skills?.[index]?.keyword && (
                                        <p className="text-sm mt-2 text-red-500">
                                            {defaultErrors.skills?.[index]?.keyword?.message}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                        {defaultErrors.skills && (
                            <p className="mt-2 text-sm text-red-500">{defaultErrors.skills.message}</p>
                        )}
                    </div>

                    <div id="resume-section" />
                    <ResumeForm register={resumeRegister} control={resumeControl} errors={resumeErrors} />
                    <div id="portfolio-section" />
                    <PortfolioForm register={portfolioRegister} control={portfolioControl} errors={portfolioErrors} />
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
                    <div className="grid grid-cols-4 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {personalities.map((personality) => (
                            <Listbox.Option
                                key={personality.id}
                                value={personality}
                                className={({ active, selected }) =>
                                    `relative cursor-pointer select-none p-3 rounded-lg ${
                                        selected
                                            ? "bg-blue-50 dark:bg-blue-900/50 border-2 border-blue-500 dark:border-blue-400"
                                            : active
                                            ? "bg-gray-50 dark:bg-gray-700"
                                            : "border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                    }`
                                }
                            >
                                {({ selected }) => (
                                    <div className="flex flex-col items-center text-center">
                                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                            {personality.keyword}
                                        </span>
                                        {selected && (
                                            <div className="text-blue-500 dark:text-blue-400 mt-1">
                                                <FiCheck className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
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
                <Listbox
                    value={tempSelectedExperiences}
                    onChange={(newExperiences) => handleExperiencesChange(newExperiences)}
                    multiple
                >
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
