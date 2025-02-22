"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { FC } from "react";
import clsx from "clsx";

/**
 * @author
 * @function MyPageNavigate
 **/

export const MyPageNavigate: FC<{}> = () => {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;
    return (
        <div className="flex space-x-1 rounded-xl bg-surface p-1 mb-8 border border-solid border-gray-300 dark:border-gray-700">
            <button
                onClick={() => router.push("/mypage")}
                className={clsx(
                    "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-center cursor-pointer",
                    isActive("/mypage") && "text-primary"
                )}
            >
                프로필
            </button>
            <button
                onClick={() => router.push("/mypage/experience")}
                className={clsx(
                    "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-center cursor-pointer",
                    isActive("/mypage/experience") && "text-primary"
                )}
            >
                경력
            </button>
        </div>
    );
};
