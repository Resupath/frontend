"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/src/utils/api";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { pipe } from "fp-ts/lib/function";

import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import { useRoomStore } from "@/src/stores/useRoomStore";

export default function Home() {
    const { setAuth } = useAuthStore((state) => state);
    const { asyncListRooms } = useRoomStore((state) => state);
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");

    const getToken = (code: O.Option<string | null>) =>
        pipe(
            code,
            O.chain(O.fromNullable),
            O.fold(
                () => TE.left(new Error("인증 코드가 없습니다")),
                (validCode) => sendAuthCode(validCode)
            ),
            TE.mapLeft((error) => handleError()),
            TE.map((response) => saveToken(response.data))
        )();

    const sendAuthCode = (code: string) =>
        TE.tryCatch(
            () =>
                api.get<{
                    id: string;
                    name: string;
                    accessToken: string;
                    refreshToken: string;
                }>("/auth/google/callback", {
                    params: { code, redirectUri: window.location.origin + "/oauth2/success" },
                }),
            (error) => new Error("토큰 요청 실패")
        );

    const saveToken = async (data: { id: string; name: string; accessToken: string; refreshToken: string }) => {
        setAuth(data);
        await asyncListRooms();
        router.push("/");
    };

    const handleError = () => {
        router.push("/");
    };

    useEffect(() => {
        if (code) {
            getToken(O.some(code));
        }
    }, [code]);

    return <div className="w-full h-full" />;
}
