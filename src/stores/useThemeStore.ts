import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

export type ThemeState = {
    theme: ThemeMode;
};

export type ThemeActions = {
    setTheme: (theme: ThemeMode) => void;
    toggleTheme: () => void;
};

export type ThemeStore = ThemeState & ThemeActions;

export const defaultTheme: ThemeState = {
    theme: "light",
};

export const createThemeStore = (initialState: ThemeState = defaultTheme) => {
    return create<ThemeStore>()(
        persist(
            (set) => ({
                ...initialState,
                setTheme: (theme) => set({ theme }),
                toggleTheme: () =>
                    set((state) => ({
                        theme: state.theme === "light" ? "dark" : "light",
                    })),
            }),
            {
                name: "theme-storage",
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({ theme: state.theme }),
            }
        )
    );
};
