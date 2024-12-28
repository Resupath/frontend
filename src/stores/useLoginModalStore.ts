import { create } from "zustand";

export type LoginModalState = {
    isOpen: boolean;
};

export type LoginModalActions = {
    setIsOpen: (isOpen: boolean) => void;
};

export type LoginModalStore = LoginModalState & LoginModalActions;

export const useLoginModalStore = create<LoginModalStore>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
}));
