import { create } from "zustand";

interface LoadingStore {
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    toggleIsLoading: () => void;
}

const useLoadingStore = create<LoadingStore>((set) => ({
    isLoading: false,
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    toggleIsLoading: () => set((state) => ({ isLoading: !state.isLoading })),
}));

export default useLoadingStore;
