import { create } from "zustand";
import { persist } from "zustand/middleware";

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
            clearAuth: () => set({ user: {} }),
            checkLogin: () => !!get()?.user?.id,
        }),
        {
            name: "auth-storage",
        }
    )
);
