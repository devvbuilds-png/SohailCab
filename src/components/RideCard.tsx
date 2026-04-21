"use client";

import { useState } from "react";
import { Ride } from "@/lib/types";
import { getDirectionLabel, formatTime } from "@/lib/utils";
import { GraduationCap, Plane, Trash2, X } from "lucide-react";
import SeatDots from "./SeatDots";

const CAR_NUMBER = "KA 20 AC 8155";

interface RideCardProps {
  ride: Ride;
  onTap: (ride: Ride) => void;
  onDelete?: (rideId: string) => void;
}

export default function RideCard({ ride, onTap, onDelete }: RideCardProps) {
  const isFull = ride.booked_seats >= ride.total_seats;
  const isAirport = ride.direction === "manipal-to-airport";
  const seatsLeft = Math.max(ride.total_seats - ride.booked_seats, 0);
  const [deleteMode, setDeleteMode] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (pin !== "1234") {
      setPinError(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/rides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ride.id, pin }),
      });
      if (res.ok) {
        onDelete?.(ride.id);
      } else {
        setPinError(true);
      }
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteMode(false);
    setPin("");
    setPinError(false);
  };

  return (
    <div className="w-full overflow-hidden rounded-[1.6rem] border border-border/80 bg-[linear-gradient(180deg,rgba(255,250,243,0.98),rgba(247,239,228,0.98))] p-4 text-left shadow-[0_14px_30px_rgba(17,17,17,0.05)]">
      <div
        className="card-press cursor-pointer"
        onClick={() => !deleteMode && onTap(ride)}
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
            <p className="mt-1 text-[11px] text-muted">{CAR_NUMBER}</p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-[2.5rem] font-semibold leading-none tracking-tight text-foreground tabular-nums">
                {formatTime(ride.time)}
              </div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">
                Departure
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteMode(true); }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-white/70 text-muted transition-colors hover:border-danger/40 hover:text-danger"
              aria-label="Delete ride"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
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
      </div>

      {deleteMode && (
        <div
          className="mt-3 rounded-[1.1rem] border border-danger/30 bg-danger-light p-3 space-y-2"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xs font-semibold text-danger">Enter PIN to delete this ride</p>
          <div className="flex gap-2">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleDeleteConfirm()}
              placeholder="PIN"
              className={`flex-1 rounded-[0.75rem] border px-3 py-2 text-center text-sm font-semibold tracking-widest transition-colors ${pinError ? "border-danger bg-white text-danger" : "border-border/70 bg-white text-foreground"}`}
              autoFocus
            />
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="rounded-[0.75rem] bg-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {deleting ? "…" : "Delete"}
            </button>
            <button
              onClick={cancelDelete}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-white text-muted"
            >
              <X size={13} />
            </button>
          </div>
          {pinError && <p className="text-[11px] font-medium text-danger">Incorrect PIN</p>}
        </div>
      )}
    </div>
  );
}
