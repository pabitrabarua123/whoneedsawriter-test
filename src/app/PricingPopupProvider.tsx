import { createContext, useState } from "react";
import PricingPopup from "@/components/PricingPopup/PricingPopup";

export const PricingPopupContext = createContext({
    isOpen: false,
    onClose: () => {},
    onOpen: () => {},
});

export const PricingPopupProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const onClose = () => setIsOpen(false);
    const onOpen = () => setIsOpen(true);

    return (
        <PricingPopupContext.Provider value={{ isOpen, onClose, onOpen }}>
            {children}
        </PricingPopupContext.Provider>
    );
}   