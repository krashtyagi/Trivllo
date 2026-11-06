'use client'
import { Button } from "@/components/ui/button";
import { PaymentProps } from "@/schema/payment.schema";
import { useNuqsContext } from "@/context/NuqsContentProvider";
import { UseFormReturn } from "react-hook-form";

export type CounterProps = {
  label: "Bedrooms" | "Beds" | "Bathrooms";
  any?: boolean;
  methods?: UseFormReturn<PaymentProps>;
  fieldName?: string;
  value?: number;
  onChange?: (val: number) => void;
};

export type CounterWithoutQueryProps = {
  label: string;
  any?: boolean;
  methods?: UseFormReturn<PaymentProps>;
  fieldName?: string;
  value?: number;
  onChange?: (val: number) => void;
};

export default function Counter({ label, any }: CounterProps) {
  const { filters, setFilters } = useNuqsContext();

  const currentCount = filters[label]?.[0] ?? 0

  const setCount = (value: number) => {
    setFilters((prev) => ({
      ...prev,
      [label]: value > 0 ? [value] : []
    }))
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm">{label}</p>

      <div className="flex items-center gap-4">
        <Button
          className="rounded-full"
          variant="outline"
          size="icon"
          onClick={() => setCount(currentCount > 0 ? currentCount - 1 : 0)}
        >
          −
        </Button>

        <span className="text-sm">
          {any ? "Any" : currentCount}
        </span>

        <Button
          className="rounded-full"
          variant="outline"
          size="icon"
          onClick={() => setCount(currentCount + 1)}
        >
          +
        </Button>
      </div>
    </div>
  )
}
export function CounterWithoutQuery({
  label,
  any,
  methods,
  fieldName,
  value,
  onChange,
}: CounterWithoutQueryProps) {
  // Determine current value source
  const isFormMode = methods && fieldName;

  const currentCount = (isFormMode && methods)
    ? methods.watch(fieldName as any) ?? 0
    : value ?? 0;

  const updateValue = (newValue: number) => {
    if (newValue < 0) return;

    if (isFormMode && methods) {
      methods.setValue(fieldName as any, newValue);
    } else {
      onChange?.(newValue);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm">{label}</p>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => updateValue(currentCount - 1)}
        >
          −
        </Button>

        <span className="text-sm">
          {any && currentCount === 0 ? "Any" : currentCount}
        </span>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => updateValue(currentCount + 1)}
        >
          +
        </Button>
      </div>
    </div>
  );
}