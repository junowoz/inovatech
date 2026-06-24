"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Lookups, LookupRow } from "@/lib/types/database";

export type FilterCategory =
  | "year"
  | "course"
  | "semester"
  | "industry"
  | "tech";

export type SelectedFilters = Record<FilterCategory, number[]>;

export const EMPTY_FILTERS: SelectedFilters = {
  year: [],
  course: [],
  semester: [],
  industry: [],
  tech: [],
};

export const FILTER_SECTIONS: { key: FilterCategory; label: string }[] = [
  { key: "year", label: "Ano" },
  { key: "course", label: "Curso" },
  { key: "semester", label: "Período" },
  { key: "industry", label: "Indústria" },
  { key: "tech", label: "Tecnologia" },
];

function FilterSection({
  category,
  label,
  items,
  selected,
  onToggle,
}: {
  category: FilterCategory;
  label: string;
  items: LookupRow[];
  selected: number[];
  onToggle: (category: FilterCategory, id: number) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 5);

  return (
    <AccordionItem value={category}>
      <AccordionTrigger className="py-3 text-sm font-bold">
        {label}
      </AccordionTrigger>
      <AccordionContent className="space-y-2.5 pb-3">
        {visible.map((item) => {
          const id = `${category}-${item.id}`;
          return (
            <div key={item.id} className="flex items-center gap-2">
              <Checkbox
                id={id}
                checked={selected.includes(item.id)}
                onCheckedChange={() => onToggle(category, item.id)}
              />
              <Label htmlFor={id} className="font-normal">
                {item.name}
              </Label>
            </div>
          );
        })}
        {items.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            {showAll ? "Ver menos" : "Ver mais"}
          </button>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

export function FilterPanel({
  lookups,
  selected,
  onToggle,
}: {
  lookups: Lookups;
  selected: SelectedFilters;
  onToggle: (category: FilterCategory, id: number) => void;
}) {
  return (
    <Accordion
      type="multiple"
      defaultValue={FILTER_SECTIONS.map((s) => s.key)}
      className="w-full"
    >
      {FILTER_SECTIONS.map(({ key, label }) => (
        <FilterSection
          key={key}
          category={key}
          label={label}
          items={lookups[key]}
          selected={selected[key]}
          onToggle={onToggle}
        />
      ))}
    </Accordion>
  );
}
