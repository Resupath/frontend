"use client";

import * as O from "fp-ts/Option";
import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";
import { type ThemeStore, createThemeStore } from "@/src/stores/useThemeStore";
import { pipe } from "fp-ts/lib/function";

export type ThemeStoreApi = ReturnType<typeof createThemeStore>;

export interface ThemeStoreProviderProps {
    children: ReactNode;
    initialTheme?: "dark" | "light";
}

const ThemeStoreContext = createContext<O.Option<ThemeStoreApi>>(O.none);

export const ThemeStoreProvider = ({ children, initialTheme }: ThemeStoreProviderProps) => {
    const storeRef = useRef<O.Option<ThemeStoreApi>>(O.none);

    const initializeStore = (current: O.Option<ThemeStoreApi>): O.Option<ThemeStoreApi> =>
        pipe(
            current,
            O.fold(() => O.some(createThemeStore({ theme: initialTheme || "dark" })), O.some)
        );

    storeRef.current = initializeStore(storeRef.current);

    const renderProvider = (store: O.Option<ThemeStoreApi>) =>
        pipe(
            ThemeStoreContext.Provider,
            O.some,
            O.map((Provider) => <Provider value={store}>{children}</Provider>),
            O.getOrElse(() => <></>)
        );

    return renderProvider(storeRef.current);
};

export function useThemeStore<T>(selector: (state: ThemeStore) => T): T {
    const storeOption = useContext(ThemeStoreContext);
    return pipe(
        storeOption,
        O.fold(
            () => {
                throw new Error("useThemeStore must be used within ThemeStoreProvider");
            },
            (store) => useStore(store, selector)
        )
    );
}
