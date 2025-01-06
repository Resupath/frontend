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
            setAuth: (auth) => set({ user: auth }),
            clearAuth: () =>
                set({
                    user: {
                        userToken: get().user.userToken,
                    },
                }),
            checkLogin: () => !!get()?.user?.id,
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
