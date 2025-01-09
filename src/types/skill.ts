import { api } from "../utils/api";
import * as TE from "fp-ts/TaskEither";
import { Pagination } from "./pagination";

interface Skill {
    id: string;
    keyword: string;
}

type SkillCreateRequest = Omit<Skill, "id">;

const listSkills = (): TE.TaskEither<Error, Pagination<Skill>> =>
    TE.tryCatch(
        async () => {
            const response = await api.get<Pagination<Skill>>("/skills");
            console.log(response.data);
            return response.data;
        },
        (error) => new Error("Failed to fetch skills")
    );

const createSkill = (skill: SkillCreateRequest): TE.TaskEither<Error, void> =>
    TE.tryCatch(
        async () => {
            await api.post<void>("/skills", skill);
        },
        (error) => new Error("Failed to create skill")
    );

export type { Skill, SkillCreateRequest };

export { listSkills, createSkill };
