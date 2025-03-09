import * as TE from "fp-ts/TaskEither";
import { api } from "../utils/api";

export interface VerifyPageResponse {
    id: string;
    title: string;
    url: string;
}

const notionVerify = (): TE.TaskEither<boolean, VerifyPageResponse[]> =>
    TE.tryCatch(
        async () => {
            const response = await api.get<VerifyPageResponse[]>("/auth/notion/verify");
            return response.data || [];
        },
        (error) => {
            return false;
        }
    );

export { notionVerify };
