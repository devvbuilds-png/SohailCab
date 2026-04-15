"use client";

import { useState, useMemo } from "react";
import { Direction } from "@/lib/types";
import { getNext7Dates, formatDateLabel, getDirectionLabel, formatDateShort, formatTime } from "@/lib/utils";
import { GraduationCap, Minus, Plane, Plus } from "lucide-react";
import BottomSheet from "./BottomSheet";
import TimePicker from "./TimePicker";

interface RequestRideSheetProps {
  open: boolean;
  onClose: () => void;
  driverPhone: string;
  currentUrl: string;
}

export default function RequestRideSheet({ open, onClose, driverPhone, currentUrl }: RequestRideSheetProps) {
  const dates = useMemo(() => getNext7Dates(), []);
  const [direction, setDirection] = useState<Direction>("manipal-to-airport");
  const [date, setDate] = useState(dates[0]);
  const [time, setTime] = useState("06:00");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [seatsNeeded, setSeatsNeeded] = useState(1);
  const [solo, setSolo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) return;
    setSubmitting(true);

    // Open window before any await to preserve user gesture context
    const waWindow = window.open("", "_blank");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction,
          date,
          time,
          name,
          phone,
          seats_needed: seatsNeeded,
          solo,
        }),
      });

      if (res.ok) {
        const dirLabel = getDirectionLabel(direction);
        const dateStr = formatDateShort(date);
        const timeStr = formatTime(time);

        let msg = `Hi Sohail 👋\nI need a ride, here are the details:\n\n${dirLabel}\n${dateStr} · ${timeStr}\nFrom: ${name.trim()} (${phone.trim()})\nSeats needed: ${seatsNeeded}`;
        if (solo) msg += `\nDon't want sharing: Yes`;
        msg += `\n\nCheck requests here: ${currentUrl}?tab=requests`;

        if (waWindow) waWindow.location.href = `https://wa.me/${driverPhone}?text=${encodeURIComponent(msg)}`;
        onClose();
        setDirection("manipal-to-airport");
        setDate(dates[0]);
        setTime("06:00");
        setName("");
        setPhone("");
        setSeatsNeeded(1);
        setSolo(false);
      } else {
        waWindow?.close();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-[1.4rem] bg-[linear-gradient(135deg,rgba(201,106,33,0.95),rgba(160,70,10,0.98))] p-5 text-white shadow-[0_18px_40px_rgba(17,17,17,0.18)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white">
              <Plane size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60">Request a ride</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Where are you headed?</h2>
            </div>
          </div>
          <p className="mt-3 max-w-lg text-sm text-white/70">Sohail will confirm your ride on WhatsApp.</p>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Direction</label>
          <div className="grid grid-cols-2 gap-2 rounded-[1.15rem] border border-border/70 bg-white/65 p-2">
            <button
              onClick={() => setDirection("manipal-to-airport")}
              className={`flex items-center justify-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold transition-all duration-200 ${direction === "manipal-to-airport" ? "bg-primary text-white shadow-[0_10px_24px_rgba(17,17,17,0.18)]" : "text-muted hover:text-foreground"}`}
            >
              <Plane size={15} />
              Manipal to Airport
            </button>
            <button
              onClick={() => setDirection("airport-to-manipal")}
              className={`flex items-center justify-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold transition-all duration-200 ${direction === "airport-to-manipal" ? "bg-primary text-white shadow-[0_10px_24px_rgba(17,17,17,0.18)]" : "text-muted hover:text-foreground"}`}
            >
              <GraduationCap size={15} />
              Airport to Manipal
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Date</label>
          <div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
            onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY; }}
          >
            {dates.map((d) => (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${d === date ? "border-primary bg-primary text-white shadow-[0_10px_24px_rgba(17,17,17,0.18)]" : "border-border/70 bg-white/70 text-muted hover:border-secondary/40 hover:text-foreground"}`}
              >
                {formatDateLabel(d)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Time</label>
            <TimePicker value={time} onChange={setTime} />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Seats needed</label>
            <div className="flex items-center gap-3 rounded-[1.1rem] border border-border/70 bg-white/70 px-4 py-2.5">
              <button
                onClick={() => setSeatsNeeded(Math.max(1, seatsNeeded - 1))}
                disabled={seatsNeeded <= 1}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 ${seatsNeeded <= 1 ? "cursor-not-allowed border-border/60 bg-surface text-muted-light" : "border-border/80 bg-white text-foreground hover:border-secondary/40"}`}
                aria-label="Decrease seats"
              >
                <Minus size={14} />
              </button>
              <div className="flex-1 text-center text-xl font-semibold tabular-nums text-foreground">{seatsNeeded}</div>
              <button
                onClick={() => setSeatsNeeded(Math.min(4, seatsNeeded + 1))}
                disabled={seatsNeeded >= 4}
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${seatsNeeded >= 4 ? "cursor-not-allowed border-border/60 bg-surface text-muted-light" : "border-border/80 bg-white text-foreground hover:border-secondary/40"}`}
                aria-label="Increase seats"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-[1.3rem] border border-border/70 bg-white/72 p-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-[0.9rem] border border-border/70 bg-white/80 px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-light focus:border-secondary focus:outline-none"
          />
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="w-full rounded-[0.9rem] border border-border/70 bg-white/80 px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-light focus:border-secondary focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between rounded-[1.15rem] border border-border/70 bg-white/65 px-4 py-3.5">
          <div>
            <p className="text-sm font-semibold text-foreground">I don&apos;t want to share the cab</p>
            <p className="mt-0.5 text-xs text-muted">You&apos;ll pay for all seats</p>
          </div>
          <button
            onClick={() => setSolo(!solo)}
            className={`relative h-8 w-14 rounded-full transition-all duration-200 ${solo ? "bg-primary" : "bg-border"}`}
            aria-checked={solo}
            role="switch"
            aria-label="Solo ride toggle"
          >
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all duration-200 ${solo ? "left-7" : "left-1"}`} />
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !name.trim() || !phone.trim()}
          className="w-full rounded-[1.2rem] bg-cta px-5 py-4 text-[15px] font-semibold text-white shadow-[0_18px_35px_rgba(17,17,17,0.18)] transition-all duration-200 hover:bg-cta-hover active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending…" : "Request ride"}
        </button>
      </div>
    </BottomSheet>
  );
}
