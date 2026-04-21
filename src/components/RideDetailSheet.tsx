"use client";

import { useState } from "react";
import { Ride } from "@/lib/types";
import {
  getDirectionLabel,
  formatTime,
  formatDateLabel,
} from "@/lib/utils";
import { Plane, GraduationCap, Calendar, Clock, User, Phone } from "lucide-react";
import BottomSheet from "./BottomSheet";

interface RideDetailSheetProps {
  ride: Ride | null;
  onClose: () => void;
  onBook: (rideId: string, name: string, phone: string) => void;
}

export default function RideDetailSheet({ ride, onClose, onBook }: RideDetailSheetProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  if (!ride) return null;

  const isFull = ride.booked_seats >= ride.total_seats;
  const canBook = name.trim() && phone.trim() && !isFull;
  const isAirport = ride.direction === "manipal-to-airport";
  const seatsRemaining = Math.max(ride.total_seats - ride.booked_seats, 0);

  const handleBook = () => {
    if (!canBook) return;
    onBook(ride.id, name.trim(), phone.trim());
    setName("");
    setPhone("");
    onClose();
  };

  return (
    <BottomSheet open={!!ride} onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(18,18,18,0.98),rgba(38,29,17,0.98))] p-5 text-white shadow-[0_18px_40px_rgba(17,17,17,0.18)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isAirport ? "bg-white/10 text-white" : "bg-secondary/15 text-[#ffcc96]"}`}>
                {isAirport ? <Plane size={20} /> : <GraduationCap size={20} />}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">Ride details</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">{getDirectionLabel(ride.direction)}</h2>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${isFull ? "bg-danger text-white" : "bg-white/10 text-white"}`}>
              {isFull ? "Full" : `${seatsRemaining} open`}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">Date</div>
              <div className="mt-1 text-sm font-semibold">{formatDateLabel(ride.date)}</div>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">Time</div>
              <div className="mt-1 text-sm font-semibold">{formatTime(ride.time)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.1rem] border border-border/70 bg-white/72 p-4">
            <div className="flex items-center gap-2 text-muted"><Calendar size={13} /><span className="text-[10px] font-semibold uppercase tracking-[0.24em]">Date</span></div>
            <div className="mt-2 text-sm font-semibold text-foreground">{formatDateLabel(ride.date)}</div>
          </div>
          <div className="rounded-[1.1rem] border border-border/70 bg-white/72 p-4">
            <div className="flex items-center gap-2 text-muted"><Clock size={13} /><span className="text-[10px] font-semibold uppercase tracking-[0.24em]">Time</span></div>
            <div className="mt-2 text-sm font-semibold text-foreground">{formatTime(ride.time)}</div>
          </div>
        </div>

        <div className="rounded-[1.1rem] border border-border/70 bg-white/72 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Passengers sharing</div>
          <div className="mt-2 text-xl font-semibold text-foreground">
            {ride.booked_seats === 0 ? "0 booked" : `${ride.booked_seats} / ${ride.total_seats}`}
          </div>
          <div className="mt-0.5 text-[11px] text-muted">
            {isFull
              ? "Ride is full — no seats available"
              : `${seatsRemaining} seat${seatsRemaining === 1 ? "" : "s"} remaining`}
          </div>
        </div>

        {!isFull && (
          <div className="space-y-3 rounded-[1.3rem] border border-border/70 bg-white/72 p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Book a seat</p>
              <p className="mt-1 text-sm text-muted">Add your details and lock in the spot.</p>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-[1.1rem] border border-border/80 bg-white/90 pl-10 pr-4 py-3 text-sm font-medium text-foreground transition-shadow focus:border-secondary"
                />
              </div>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full rounded-[1.1rem] border border-border/80 bg-white/90 pl-10 pr-4 py-3 text-sm font-medium text-foreground transition-shadow focus:border-secondary"
                />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleBook}
          disabled={!canBook}
          className={`w-full rounded-[1.2rem] px-5 py-4 text-[15px] font-semibold transition-all duration-200 ${
            isFull
              ? "cursor-not-allowed border border-border bg-surface text-muted-light"
              : canBook
              ? "bg-cta text-white shadow-[0_18px_35px_rgba(17,17,17,0.18)] hover:bg-cta-hover active:scale-[0.99]"
              : "cursor-not-allowed border border-border bg-surface text-muted-light"
          }`}
        >
          {isFull ? "Ride full" : "Book this seat"}
        </button>
      </div>
    </BottomSheet>
  );
}
