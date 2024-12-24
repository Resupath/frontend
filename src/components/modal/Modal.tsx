import React, { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface IProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * @author
 * @function @Modal
 **/

const Header = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};
const Body = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};
const Footer = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

export const Modal: FC<IProps> & {
    Header: typeof Header;
    Body: typeof Body;
    Footer: typeof Footer;
} = ({ children, isOpen, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    const HeaderContent = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === Header
    );
    const BodyContent = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === Body
    );
    const FooterContent = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === Footer
    );

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    return createPortal(
        <div
            onClick={onClose}
            className={`fixed z-50 inset-0 w-screen h-screen flex justify-center items-center bg-black/50
                transition-[opacity,visibility] duration-200 ease-in-out
                ${isVisible ? "opacity-100 visible" : "opacity-0 invisible"}`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`bg-background text-text w-1/2
                    transition-all duration-200 ease-in-out
                    ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
                {HeaderContent}
                {BodyContent}
                {FooterContent}
            </div>
        </div>,
        document.body
    );
};

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;
