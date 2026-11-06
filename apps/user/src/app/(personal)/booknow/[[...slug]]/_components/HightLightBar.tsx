import { usePaymentsContext } from "@/context/payments-form-provider";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import React from "react";

export const HighLightBar = () => {
    const { currentstep: currentStep } = usePaymentsContext();
    const steps = [
        { id: 1, label: "Selection" },
        { id: 2, label: "Details" },
        { id: 3, label: "Confirm" }
    ];

    return (
        <div className="flex items-center justify-center w-full max-w-3xl mx-auto px-4">
            {steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center relative">
                        <div className={cn(
                            "h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center font-bold transition-all duration-500 z-10",
                            currentStep > step.id ? "bg-zinc-900 text-white" :
                                currentStep === step.id ? "bg-orange-500 text-white ring-4 ring-orange-100 scale-110" :
                                    "bg-zinc-200 text-zinc-500"
                        )}>
                            {currentStep > step.id ? <CheckCircle2 className="h-6 w-6" /> : step.id}
                        </div>
                        <span className={cn(
                            "absolute -bottom-6 text-[10px] md:text-xs font-bold uppercase tracking-tighter whitespace-nowrap",
                            currentStep === step.id ? "text-orange-600" : "text-muted-foreground"
                        )}>
                            {step.label}
                        </span>
                    </div>
                    {idx !== steps.length - 1 && (
                        <div className={cn(
                            "flex-1 h-1 mx-2 md:mx-4 rounded-full transition-colors duration-500",
                            currentStep > step.id ? "bg-zinc-900" : "bg-zinc-200"
                        )} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};