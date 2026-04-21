"use client";

import { formatDateLabel } from "@/lib/utils";
import { Calendar, X } from "lucide-react";

interface DateFilterProps {
  dates: string[];
  selected: string;
  onSelect: (date: string) => void;
  customDate: string | null;
  onCustomDateChange: (date: string | null) => void;
  minCustomDate: string;
  maxCustomDate: string;
}

export default function DateFilter({
  dates,
  selected,
  onSelect,
  customDate,
  onCustomDateChange,
  minCustomDate,
  maxCustomDate,
}: DateFilterProps) {
  const customActive = customDate !== null && customDate === selected;

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

      <label
        className="shrink-0 relative inline-flex items-center justify-center rounded-full border border-border/80 bg-white/65 px-3 py-2 text-muted transition-all duration-200 cursor-pointer hover:border-secondary/40 hover:text-foreground"
        aria-label="Pick a custom date"
      >
        <Calendar size={15} />
        <input
          type="date"
          min={minCustomDate}
          max={maxCustomDate}
          value={customDate ?? ""}
          onChange={(e) => {
            if (!e.target.value) return;
            onCustomDateChange(e.target.value);
          }}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>

      {customDate && (
        <div
          onClick={() => onSelect(customDate)}
          className={`shrink-0 inline-flex cursor-pointer items-center gap-1.5 rounded-full border py-1 pl-3 pr-1 text-[13px] font-semibold tracking-tight transition-all duration-200 ${
            customActive
              ? "border-primary bg-primary text-white shadow-[0_10px_24px_rgba(17,17,17,0.18)]"
              : "border-border/80 bg-white/65 text-muted"
          }`}
        >
          <span>{formatDateLabel(customDate)}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCustomDateChange(null);
            }}
            aria-label="Remove custom date"
            className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
              customActive
                ? "bg-white/20 text-white hover:bg-white/30"
                : "bg-white/80 text-muted hover:text-foreground"
            }`}
          >
            <X size={11} />
          </button>
        </div>
      )}
    </div>
  );
}
