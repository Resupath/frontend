import * as TE from "fp-ts/TaskEither";
import { Personality } from "./personality";
import { Experience } from "./experience";
import { Position, PositionCreateRequest } from "./position";
import { Skill, SkillCreateRequest } from "./skill";
import { Source, SourceCreateRequest } from "./source";
import { api } from "../utils/api";
import { Pagination } from "./pagination";

interface Character {
    id: string;
    memberId: string;
    nickname: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    image: string | null;

    personalities: Array<Pick<Personality, "id" | "keyword">>;
    positions: Position[];
    skills: Array<Pick<Skill, "id" | "keyword">>;
    sources: Array<Pick<Source, "id" | "type" | "url" | "subtype" | "createdAt">>;
    experiences: Experience[];
    experienceYears: number;
    roomCount: number;
}

interface CharacterCreateRequest {
    nickname: string;
    isPublic: boolean;
    image: string | null;
    personalities: { id: string }[];
    experiences: { id: string }[];
    positions: { keyword: string }[];
    skills: { keyword: string }[];
    sources: SourceCreateRequest[];
}

const createCharacter = (request: CharacterCreateRequest): TE.TaskEither<Error, void> =>
    TE.tryCatch(
        async () => {
            await api.post<void>("/characters", request);
        },
        (error) => new Error("Failed to create character")
    );

const listCharacters = (page?: number): TE.TaskEither<Error, Pagination<Character>> =>
    TE.tryCatch(
        async () => {
            const response = await api.get<Pagination<Character>>("/characters", { params: { page } });
            return response.data;
        },
        (error) => new Error("Failed to fetch characters")
    );

export type { Character, CharacterCreateRequest };

export { listCharacters, createCharacter };
