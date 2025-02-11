import * as TE from "fp-ts/TaskEither";
import { api } from "../utils/api";

const notionVerify = (): TE.TaskEither<boolean, boolean> =>
    TE.tryCatch(
        async () => {
            const response = await api.get<boolean>("/auth/notion/verify");
            return true;
        },
        (error) => {
            return false;
        }
    );

export { notionVerify };
