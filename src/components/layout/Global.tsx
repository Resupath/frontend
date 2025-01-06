"use client";

import React, { FC, useEffect } from "react";
import { Modal } from "../modal/Modal";
import { api } from "@/src/utils/api";
import { AxiosResponse } from "axios";
import { pipe } from "fp-ts/lib/function";
import { useLoginModalStore } from "@/src/stores/useLoginModalStore";
import { useAuthStore } from "@/src/stores/useAuthStore";

import * as TE from "fp-ts/TaskEither";

/**
 * @author bkdragon
 * @function Global
 **/

export const Global: FC<{}> = () => {
    const { setAuth } = useAuthStore();
    const { isOpen, setIsOpen } = useLoginModalStore();

    const getUserToken = () =>
        pipe(
            TE.tryCatch(
                () =>
                    api.get<{
                        accessToken: string;
                    }>("/auth/user"),
                (error) => new Error("유저 토큰 발급 실패")
            ),
            TE.map((res) => res.data.accessToken),
            TE.map((accessToken) => setAuth({ userToken: accessToken })),
            TE.mapLeft((error) => console.error(error))
        )();

    const tryGoogleLogin = () =>
        pipe(
            TE.tryCatch(
                () => api.get<string>("/auth/google"),
                (error) => new Error("로그인 요청 실패")
            ),
            TE.map(redirectToGoogleLogin),
            TE.mapLeft((error) => console.error(error))
        )();

    const redirectToGoogleLogin = (response: AxiosResponse) => {
        const redirectUrl = response.data;
        window.location.href = redirectUrl;
    };

    useEffect(() => {
        getUserToken();
    }, []);

    return (
        <>
            {/* 로그인 모달 */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <Modal.Header>
                    <div className="p-4 border-b border-solid border-gray-200 dark:border-gray-800">
                        <h1 className="text-xl font-semibold">로그인</h1>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="flex flex-col gap-4 p-6">
                        <button
                            onClick={tryGoogleLogin}
                            className="flex items-center justify-center w-[200px] gap-2 px-4 py-2 font-medium transition-colors border border-gray-300 rounded-lg"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Google로 계속하기
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};
