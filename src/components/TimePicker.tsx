"use client";

import { Minus, Plus } from "lucide-react";

interface TimePickerProps {
  value: string; // HH:MM 24h
  onChange: (value: string) => void;
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const h24 = parseInt(value.split(":")[0] ?? "6");
  const min = parseInt(value.split(":")[1] ?? "0");
  const hour12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  const isPM = h24 >= 12;

  const emit = (h12: number, m: number, pm: boolean) => {
    const h = pm ? (h12 === 12 ? 12 : h12 + 12) : (h12 === 12 ? 0 : h12);
    onChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  };

  return (
    <div className="rounded-[1.1rem] border border-border/80 bg-white/80 p-3 space-y-2.5">
      {/* Hour + AM/PM row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => emit(hour12 === 1 ? 12 : hour12 - 1, min, isPM)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-white text-foreground transition-colors hover:border-secondary/40 active:scale-95"
          aria-label="Decrease hour"
        >
          <Minus size={14} />
        </button>

        <span className="text-2xl font-semibold tabular-nums text-foreground select-none">
          {hour12}
        </span>

        <button
          type="button"
          onClick={() => emit(hour12 === 12 ? 1 : hour12 + 1, min, isPM)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-white text-foreground transition-colors hover:border-secondary/40 active:scale-95"
          aria-label="Increase hour"
        >
          <Plus size={14} />
        </button>

        <span className="text-2xl font-semibold tabular-nums text-foreground select-none">
          :{String(min).padStart(2, "0")}
        </span>

        <div className="ml-auto flex overflow-hidden rounded-[0.75rem] border border-border/70">
          <button
            type="button"
            onClick={() => emit(hour12, min, false)}
            className={`px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${!isPM ? "bg-primary text-white" : "bg-surface text-muted"}`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => emit(hour12, min, true)}
            className={`px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${isPM ? "bg-primary text-white" : "bg-surface text-muted"}`}
          >
            PM
          </button>
        </div>
      </div>

      {/* Minute chips */}
      <div className="grid grid-cols-4 gap-1.5">
        {[0, 15, 30, 45].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => emit(hour12, m, isPM)}
            className={`rounded-[0.8rem] py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${
              min === m
                ? "bg-primary text-white shadow-[0_6px_16px_rgba(17,17,17,0.16)]"
                : "border border-border/60 bg-white/60 text-muted hover:text-foreground"
            }`}
          >
            :{String(m).padStart(2, "0")}
          </button>
        ))}
      </div>
    </div>
  );
}
