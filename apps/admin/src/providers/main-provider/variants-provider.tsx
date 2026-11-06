import React from "react";

const VariantsContext = React.createContext<{
    variant: "sidebar" | "floating" | "inset";
    setVariant: (variant: "sidebar" | "floating" | "inset") => void;
} | null>(null);


const VariantsProvider = ({ children }: { children: React.ReactNode }) => {
    const [variant, setVariant] = React.useState<"sidebar" | "floating" | "inset">("sidebar")
    return (
        <VariantsContext.Provider value={{ variant, setVariant }}>
            {children}
        </VariantsContext.Provider>
    )
}

export default VariantsProvider

export const useVariants = () => {
    const context = React.useContext(VariantsContext);
    if (!context) {
        throw new Error("useVariants must be used within VariantsProvider");
    }
    return context;
}