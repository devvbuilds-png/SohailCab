"use client";

import { Ride } from "@/lib/types";
import { getDirectionLabel, formatTime, getPricePerPerson } from "@/lib/utils";
import { GraduationCap, Plane } from "lucide-react";
import SeatDots from "./SeatDots";

interface RideCardProps {
  ride: Ride;
  onTap: (ride: Ride) => void;
}

export default function RideCard({ ride, onTap }: RideCardProps) {
  const isFull = ride.booked_seats >= ride.total_seats;
  const isAirport = ride.direction === "manipal-to-airport";
  const seatsLeft = Math.max(ride.total_seats - ride.booked_seats, 0);

  return (
    <button
      onClick={() => onTap(ride)}
      className="card-press w-full overflow-hidden rounded-[1.6rem] border border-border/80 bg-[linear-gradient(180deg,rgba(255,250,243,0.98),rgba(247,239,228,0.98))] p-4 text-left shadow-[0_14px_30px_rgba(17,17,17,0.05)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
            <span className={`h-1.5 w-1.5 rounded-full ${isFull ? "bg-danger" : "bg-secondary"}`} />
            {isFull ? "Fully booked" : "Live ride"}
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                isAirport ? "bg-secondary/10 text-secondary" : "bg-black/5 text-primary"
              }`}
            >
              {isAirport ? <Plane size={15} /> : <GraduationCap size={15} />}
            </span>
            <span className="truncate">{getDirectionLabel(ride.direction)}</span>
          </div>
          <p className="mt-1.5 max-w-[18rem] text-[12px] leading-5 text-muted">
            A simple shared trip with live pricing that adapts as seats fill.
          </p>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-[2.5rem] font-semibold leading-none tracking-tight text-foreground tabular-nums">
            {formatTime(ride.time)}
          </div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">
            Departure
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-[1.1rem] border border-border/70 bg-white/75 px-3 py-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
            {isFull ? "Fare" : "Your fare"}
          </div>
          <div className="mt-1 text-[1.15rem] font-semibold text-primary">
            ₹{isFull ? getPricePerPerson(ride.booked_seats) : getPricePerPerson(ride.booked_seats + 1)}
          </div>
        </div>
        <div className="rounded-[1.1rem] border border-border/70 bg-white/75 px-3 py-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
            Seats
          </div>
          <div className="mt-1 text-[1.15rem] font-semibold text-primary">
            {ride.booked_seats}/{ride.total_seats}
          </div>
        </div>
        <div className="rounded-[1.1rem] border border-border/70 bg-white/75 px-3 py-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
            Status
          </div>
          <div className={`mt-1 text-[1.15rem] font-semibold ${isFull ? "text-danger" : "text-secondary"}`}>
            {isFull ? "Full" : `${seatsLeft} left`}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <SeatDots maxSeats={ride.total_seats} bookedSeats={ride.booked_seats} />
          <p className="mt-2 text-[11px] text-muted">Tap for booking details</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${isFull ? "bg-danger-light text-danger" : "bg-secondary/10 text-secondary"}`}>
          {isFull ? "Closed" : "Book now"}
        </span>
      </div>
    </button>
  );
}
