"use client";

import { Logo } from "@/src/components/logo/Logo";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAlertStore } from "@/src/stores/useAlertStore";
import { api } from "@/src/utils/api";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { FaGoogle, FaGithub, FaLinkedin } from "react-icons/fa";
import { AxiosResponse } from "axios";
import AlertModal from "@/src/components/modal/AlertModal";

export default function LoginPage() {
    const { setAuth } = useAuthStore();
    const { addAlert } = useAlertStore();

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

    return (
        <main
            style={{
                background:
                    "radial-gradient(141.61% 141.61% at 100% 60%, rgba(253, 253, 248, 0.50) 0%, rgba(165, 197, 239, 0.50) 100%)",
            }}
            className="h-full w-full flex items-center justify-end pr-[15%]"
        >
            <div className="w-[700px] aspect-square bg-white dark:bg-gray-800 rounded-full p-8 flex flex-col items-center justify-center">
                <div className="text-start w-2/3">
                    <h1 className="text-2xl font-bold text-text">이력서 대신</h1>
                    <h2 className="text-2xl font-bold mt-2 text-text">챗봇을 제출하세요!</h2>
                </div>

                <div className="flex flex-col gap-4 pt-12 w-2/3">
                    <button
                        onClick={tryGoogleLogin}
                        className="flex items-center justify-center w-full gap-3 px-4 py-3 font-medium transition-colors border border-gray-200 rounded-lg hover:bg-gray-50 text-text"
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
            </div>
            <AlertModal />
        </main>
    );
}
