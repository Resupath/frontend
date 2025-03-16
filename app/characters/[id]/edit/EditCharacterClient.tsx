"use client";

import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAlertStore } from "@/src/stores/useAlertStore";
import { api } from "@/src/utils/api";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { FiArrowLeft, FiPlus, FiTrash2, FiCheck, FiImage, FiAlertCircle } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

import { Character, CharacterCreateRequest, updateCharacter, deleteCharacter } from "@/src/types/character";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Listbox } from "@headlessui/react";
import SelectionModal from "@/src/components/modal/SelectionModal";
import { listPersonalitiesAll, Personality } from "@/src/types/personality";
import { Experience, listExperiences } from "@/src/types/experience";
import { ResumeForm } from "@/src/components/form/ResumeForm";
import { PortfolioForm } from "@/src/components/form/PortfolioForm";
import { uploadFile } from "@/src/types/file";
import { SearchInput } from "@/src/components/search/SearchInput";

interface EditCharacterClientProps {
    initialCharacter: Character;
}

const InputFieldSchema = z.object({
    id: z.string(),
    keyword: z.string().min(1, "값을 입력해주세요."),
});

const CharacterDefaultSchema = z.object({
    nickname: z.string().min(2, "닉네임은 2자 이상 입력해주세요"),
    isPublic: z.boolean(),
    image: z.string().url("올바른 URL 형식이 아닙니다").nullable(),
    description: z.string(),
    personalities: z.array(InputFieldSchema).min(1, "한개 이상의 성격을 선택해주세요."),
    experiences: z.array(
        z.object({
            id: z.string(),
            companyName: z.string(),
            position: z.string(),
            startDate: z.string(),
            endDate: z.string(),
            description: z.string().nullable(),
            sequence: z.number(),
        })
    ),
    positions: z.array(InputFieldSchema).min(1, "한개 이상의 포지션을 입력해주세요."),
    skills: z.array(InputFieldSchema).min(1, "한개 이상의 스킬을 입력해주세요."),
});

const SourceFieldSchema = z.object({
    id: z.string(),
    type: z.enum(["file", "link", "notion"]),
    subtype: z.enum(["resume", "portfolio"]),
    url: z.string().url("올바른 URL 형식이 아닙니다"),
});

const SourceArrayFormSchema = z.object({
    portfolios: z.array(SourceFieldSchema),
});

const SourceArrayRequiredFormSchema = z.object({
    resumes: z.array(SourceFieldSchema).min(1, "최소 1개 이상 추가해주세요."),
});

export type SourceField = z.infer<typeof SourceFieldSchema>;
export type SourceArrayForm = z.infer<typeof SourceArrayFormSchema>;
export type SourceArrayRequiredForm = z.infer<typeof SourceArrayRequiredFormSchema>;

export default function EditCharacterClient({ initialCharacter }: EditCharacterClientProps) {
    const { user } = useAuthStore();
    const router = useRouter();
    const { addAlert } = useAlertStore();
    const [personalities, setPersonalities] = useState<Personality[]>([]);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [image, setImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [personalityModalOpen, setPersonalityModalOpen] = useState(false);
    const [experienceModalOpen, setExperienceModalOpen] = useState(false);
    const [tempSelectedPersonalities, setTempSelectedPersonalities] = useState<Personality[]>([]);
    const [tempSelectedExperiences, setTempSelectedExperiences] = useState<Experience[]>([]);

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
            description: "",
            positions: [{ id: Date.now().toString(), keyword: "" }],
            skills: [{ id: Date.now().toString(), keyword: "" }],
        },
    });

    const {
        register: resumeRegister,
        control: resumeControl,
        formState: { errors: resumeErrors },
        trigger: resumeTrigger,
        getValues: resumeGetValues,
        setValue: resumeSetValue,
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
        setValue: portfolioSetValue,
    } = useForm<SourceArrayForm>({
        resolver: zodResolver(SourceArrayFormSchema),
        mode: "onChange",
        defaultValues: { portfolios: [] },
    });

    const { append: appendPositions, remove: removePositions } = useFieldArray({
        control: defaultControl,
        name: "positions",
    });

    const { append: appendSkills, remove: removeSkills } = useFieldArray({
        control: defaultControl,
        name: "skills",
    });

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

    // 초기 데이터 설정
    useEffect(() => {
        if (initialCharacter) {
            defaultSetValue("nickname", initialCharacter.nickname);
            defaultSetValue("isPublic", initialCharacter.isPublic);
            setImage(initialCharacter.image);
            defaultSetValue("personalities", initialCharacter.personalities);
            setTempSelectedPersonalities(initialCharacter.personalities);
            defaultSetValue("experiences", initialCharacter.experiences);
            setTempSelectedExperiences(initialCharacter.experiences);
            defaultSetValue("description", initialCharacter.description);
            defaultSetValue(
                "positions",
                initialCharacter.positions.map((p) => ({
                    id: p.id,
                    keyword: p.keyword,
                }))
            );
            defaultSetValue(
                "skills",
                initialCharacter.skills.map((s) => ({
                    id: s.id,
                    keyword: s.keyword,
                }))
            );

            // Resume와 Portfolio 초기값 설정
            const resumes = initialCharacter.sources.filter((s) => s.subtype === "resume");
            const portfolios = initialCharacter.sources.filter((s) => s.subtype === "portfolio");

            const isNotionUrl = (url: string): boolean => {
                if (!url) return false;

                const notionUrlPattern = /^https:\/\/(www\.)?(notion\.(so|site))/;
                return notionUrlPattern.test(url);
            };

            resumeSetValue(
                "resumes",
                resumes.map((r) => ({
                    id: r.id,
                    type: isNotionUrl(r.url) ? "notion" : r.type,
                    subtype: "resume" as const,
                    url: r.url,
                }))
            );

            portfolioSetValue(
                "portfolios",
                portfolios.map((p) => ({
                    id: p.id,
                    type: isNotionUrl(p.url) ? "notion" : p.type,
                    subtype: "portfolio" as const,
                    url: p.url,
                }))
            );
        }
    }, [initialCharacter, defaultSetValue, resumeSetValue, portfolioSetValue]);

    const handlePersonalitiesChange = (newPersonalities: Personality[]) => {
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
            description: defaultWatch("description"),
            image: image,
            personalities: tempSelectedPersonalities.map((p) => ({ id: p.id })),
            experiences: tempSelectedExperiences.map((e) => ({ id: e.id })),
            positions: defaultWatch("positions").map((p) => ({ keyword: p.keyword })),
            skills: defaultWatch("skills").map((s) => ({ keyword: s.keyword })),
            sources: [...resumeGetValues("resumes"), ...portfolioGetValues("portfolios")].map((s) => ({
                type: s.type == "notion" || s.type == "link" ? "link" : s.type,
                subtype: s.subtype,
                url: s.url,
            })),
        };

        pipe(
            updateCharacter(initialCharacter.id, request),
            TE.map(() => {
                router.push("/characters");
            }),
            TE.mapLeft((error) => {
                console.error(error);
                addAlert("캐릭터 수정에 실패했습니다.", "error");
            })
        )();
    };

    // 삭제 핸들러 추가
    const handleDelete = () => {
        if (confirm("정말로 이 캐릭터를 삭제하시겠습니까?")) {
            pipe(
                deleteCharacter(initialCharacter.id),
                TE.map(() => {
                    // router.push("/characters");
                    router.back();
                    addAlert("캐릭터가 삭제되었습니다.", "success");
                }),
                TE.mapLeft((error) => {
                    console.error(error);
                    addAlert("캐릭터 삭제에 실패했습니다.", "error");
                })
            )();
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
                    <h1 className="text-3xl font-bold">캐릭터 수정</h1>
                </div>

                {/* 기본 정보 입력 */}
                <div className="space-y-6">
                    <div className="p-6 flex justify-between gap-[67px]">
                        <div className="w-fit">
                            <div>
                                <div
                                    className={`relative mt-2 w-[192px] h-[192px] aspect-square rounded-full border-2 border-dashed transition-colors duration-200 flex flex-col items-center justify-center overflow-hidden dark:bg-gray-700`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {image ? (
                                        <div className="relative w-full h-full group">
                                            <img
                                                src={image}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full">
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
                                                <FiImage className="mx-auto h-12 w-12 text-primary" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-around flex-1">
                            <div>
                                <label htmlFor="nickname" className="block text-lg font-semibold mb-1">
                                    닉네임 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="nickname"
                                    type="text"
                                    {...defaultRegister("nickname")}
                                    placeholder="닉네임을 입력하세요"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none bg-gray-50 dark:bg-gray-700`}
                                />
                                {defaultErrors.nickname && (
                                    <p className="mt-2 text-sm text-red-500">{defaultErrors.nickname.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-lg font-semibold mb-1">공개 여부</label>
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
                        </div>
                    </div>

                    {/* 성격 선택 */}
                    <div
                        id="personalities"
                        className="relative overflow-hidden rounded-[32px] border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => {
                            setTempSelectedPersonalities(defaultWatch("personalities"));
                            setPersonalityModalOpen(true);
                        }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-[#FFE7BA] dark:bg-amber-900/30 flex items-center justify-center">
                                <span className="text-2xl">😊</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        {user?.name}님의 캐릭터 성격
                                    </h2>
                                    <span className="px-2 py-0.5 text-sm rounded-full bg-[#E5F6E8] dark:bg-green-900/30 text-[#2F9B4E] dark:text-green-400">
                                        필수
                                    </span>
                                </div>
                                <p className="text-primary mt-1">캐릭터 성격 골라보기</p>
                            </div>
                            <div className="text-primary">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </div>
                        </div>
                        {defaultWatch("personalities").length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {defaultWatch("personalities").map((personality) => (
                                    <span
                                        key={personality.id}
                                        className="px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                                    >
                                        {personality.keyword}
                                    </span>
                                ))}
                            </div>
                        )}
                        {defaultErrors.personalities && (
                            <p className="mt-3 text-sm text-red-500 flex items-center gap-1.5">
                                <FiAlertCircle className="h-4 w-4" />
                                {defaultErrors.personalities.message}
                            </p>
                        )}
                    </div>

                    {/* 경력 선택 */}
                    <div id="experiences" className="rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">경력</h2>
                        </div>

                        <div className="mt-4 flex gap-4">
                            <button
                                onClick={() => {
                                    setTempSelectedExperiences(defaultWatch("experiences"));
                                    setExperienceModalOpen(true);
                                }}
                                className="px-4 py-2 text-primary dark:bg-gray-700 border border-solid border-primary rounded-lg transition-colors"
                            >
                                경력 불러오기
                            </button>
                        </div>

                        <div className="space-y-2 mt-4">
                            {defaultWatch("experiences").length === 0 ? (
                                <p className="text-gray-500">선택된 경력이 없습니다.</p>
                            ) : (
                                defaultWatch("experiences").map((experience) => (
                                    <div key={experience.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="font-medium">{experience.companyName}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {experience.position}
                                        </div>
                                        <div className="text-xs text-gray-400 dark:text-gray-400">
                                            {experience.startDate} ~ {experience.endDate}
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
                    <div id="positions" className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                포지션
                                <span className="ml-2 font-normal px-2 py-0.5 text-sm rounded-full bg-[#E5F6E8] dark:bg-green-900/30 text-[#2F9B4E] dark:text-green-400">
                                    필수
                                </span>
                            </h2>
                        </div>

                        <div className="mb-4">
                            <SearchInput
                                apiType="position"
                                onSelect={(value) => {
                                    appendPositions({ id: Date.now().toString(), keyword: value });
                                }}
                            />
                        </div>

                        <div className="flex flex-row gap-2 flex-wrap">
                            {defaultWatch("positions").map((position, index) => (
                                <div
                                    key={position.id}
                                    className="flex gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-2"
                                >
                                    <p>{position.keyword}</p>
                                    <button
                                        onClick={() => removePositions(index)}
                                        className="text-text hover:text-red-600 transition-colors"
                                    >
                                        <RxCross2 className="text-sm" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {defaultErrors.positions && (
                            <p className="mt-2 text-sm text-red-500">{defaultErrors.positions.message}</p>
                        )}
                    </div>

                    {/* 스킬 입력 */}
                    <div id="skills" className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                스킬
                                <span className="ml-2 font-normal px-2 py-0.5 text-sm rounded-full bg-[#E5F6E8] dark:bg-green-900/30 text-[#2F9B4E] dark:text-green-400">
                                    필수
                                </span>
                            </h2>
                        </div>

                        <div className="mb-4">
                            <SearchInput
                                apiType="skill"
                                onSelect={(value) => {
                                    appendSkills({ id: Date.now().toString(), keyword: value });
                                }}
                            />
                        </div>

                        <div className="flex flex-row gap-2 flex-wrap">
                            {defaultWatch("skills").map((skill, index) => (
                                <div key={skill.id} className="flex gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                                    <p>{skill.keyword}</p>
                                    <button
                                        onClick={() => removeSkills(index)}
                                        className="text-text hover:text-red-600 transition-colors"
                                    >
                                        <RxCross2 className="text-sm" />
                                    </button>
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

                    <div id="description-section" className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                그 외에 캐릭터에서 반드시 가르치고 싶은 내용이 있나요?
                            </h2>
                        </div>
                        <textarea
                            value={defaultWatch("description") || ""}
                            {...defaultRegister("description")}
                            placeholder="캐릭터에서 반드시 가르치고 싶은 내용을 입력하세요"
                            rows={5}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none bg-gray-50 dark:bg-gray-700 resize-none`}
                        />
                    </div>

                    <div className="flex justify-between gap-4">
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                            삭제
                        </button>
                        <div className="flex gap-4">
                            <button
                                onClick={() => router.back()}
                                className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-primary text-on-primary rounded-lg transition-colors"
                            >
                                수정
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 성격 선택 모달 */}
            <SelectionModal
                isOpen={personalityModalOpen}
                onClose={() => setPersonalityModalOpen(false)}
                title="본인을 묘사하기에 적합한 성격 유형을 골라주세요."
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
                                            ? "border-2 text-primary font-semibold border-primary dark:border-primary"
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
                                    </div>
                                )}
                            </Listbox.Option>
                        ))}
                    </div>
                </Listbox>
            </SelectionModal>

            {/* 경력 선택 모달 */}
            <SelectionModal
                isOpen={experienceModalOpen}
                onClose={() => setExperienceModalOpen(false)}
                title="본인을 묘사하기에 적합한 경력을 골라주세요."
                onConfirm={handleExperiencesConfirm}
            >
                <Listbox value={tempSelectedExperiences} onChange={handleExperiencesChange} multiple>
                    <div className="grid grid-cols-4 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {experiences.map((experience) => (
                            <Listbox.Option
                                key={experience.id}
                                value={experience}
                                className={({ active, selected }) =>
                                    `relative cursor-pointer select-none p-3 rounded-lg ${
                                        selected
                                            ? "border-2 text-primary font-semibold border-primary dark:border-primary"
                                            : active
                                            ? "bg-gray-50 dark:bg-gray-700"
                                            : "border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                    }`
                                }
                            >
                                {({ selected }) => (
                                    <div className="flex flex-col items-center text-center">
                                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                            {experience.companyName}
                                        </span>
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
