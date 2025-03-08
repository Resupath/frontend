import React, { FC, InputHTMLAttributes, useState } from "react";
import { FiFile, FiFileText, FiImage, FiTrash2, FiUpload } from "react-icons/fi";
import { clsx } from "clsx";

import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { uploadFile } from "@/src/types/file";

interface FileUploadFormProps {
    accept?: InputHTMLAttributes<HTMLInputElement>["accept"];
    onChange: ({ fileUrl, fileName, fileType }: { fileUrl: string; fileName: string; fileType: string }) => void;
}

/**
 * @author
 * @function FileUploadForm
 **/

export const FileUploadForm: FC<FileUploadFormProps> = ({ onChange, accept = ".pdf,.doc,.docx,.md" }) => {
    const [name, setName] = useState("");
    const [isDragging, setIsDragging] = useState(false);

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

    const asyncUploadFile = (file: File) => {
        setName(file.name);

        pipe(
            uploadFile(file),
            TE.map((response) =>
                onChange({
                    fileUrl: response.data,
                    fileName: file.name,
                    fileType: file.type,
                })
            ),
            TE.mapLeft((error) => console.error(error))
        )();
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
        if (file) {
            // handleImageChange(file);
            asyncUploadFile(file);
        }
    };

    return (
        <div className="relative">
            <input
                type="file"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        asyncUploadFile(file);
                    }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept={accept}
            />
            <div
                className={clsx(
                    "w-full h-32 border-2  border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700",
                    isDragging && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex items-center justify-center h-full">
                    {name ? (
                        <div className="flex flex-row items-center justify-center gap-2">
                            {getFileIcon(name)}
                            <p className="text-sm text-gray-600 dark:text-gray-400">{name}</p>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onChange({ fileUrl: "", fileName: "", fileType: "" });
                                }}
                                className="ml-2 p-1 text-red-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <FiTrash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                            <FiUpload className="h-6 w-6 text-primary dark:text-primary" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-primary dark:text-primary font-medium">파일을 선택</span>
                                하거나 드래그하여 업로드
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {accept
                                    .split(",")
                                    .map((ext) => ext.toUpperCase())
                                    .join(", ")}{" "}
                                (최대 10MB)
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
