import * as TE from "fp-ts/TaskEither";
import { api } from "../utils/api";
import { Pagination } from "./pagination";

interface Experience {
    id: string;
    companyName: string;
    position: string;
    description: string;
    startDate: string;
    sequence: number;
    endDate: string;
}

type ExperienceCreateRequest = Pick<Experience, "companyName" | "position" | "startDate" | "endDate" | "sequence">;

const createExperience = (request: ExperienceCreateRequest[]): TE.TaskEither<Error, void> =>
    TE.tryCatch(
        async () => {
            await api.post<void>("/experiences", { experiences: request });
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

export type { Experience, ExperienceCreateRequest };
export { createExperience, listExperiences };
