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

export const useAuthStore = create(
    persist<AuthStore>(
        (set, get) => ({
            user: initialState,
            setAuth: (auth) => {
                document.cookie = `auth=${auth.accessToken}; path=/; max-age=86400; SameSite=Strict`;
                set({ user: { ...get().user, ...auth } });
            },
            clearAuth: () => {
                document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
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
