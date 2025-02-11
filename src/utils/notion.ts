import * as TE from "fp-ts/TaskEither";
import { api } from "./api";
import { pipe } from "fp-ts/lib/function";

const privateNotionIdRegex = /https?:\/\/(www\.)?notion\.so\/(?:[^/]+\/)?[^\s/]*?([a-f0-9]{32})(?:\?[^\s]*)?$/;

/**
 * 노션 private url에서 id 부분을 반환한다.
 * private url 형식이 아니거나, id가 추출되지 않으면 null을 반환한다.
 */
function checkNotionUrl(url: string): boolean {
    const match = url.match(privateNotionIdRegex);
    return match ? true : false;
}

const notionLogin = (): TE.TaskEither<Error, string> =>
    TE.tryCatch(
        async () => {
            const response = await api.get("/auth/notion");
            return response.data;
        },
        (error) => new Error("Failed to login to notion")
    );

export { checkNotionUrl, notionLogin };
