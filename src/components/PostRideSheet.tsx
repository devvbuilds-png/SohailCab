"use client";

import { useState } from "react";
import { Direction, RideFormData } from "@/lib/types";
import { getNext7Dates, formatDateLabel } from "@/lib/utils";
import { GraduationCap, Minus, Plus, Plane, Sparkles } from "lucide-react";
import BottomSheet from "./BottomSheet";

interface PostRideSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RideFormData) => void;
}

export default function PostRideSheet({ open, onClose, onSubmit }: PostRideSheetProps) {
  const dates = getNext7Dates();
  const [direction, setDirection] = useState<Direction>("manipal-to-airport");
  const [date, setDate] = useState(dates[0]);
  const [time, setTime] = useState("06:00");
  const [totalSeats, setTotalSeats] = useState(4);
  const [bookedSeats, setBookedSeats] = useState(1);

  const handleSubmit = () => {
    onSubmit({ direction, date, time, total_seats: totalSeats, booked_seats: bookedSeats });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-[1.4rem] bg-[linear-gradient(135deg,rgba(18,18,18,0.98),rgba(34,26,18,0.98))] p-5 text-white shadow-[0_18px_40px_rgba(17,17,17,0.18)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">Post a ride</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Add a departure to the board</h2>
            </div>
          </div>
          <p className="mt-3 max-w-lg text-sm text-white/70">Publish a trip and it will appear instantly in the live feed.</p>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Direction</label>
          <div className="grid grid-cols-2 gap-2 rounded-[1.15rem] border border-border/70 bg-white/65 p-2">
            <button onClick={() => setDirection("manipal-to-airport")} className={`flex items-center justify-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold transition-all duration-200 ${direction === "manipal-to-airport" ? "bg-primary text-white shadow-[0_10px_24px_rgba(17,17,17,0.18)]" : "text-muted hover:text-foreground"}`}>
              <Plane size={15} />
              Manipal to Airport
            </button>
            <button onClick={() => setDirection("airport-to-manipal")} className={`flex items-center justify-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold transition-all duration-200 ${direction === "airport-to-manipal" ? "bg-primary text-white shadow-[0_10px_24px_rgba(17,17,17,0.18)]" : "text-muted hover:text-foreground"}`}>
              <GraduationCap size={15} />
              Airport to Manipal
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Date</label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {dates.map((d) => (
              <button key={d} onClick={() => setDate(d)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${d === date ? "border-primary bg-primary text-white shadow-[0_10px_24px_rgba(17,17,17,0.18)]" : "border-border/70 bg-white/70 text-muted hover:border-secondary/40 hover:text-foreground"}`}>
                {formatDateLabel(d)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-[1.1rem] border border-border/80 bg-white/80 px-4 py-3 text-base font-medium text-foreground transition-shadow focus:border-secondary" />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Max seats</label>
            <div className="grid grid-cols-4 gap-2 rounded-[1.1rem] border border-border/70 bg-white/65 p-2">
              {[1, 2, 3, 4].map((n) => (
                <button key={n} onClick={() => { setTotalSeats(n); if (bookedSeats > n) setBookedSeats(n); }} className={`rounded-[0.95rem] px-0 py-3 text-sm font-semibold transition-all duration-200 ${n === totalSeats ? "bg-primary text-white shadow-[0_10px_24px_rgba(17,17,17,0.18)]" : "text-muted hover:text-foreground"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Seats already confirmed</label>
          <div className="flex items-center gap-4 rounded-[1.1rem] border border-border/70 bg-white/70 px-4 py-3">
            <button onClick={() => setBookedSeats(Math.max(1, bookedSeats - 1))} disabled={bookedSeats <= 1} className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 ${bookedSeats <= 1 ? "cursor-not-allowed border-border/60 bg-surface text-muted-light" : "border-border/80 bg-white text-foreground hover:border-secondary/40"}`} aria-label="Decrease seats">
              <Minus size={16} />
            </button>
            <div className="min-w-12 text-center text-2xl font-semibold tabular-nums text-foreground">{bookedSeats}</div>
            <button onClick={() => setBookedSeats(Math.min(totalSeats, bookedSeats + 1))} disabled={bookedSeats >= totalSeats} className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 ${bookedSeats >= totalSeats ? "cursor-not-allowed border-border/60 bg-surface text-muted-light" : "border-border/80 bg-white text-foreground hover:border-secondary/40"}`} aria-label="Increase seats">
              <Plus size={16} />
            </button>
          </div>
          <p className="mt-2 text-sm text-muted">This keeps the fare ladder accurate from the start.</p>
        </div>

        <button onClick={handleSubmit} className="w-full rounded-[1.2rem] bg-cta px-5 py-4 text-[15px] font-semibold text-white shadow-[0_18px_35px_rgba(17,17,17,0.18)] transition-all duration-200 hover:bg-cta-hover active:scale-[0.99]">
          Post ride
        </button>
      </div>
    </BottomSheet>
  );
}
