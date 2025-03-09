import { SourceArrayRequiredForm } from "@/app/characters/create/page";
import React, { FC, useEffect, useState } from "react";

import { useFieldArray, UseFormRegister, Control, FieldErrors, useWatch, Controller } from "react-hook-form";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { FileUploadForm } from "./FileUploadForm";
import { notionVerify, VerifyPageResponse } from "@/src/types/auth";

import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";

interface ResumeFormProps {
    register: UseFormRegister<SourceArrayRequiredForm>;
    control: Control<SourceArrayRequiredForm>;
    errors: FieldErrors<SourceArrayRequiredForm>;
}

/**
 * @author
 * @function ResumeForm
 **/

export const ResumeForm: FC<ResumeFormProps> = ({ register, control, errors }) => {
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "resumes",
    });
    const resumes = useWatch({ control, name: "resumes" });

    console.log(resumes);

    const [notionVerifyInfo, setNotionVerifyInfo] = useState<VerifyPageResponse[]>([]);

    const asyncNotionVerify = () =>
        pipe(
            notionVerify(),
            TE.map((notionVerify) => setNotionVerifyInfo(notionVerify)),
            TE.mapLeft((error) => setNotionVerifyInfo([]))
        )();

    useEffect(() => {
        asyncNotionVerify();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                    이력서
                    <span className="ml-2 font-normal px-2 py-0.5 text-sm rounded-full bg-[#E5F6E8] dark:bg-green-900/30 text-[#2F9B4E] dark:text-green-400">
                        필수
                    </span>
                </h2>
                <button
                    onClick={() =>
                        append({
                            id: Date.now().toString(),
                            type: "link",
                            subtype: "resume",
                            url: "",
                        })
                    }
                    className="text-primary transition-colors"
                >
                    <FiPlus className="h-5 w-5" />
                </button>
            </div>
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="space-y-3">
                        <div className="flex gap-2">
                            <Controller
                                control={control}
                                name={`resumes.${index}.type`}
                                render={({ field: { value } }) => {
                                    return (
                                        <select
                                            value={value}
                                            onChange={(e) => {
                                                update(index, {
                                                    ...field,
                                                    type: e.target.value as "file" | "link",
                                                    url: "",
                                                });
                                            }}
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                        >
                                            <option value="file">파일</option>
                                            <option value="link">링크</option>
                                            <option value="notion">노션 링크</option>
                                        </select>
                                    );
                                }}
                            />
                            {index > 0 && (
                                <button
                                    title="삭제"
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="text-red-500 ml-auto"
                                >
                                    <FiTrash2 />
                                </button>
                            )}
                        </div>

                        {resumes[index]?.type === "file" && (
                            <Controller
                                control={control}
                                name={`resumes.${index}.url`}
                                render={({ field: { onChange } }) => {
                                    return (
                                        <FileUploadForm
                                            onChange={(file) => {
                                                const { fileUrl } = file;
                                                onChange(fileUrl);
                                            }}
                                            accept=".pdf"
                                        />
                                    );
                                }}
                            />
                        )}

                        {resumes[index]?.type === "link" && (
                            <div className="space-y-2 flex gap-2 items-center">
                                <input
                                    {...register(`resumes.${index}.url`)}
                                    placeholder="URL을 입력하세요"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none  dark:bg-gray-700"
                                />
                            </div>
                        )}

                        {resumes[index]?.type === "notion" && (
                            <div className="space-y-2 flex gap-2 items-center">
                                <select
                                    {...register(`resumes.${index}.url`)}
                                    value={resumes[index]?.url}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none  dark:bg-gray-700"
                                >
                                    {notionVerifyInfo.map((info) => (
                                        <option key={info.id} value={info.url}>
                                            {info.title} 페이지
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {errors?.resumes?.[index]?.url && (
                            <p className="text-red-500 text-sm">{errors.resumes[index]?.url?.message}</p>
                        )}
                    </div>
                ))}

                {/* 배열 레벨 에러 메시지 */}
                {errors?.resumes && !Array.isArray(errors.resumes) && (
                    <p className="text-red-500">{errors.resumes.message}</p>
                )}
            </div>
        </div>
    );
};
