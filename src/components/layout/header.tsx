"use client";

import { useThemeStore } from "@/src/providers/themeStoreProvider";
import React, { FC, useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Modal } from "../modal/Modal";

/**
 * @author bkdragon
 * @function Header
 **/

const Header: FC = () => {
    const { theme, toggleTheme } = useThemeStore((state) => state);

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Strict`;
    }, [theme]);

    return (
        <>
            <header className="w-full bg-white dark:bg-background text-black dark:text-white border-b border-solid border-gray-200 dark:border-gray-800">
                <div className="flex flex-row-reverse items-center justify-between px-4 py-4 w-full">
                    <button
                        onClick={toggleTheme}
                        className="p-2 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label="테마 변경"
                    >
                        {theme === "light" ? <MoonIcon /> : <SunIcon />}
                    </button>
                    <button onClick={() => setIsOpen(true)}>
                        <FiPlus />
                    </button>
                </div>
            </header>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <Modal.Header>
                    <div className="p-4 border-b border-solid border-gray-200 dark:border-gray-800">
                        <h1 className="text-xl font-semibold">로그인</h1>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="flex flex-col gap-4 p-6">
                        <button className="flex items-center justify-center w-[200px] gap-2 px-4 py-2 font-medium transition-colors border border-gray-300 rounded-lg">
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

export default Header;

function SunIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
            />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
            />
        </svg>
    );
}
