import * as TE from "fp-ts/TaskEither";
import { api } from "@/src/utils/api";

const uploadFile = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return TE.tryCatch(
        () =>
            api.post<string>("/files/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }),
        (error) => error
    );
};

const getFileUrl = (key: string) => {
    return TE.tryCatch(
        () => api.get<string>(`/files/upload-url?key=${key}`),
        (error) => error
    );
};

export { uploadFile, getFileUrl };
