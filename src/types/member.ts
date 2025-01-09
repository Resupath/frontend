import * as TE from "fp-ts/TaskEither";
import { api } from "../utils/api";

interface Provider {
    id: string;
    type: string;
    createdAt: string;
}

interface Member {
    id: string;
    name: string;
    createdAt: string;
    providers: Provider[];
}

const getMyInfo = (): TE.TaskEither<Error, Member> =>
    TE.tryCatch(
        async () => {
            const response = await api.get<Member>("/members/info");
            return response.data;
        },
        (error) => new Error("Failed to fetch my info")
    );

export type { Member };

export { getMyInfo };
