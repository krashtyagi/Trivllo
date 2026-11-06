'use client'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import React from "react";

const frameworks = [
  "5+ stars Excellent",
  "4+ stars Very Good",
  "3+ stars Good",
  "2+ stars Fair",
  "1+ stars Poor",
] as const;

export function ComboboxMultiple({ className }: { className?: string }) {
  const anchor = useComboboxAnchor();


  return (
    <Combobox
      multiple
      autoHighlight
      items={frameworks}
      defaultValue={[frameworks[0]]}
    >
      <ComboboxChips ref={anchor} className="w-full max-w-xs">
        <ComboboxValue>
          {(values) => (
            <React.Fragment>
              {values.map((value: string) => (
                <ComboboxChip key={value}>{value}</ComboboxChip>
              ))}
              <ComboboxChipsInput />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
