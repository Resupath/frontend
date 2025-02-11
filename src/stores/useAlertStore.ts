import { create } from "zustand";

export type AlertPosition = "center" | "topRight" | "bottomRight" | "topLeft" | "bottomLeft";

export interface AlertModalState {
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "info" | "warn";
    position: AlertPosition;
    addAlert: (message: string, type?: "success" | "error" | "info" | "warn", position?: AlertPosition) => void;
    addPromiseAlert: (
        promise: Promise<any>,
        messages: { loading: string; success: string; error: string },
        position?: AlertPosition
    ) => void;
    initAlert: () => void;
    handleAlert: (message: string) => <T>(promise: (...args: any[]) => Promise<T>) => Promise<T>;
    handlePromiseAlert: (message: string) => <T>(promiseFunc: (...args: any[]) => Promise<T>) => Promise<void>;
}

export const useAlertStore = create<AlertModalState>((set, get) => ({
    isOpen: false,
    message: "",
    type: "success",
    position: "center",
    addAlert: (
        message: string,
        type: "success" | "error" | "info" | "warn" = "success",
        position: AlertPosition = "center"
    ) => {
        set({ message, type, position, isOpen: true });
    },
    addPromiseAlert: (
        promise: Promise<any>,
        messages: { loading: string; success: string; error: string },
        position: AlertPosition = "center"
    ) => {
        set({ message: messages.loading, type: "info", position, isOpen: true });
        promise
            .then(() => {
                set({ message: messages.success, type: "success", position, isOpen: true });
            })
            .catch(() => {
                set({ message: messages.error, type: "error", position, isOpen: true });
            });
    },
    initAlert: () => {
        set({ message: "", type: "success", position: "center", isOpen: false });
    },
    handleAlert: (message: string) => {
        return async <T>(promise: (...args: any[]) => Promise<T>) => {
            try {
                const result = await promise();
                get().addAlert(message, "success");
                return result;
            } catch (error) {
                throw error;
            }
        };
    },

    handlePromiseAlert: <TError extends Error = Error>(message: string) => {
        return async <T>(promiseFunc: (...args: any[]) => Promise<T>) => {
            await promiseFunc()
                .then(() => {
                    get().addAlert(message, "success");
                })
                .catch((error: TError) => {
                    get().addAlert(error.message, "error");
                });
        };
    },
}));
