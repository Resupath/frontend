import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AuthState = {
    id?: string;
    name?: string;
    accessToken?: string;
    refreshToken?: string;
    userToken?: string;
};

export type AuthActions = {
    setAuth: (auth: AuthState) => void;
    clearAuth: () => void;
    checkLogin: () => boolean;
};

export type AuthStore = {
    user: AuthState;
} & AuthActions;

const initialState: AuthState = {};

const setCookie = (name: string, value: string) => {
    document.cookie = `${name}=${value}; path=/; max-age=86400; SameSite=Strict`;
};

const clearCookie = (name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
};

export const useAuthStore = create(
    persist<AuthStore>(
        (set, get) => ({
            user: initialState,
            setAuth: (auth) => {
                if (auth.accessToken) {
                    setCookie("auth", auth.accessToken);
                }
                if (auth.userToken) {
                    setCookie("userToken", auth.userToken);
                }
                set({ user: { ...get().user, ...auth } });
            },
            clearAuth: () => {
                clearCookie("auth");
                set({
                    user: {
                        userToken: get().user.userToken,
                    },
                });
            },
            checkLogin: () => !!get()?.user?.id,
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
