import * as TE from "fp-ts/TaskEither";
import { api } from "../utils/api";
import { Pagination } from "./pagination";

interface Experience {
    id: string;
    companyName: string;
    position: string;
    description: string | null;
    startDate: string;
    sequence: number;
    endDate: string;
}

type ExperienceCreateRequest = Pick<Experience, "companyName" | "position" | "startDate" | "endDate" | "sequence">;
type ExperienceUpdateRequest = Pick<Experience, "companyName" | "position" | "startDate" | "endDate" | "sequence"> & {
    id: string;
};

const createExperience = (request: ExperienceCreateRequest[]): TE.TaskEither<Error, void> =>
    TE.tryCatch(
        async () => {
            await api.post<void>("/experiences", { experiences: request });
        },
        (error) => new Error("Failed to create experience")
    );

const createExperienceInCharacter = (request: ExperienceCreateRequest[]): TE.TaskEither<Error, Experience[]> =>
    TE.tryCatch(
        async () => {
            const response = await api.post<Experience[]>("/experiences", { experiences: request });
            return response.data;
        },
        (error) => new Error("Failed to create experience")
    );

const listExperiences = (): TE.TaskEither<Error, Experience[]> =>
    TE.tryCatch(
        async () => {
            const response = await api.get<Experience[]>("/experiences");
            return response.data;
        },
        (error) => new Error("Failed to fetch experiences")
    );

const updateExperience = (request: ExperienceUpdateRequest): TE.TaskEither<Error, void> =>
    TE.tryCatch(
        async () => {
            await api.patch<void>(`/experiences/${request.id}`, request);
        },
        (error) => new Error("Failed to update experience")
    );

export type { Experience, ExperienceCreateRequest, ExperienceUpdateRequest };
export { createExperience, listExperiences, updateExperience, createExperienceInCharacter };
