import { api } from "../utils/api";
import * as TE from "fp-ts/TaskEither";
import { Pagination } from "./pagination";

interface Position {
    id: string;
    keyword: string;
}

type PositionCreateRequest = Omit<Position, "id">;

const listPositions = (): TE.TaskEither<Error, Pagination<Position>> =>
    TE.tryCatch(
        async () => {
            const response = await api.get<Pagination<Position>>("/positions");
            console.log(response.data);
            return response.data;
        },
        (error) => new Error("Failed to fetch skills")
    );

const createPosition = (position: PositionCreateRequest): TE.TaskEither<Error, void> =>
    TE.tryCatch(
        async () => {
            await api.post<void>("/positions", position);
        },
        (error) => new Error("Failed to create position")
    );

export type { Position, PositionCreateRequest };

export { listPositions, createPosition };
