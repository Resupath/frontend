"use client";

import { useThemeStore } from "@/src/providers/themeStoreProvider";
import React, { FC, useEffect } from "react";

/**
 * @author bkdragon
 * @function Header
 **/

const Header: FC = () => {
    const { theme, toggleTheme } = useThemeStore((state) => state);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Strict`;
    }, [theme]);

    return (
        <header className="w-full bg-white dark:bg-black text-black dark:text-white border-b border-solid border-gray-200 dark:border-gray-800">
            <div className="container flex items-center justify-between px-4 py-4 mx-auto w-full">
                <div className="flex-1">
                    <span className="text-xl font-bold">Resupath</span>
                </div>
                <button
                    onClick={toggleTheme}
                    className="p-2 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                    aria-label="테마 변경"
                >
                    {theme === "light" ? <MoonIcon /> : <SunIcon />}
                </button>
            </div>
        </header>
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