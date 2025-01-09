"use client";

import { Dialog } from "@headlessui/react";
import { FiX } from "react-icons/fi";

interface SelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onConfirm: () => void;
}

export default function SelectionModal({ isOpen, onClose, title, children, onConfirm }: SelectionModalProps) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50 text-text">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-6">{children}</div>
                    <div className="flex justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={onClose} className="px-4 py-2 transition-colors">
                            취소
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700  rounded-lg transition-colors"
                        >
                            확인
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
