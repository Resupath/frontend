import { FC, useEffect, useState } from "react";
import clsx from "clsx";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { useAlertStore, AlertPosition } from "@/src/stores/useAlertStore";

/**
 * @author
 * @function @AlertModal
 **/

const AlertModal = () => {
    const { message, type, position, initAlert, isOpen } = useAlertStore();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        let interval: NodeJS.Timeout;

        if (isOpen) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 1, 100));
            }, 30); // 3초

            timer = setTimeout(() => {
                initAlert();
            }, 3000);
        } else {
            initAlert();
        }
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className={clsx(
                "w-screen h-screen fixed top-0 left-0 z-[150000]",
                position === "center" && "bg-slate-600 bg-opacity-60"
            )}
        >
            <AlertContainer className={`alert alert-${type} bg-background`} position={position}>
                <div className="flex flex-row items-center text-gray-600 dark:text-white justify-between px-4 py-3 border-b border-slate-200">
                    <span className="text-xl font-semibold">{getAlertTitle(type)}</span>
                </div>
                <ProgressBar progress={progress} type={type} />
                <div className="flex items-center justify-center w-full min-h-32 p-4">
                    <p className="break-keep whitespace-pre-line text-gray-600 dark:text-white">{message}</p>
                </div>
                <footer className="p-4 border-t border-app-border-200 border-solid">
                    <button
                        onClick={initAlert}
                        className="w-full text-base text-white close_btn py-3"
                        style={{ backgroundColor: getAlertColor(type) }}
                    >
                        확인
                    </button>
                </footer>
            </AlertContainer>
        </div>,
        document.body
    );
};

export default AlertModal;

const getAlertColor = (type: string) => {
    switch (type) {
        case "success":
            return "#25b865";
        case "error":
            return "#dd0d0d";
        case "warn":
            return "#FABC01";
        case "info":
        default:
            return "#2D84FB";
    }
};

const getAlertTitle = (type: string) => {
    switch (type) {
        case "success":
            return "성공";
        case "error":
            return "오류";
        case "warn":
            return "경고";
        case "info":
        default:
            return "안내";
    }
};

const getPositionStyles = (position: AlertPosition) => {
    switch (position) {
        case "topRight":
            return "top: 20px; right: 20px; transform: none;";
        case "bottomRight":
            return "bottom: 20px; right: 20px; transform: none;";
        case "topLeft":
            return "top: 20px; left: 20px; transform: none;";
        case "bottomLeft":
            return "bottom: 20px; left: 20px; transform: none;";
        default:
            return "left: 50%; top: 50%; transform: translate(-50%, -50%);";
    }
};

const ProgressBar = styled.div<{ progress: number; type: string }>`
    width: 100%;
    height: 4px;
    background-color: #e0e0e0;

    &::after {
        content: "";
        display: block;
        height: 100%;
        width: ${({ progress }) => progress}%;
        background-color: ${({ type }) => getAlertColor(type)};
        transition: width 0.1s linear;
    }
`;

const AlertContainer = styled.div<{ position: AlertPosition }>`
    width: 320px;
    position: fixed;
    /* background-color: #ffffff; */
    ${({ position }) => getPositionStyles(position)}
    text-align: center;
    border-radius: 6px;
    overflow: hidden;

    & span {
        font-size: 1rem;
        line-height: 24px;
        font-weight: 500;
        /* color: #3c3c3c; */
    }

    & .close_btn {
        border-radius: 4px;
        padding: 6px 12px;
    }
`;
