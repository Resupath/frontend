import * as TE from "fp-ts/TaskEither";
import { api } from "@/src/utils/api";
import { Pagination } from "@/src/types/pagination";

interface Personality {
    id: string;
    keyword: string;
}

interface PersonalityCreateRequest {
    keywords: string[];
}

const createPersonality = (request: PersonalityCreateRequest): TE.TaskEither<Error, void> =>
    TE.tryCatch(
        async () => {
            await api.post<void>("/personalities/bulk", request);
        },
        (error) => new Error("Failed to create personality")
    );

const listPersonalities = (): TE.TaskEither<Error, Pagination<Personality>> =>
    TE.tryCatch(
        async () => {
            const response = await api.get<Pagination<Personality>>("/personalities");
            return response.data;
        },
        (error) => new Error("Failed to fetch personalities")
    );

const listPersonalitiesAll = (): TE.TaskEither<Error, Personality[]> =>
    TE.tryCatch(
        async () => {
            const response = await api.get<Personality[]>("/personalities/all");
            return response.data;
        },
        (error) => new Error("Failed to fetch personalities")
    );

export type { Personality, PersonalityCreateRequest };
export { createPersonality, listPersonalities, listPersonalitiesAll };
