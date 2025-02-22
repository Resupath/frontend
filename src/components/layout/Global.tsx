"use client";

import React, { FC, useEffect } from "react";
import { Modal } from "../modal/Modal";
import { api } from "@/src/utils/api";
import { AxiosResponse } from "axios";
import { pipe } from "fp-ts/lib/function";
import { useLoginModalStore } from "@/src/stores/useLoginModalStore";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { FaGoogle, FaGithub, FaLinkedin } from "react-icons/fa";

import * as TE from "fp-ts/TaskEither";
import AlertModal from "../modal/AlertModal";
import { useAlertStore } from "@/src/stores/useAlertStore";

/**
 * @author bkdragon
 * @function Global
 **/

export const Global: FC<{}> = () => {
    const { setAuth, user } = useAuthStore();
    const { isOpen, setIsOpen } = useLoginModalStore();
    const { addAlert } = useAlertStore();

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
                () => api.get<string>(`/auth/google?redirectUri=${window.location.origin}/oauth2/success`),
                (error) => new Error("로그인 요청 실패")
            ),
            TE.map(redirectToGoogleLogin),
            TE.mapLeft((error) => console.error(error))
        )();

    const tryGithubLogin = () => {
        addAlert("준비중입니다.", "info");
    };

    const tryLinkedinLogin = () => {
        addAlert("준비중입니다.", "info");
    };

    const redirectToGoogleLogin = (response: AxiosResponse) => {
        const redirectUrl = response.data;
        window.location.href = redirectUrl;
    };

    const redirectToGithubLogin = (response: AxiosResponse) => {
        // TODO : 깃허브 로그인 리다이렉트
    };

    const redirectToLinkedinLogin = (response: AxiosResponse) => {
        // TODO : 링크드인 로그인 리다이렉트
    };

    useEffect(() => {
        if (!user?.userToken) {
            getUserToken();
        }
    }, [user?.userToken]);

    return (
        <>
            {/* 로그인 모달 */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} rounded={true}>
                <Modal.Header>
                    <div className="p-6 text-start">
                        <h1 className="text-3xl font-bold mb-8">면시</h1>
                        <h1 className="text-2xl font-bold">이력서 대신</h1>
                        <h2 className="text-xl font-semibold mt-2">챗봇을 제출하세요!</h2>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="flex flex-col gap-4 px-6 pt-12 pb-6 w-[504px]">
                        <button
                            onClick={tryGoogleLogin}
                            className="flex items-center justify-center w-full gap-3 px-4 py-3 font-medium transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <FaGoogle className="w-5 h-5" />
                            Google 계정으로 로그인
                        </button>

                        <button
                            onClick={tryGithubLogin}
                            className="flex items-center justify-center w-full gap-3 px-4 py-3 font-medium text-white transition-colors bg-black rounded-lg hover:bg-gray-800"
                        >
                            <FaGithub className="w-5 h-5" />
                            Github로 로그인
                        </button>

                        <button
                            onClick={tryLinkedinLogin}
                            className="flex items-center justify-center w-full gap-3 px-4 py-3 font-medium text-white transition-colors bg-[#0A66C2] rounded-lg hover:bg-[#004182]"
                        >
                            <FaLinkedin className="w-5 h-5" />
                            LinkedIn으로 로그인
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
            <AlertModal />
        </>
    );
};
