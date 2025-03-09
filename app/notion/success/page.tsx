"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import { api } from "@/src/utils/api";
import { useAlertStore } from "@/src/stores/useAlertStore";
import { useEffect } from "react";

export default function Home() {
    const { addAlert } = useAlertStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");

    const state = searchParams.get("state");

    const sendCode = (code: O.Option<string | null>) => {
        pipe(
            code,
            O.chain(O.fromNullable),
            O.fold(
                () => TE.left(new Error("인증 코드가 없습니다")),
                (validCode) => sendAuthCode(validCode)
            ),
            TE.mapLeft((error) => {
                addAlert("노션 인증 실패", "error");
                router.push("/mypage");
                return error;
            }),
            TE.map((response) => {
                addAlert("노션 인증에 성공했습니다", "success");
                router.push("/mypage");
            })
        )();
    };

    const sendAuthCode = (code: string) =>
        TE.tryCatch(
            () =>
                api.get("/auth/notion/link", {
                    params: { code, redirectUri: window.location.origin + "/notion/success" },
                }),
            (error) => new Error("토큰 요청 실패")
        );

    useEffect(() => {
        if (code) {
            sendCode(O.some(code));
        }
    }, [code]);

    return <div className="w-full h-full"></div>;
}
