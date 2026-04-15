"use client";

import { useState } from "react";
import { Ride } from "@/lib/types";
import {
  getDirectionLabel,
  formatTime,
  formatDateLabel,
  getPricePerPerson,
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
              {isFull ? "Full" : `${Math.max(ride.total_seats - ride.booked_seats, 0)} open`}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">Date</div>
              <div className="mt-1 text-sm font-semibold">{formatDateLabel(ride.date)}</div>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">Time</div>
              <div className="mt-1 text-sm font-semibold">{formatTime(ride.time)}</div>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">{isFull ? "Fare" : "Your fare"}</div>
              <div className="mt-1 text-sm font-semibold">₹{isFull ? getPricePerPerson(ride.booked_seats) : getPricePerPerson(ride.booked_seats + 1)}</div>
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

        {!isFull ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.1rem] border border-border/70 bg-white/72 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Current fare</div>
              <div className="mt-2 text-xl font-semibold text-muted">
                {ride.booked_seats === 0 ? "—" : `₹${getPricePerPerson(ride.booked_seats)}`}
              </div>
              <div className="mt-0.5 text-[11px] text-muted">
                {ride.booked_seats === 0 ? "No bookings yet" : `${ride.booked_seats} passenger${ride.booked_seats > 1 ? "s" : ""} sharing`}
              </div>
            </div>
            <div className="rounded-[1.1rem] border border-secondary/30 bg-secondary/5 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-secondary">Your fare</div>
              <div className="mt-2 text-xl font-semibold text-primary">₹{getPricePerPerson(ride.booked_seats + 1)}</div>
              <div className="mt-0.5 text-[11px] text-muted">if you book now</div>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.1rem] border border-border/70 bg-white/72 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Fare</div>
            <div className="mt-2 text-xl font-semibold text-foreground">₹{getPricePerPerson(ride.booked_seats)}/person</div>
            <div className="mt-0.5 text-[11px] text-danger">Ride is full — no seats available</div>
          </div>
        )}

        <div className="rounded-[1.3rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,239,227,0.96))] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Price drops as more join</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {Array.from({ length: ride.total_seats }).map((_, i) => {
              const count = i + 1;
              const currentCount = Math.max(ride.booked_seats, 1);
              const isActive = count === currentCount;
              return (
                <div key={count} className={`rounded-2xl border px-2 py-3 text-center ${isActive ? "border-secondary bg-secondary/10" : "border-border/70 bg-white/75"}`}>
                  <div className="flex justify-center gap-[2px]">
                    {Array.from({ length: ride.total_seats }).map((_, j) => (
                      <span key={j} className={`inline-block h-2 w-2 rounded-full transition-colors duration-200 ${isActive ? j < count ? "bg-secondary" : "bg-border" : j < count ? "bg-muted-light" : "bg-border"}`} />
                    ))}
                  </div>
                  <div className={`mt-2 text-[13px] font-semibold ${isActive ? "text-primary" : "text-muted-light"}`}>Rs {Math.round(1500 / count)}</div>
                </div>
              );
            })}
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
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-[1.1rem] border border-border/80 bg-white/90 pl-10 pr-4 py-3 text-sm font-medium text-foreground transition-shadow focus:border-secondary" />
              </div>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light" />
                <input type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="w-full rounded-[1.1rem] border border-border/80 bg-white/90 pl-10 pr-4 py-3 text-sm font-medium text-foreground transition-shadow focus:border-secondary" />
              </div>
            </div>
          </div>
        )}

        <button onClick={handleBook} disabled={!canBook} className={`w-full rounded-[1.2rem] px-5 py-4 text-[15px] font-semibold transition-all duration-200 ${isFull ? "cursor-not-allowed border border-border bg-surface text-muted-light" : canBook ? "bg-cta text-white shadow-[0_18px_35px_rgba(17,17,17,0.18)] hover:bg-cta-hover active:scale-[0.99]" : "cursor-not-allowed border border-border bg-surface text-muted-light"}`}>
          {isFull ? "Ride full" : "Book this seat"}
        </button>
      </div>
    </BottomSheet>
  );
}
