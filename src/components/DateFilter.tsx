"use client";

import { formatDateLabel } from "@/lib/utils";

interface DateFilterProps {
  dates: string[];
  selected: string;
  onSelect: (date: string) => void;
}

export default function DateFilter({ dates, selected, onSelect }: DateFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto py-1.5 scrollbar-none">
      {dates.map((date) => {
        const isActive = date === selected;
        return (
          <button
            key={date}
            onClick={() => onSelect(date)}
            className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold tracking-tight transition-all duration-200 ${
              isActive
                ? "border-primary bg-primary text-white shadow-[0_10px_24px_rgba(17,17,17,0.18)]"
                : "border-border/80 bg-white/65 text-muted hover:border-secondary/40 hover:text-foreground"
            }`}
          >
            {formatDateLabel(date)}
          </button>
        );
      })}
    </div>
  );
}
