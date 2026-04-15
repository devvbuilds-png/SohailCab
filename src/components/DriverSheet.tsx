"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Direction, Ride, RideFormData, RideRequest } from "@/lib/types";
import { getNext7Dates, formatDateLabel, getDirectionLabel, formatDateShort, formatTime, getPricePerPerson, toWhatsAppNumber } from "@/lib/utils";
import { GraduationCap, Minus, Plane, Plus, Sparkles, MessageCircle, Share2, Check, Users, Clock } from "lucide-react";
import BottomSheet from "./BottomSheet";
import TimePicker from "./TimePicker";

interface DriverSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmitRide: (data: RideFormData) => void;
  onRideCreated: () => void;
  defaultTab?: "post" | "requests";
  currentUrl: string;
}

type AcceptedResult = { request: RideRequest; ride: Ride };

export default function DriverSheet({
  open,
  onClose,
  onSubmitRide,
  onRideCreated,
  defaultTab = "post",
  currentUrl,
}: DriverSheetProps) {
  const [activeTab, setActiveTab] = useState<"post" | "requests">(defaultTab);

  // Post tab state
  const dates = useMemo(() => getNext7Dates(), []);
  const [direction, setDirection] = useState<Direction>("manipal-to-airport");
  const [date, setDate] = useState(dates[0]);
  const [time, setTime] = useState("06:00");
  const [totalSeats, setTotalSeats] = useState(4);
  const [bookedSeats, setBookedSeats] = useState(1);

  // Requests tab state
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [acceptedResults, setAcceptedResults] = useState<Record<string, AcceptedResult>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch("/api/requests");
      if (res.ok) {
        const data: RideRequest[] = await res.json();
        setRequests(data);
      }
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
      if (defaultTab === "requests") {
        loadRequests();
      }
    }
  }, [open, defaultTab, loadRequests]);

  const handleTabChange = (tab: "post" | "requests") => {
    setActiveTab(tab);
    if (tab === "requests") loadRequests();
  };

  const handlePostSubmit = () => {
    onSubmitRide({ direction, date, time, total_seats: totalSeats, booked_seats: bookedSeats });
    onClose();
  };

  const handleReject = async (req: RideRequest) => {
    // Open window before any await to preserve user gesture context
    const waWindow = window.open("", "_blank");
    setActionLoading(req.id);
    try {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: req.id, action: "reject" }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== req.id));
        const dirLabel = getDirectionLabel(req.direction);
        const dateStr = formatDateShort(req.date);
        const timeStr = formatTime(req.time);
        const msg = `Hi ${req.name} 👋\nUnfortunately Sohail's cab isn't available for ${dirLabel} on ${dateStr} at ${timeStr}.\n\nFeel free to request another time on SohailCab!`;
        if (waWindow) waWindow.location.href = `https://wa.me/${toWhatsAppNumber(req.phone)}?text=${encodeURIComponent(msg)}`;
      } else {
        waWindow?.close();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (req: RideRequest) => {
    setActionLoading(req.id);
    try {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: req.id, action: "accept" }),
      });
      if (res.ok) {
        const { ride } = await res.json() as { ride: Ride };
        setRequests((prev) => prev.filter((r) => r.id !== req.id));
        setAcceptedResults((prev) => ({ ...prev, [req.id]: { request: req, ride } }));
        onRideCreated();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getMessageStudentUrl = (result: AcceptedResult) => {
    const { request: req } = result;
    const msg = `Hi ${req.name} 👋\nYour ride is confirmed!\n\n${getDirectionLabel(req.direction)}\n${formatDateShort(req.date)} · ${formatTime(req.time)}\n${req.seats_needed} seat(s) confirmed for you.\n\nSee you then!\n— Sohail`;
    return `https://wa.me/${toWhatsAppNumber(req.phone)}?text=${encodeURIComponent(msg)}`;
  };

  const getShareGroupUrl = (result: AcceptedResult) => {
    const { request: req, ride } = result;
    const seatsRemaining = ride.total_seats - ride.booked_seats;
    const price = getPricePerPerson(ride.booked_seats);
    const msg = `🚖 Sohail's Cab\n${getDirectionLabel(req.direction)}\n${formatDateShort(req.date)} · ${formatTime(req.time)}\n${seatsRemaining} seats left\n\nCurrent fare: ₹${price}/person\nSplits further if more join (₹375–₹1500)\n\nBook here: ${currentUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const dismissAccepted = (id: string) => {
    setAcceptedResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="space-y-5">
        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-2 rounded-[1.15rem] border border-border/70 bg-white/65 p-1.5">
          <button
            onClick={() => handleTabChange("post")}
            className={`rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === "post" ? "bg-primary text-white shadow-[0_10px_24px_rgba(17,17,17,0.18)]" : "text-muted hover:text-foreground"}`}
          >
            Post a Ride
          </button>
          <button
            onClick={() => handleTabChange("requests")}
            className={`rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === "requests" ? "bg-primary text-white shadow-[0_10px_24px_rgba(17,17,17,0.18)]" : "text-muted hover:text-foreground"}`}
          >
            Requests
          </button>
        </div>

        {/* POST TAB */}
        {activeTab === "post" && (
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
              <div
                className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
                onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY; }}
              >
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
                <TimePicker value={time} onChange={setTime} />
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

            <button onClick={handlePostSubmit} className="w-full rounded-[1.2rem] bg-cta px-5 py-4 text-[15px] font-semibold text-white shadow-[0_18px_35px_rgba(17,17,17,0.18)] transition-all duration-200 hover:bg-cta-hover active:scale-[0.99]">
              Post ride
            </button>
          </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {/* Accepted result cards */}
            {Object.values(acceptedResults).map((result) => (
              <div key={result.request.id} className="rounded-[1.3rem] border border-green/30 bg-green/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green text-white">
                    <Check size={13} />
                  </div>
                  <span className="text-sm font-semibold text-green">Confirmed</span>
                  <button
                    onClick={() => dismissAccepted(result.request.id)}
                    className="ml-auto text-xs font-medium text-muted hover:text-foreground"
                  >
                    Dismiss
                  </button>
                </div>
                <div className="text-sm text-foreground font-medium">
                  {getDirectionLabel(result.request.direction)} · {formatDateShort(result.request.date)} · {formatTime(result.request.time)}
                </div>
                <div className="text-sm text-muted">{result.request.name} — {result.request.seats_needed} seat(s)</div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getMessageStudentUrl(result)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-[1rem] bg-green px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                  >
                    <MessageCircle size={15} />
                    Message {result.request.name.split(" ")[0]}
                  </a>
                  <a
                    href={getShareGroupUrl(result)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-[1rem] border border-border/70 bg-white/80 px-4 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-white"
                  >
                    <Share2 size={15} />
                    Share to group
                  </a>
                </div>
              </div>
            ))}

            {/* Loading */}
            {loadingRequests && (
              <div className="flex items-center justify-center py-10">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-secondary" />
              </div>
            )}

            {/* Empty state */}
            {!loadingRequests && requests.length === 0 && Object.keys(acceptedResults).length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-white/50 px-6 py-14 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-muted-light">
                  <Users size={24} />
                </div>
                <p className="text-[15px] font-semibold text-foreground">No pending requests</p>
                <p className="mt-1 max-w-[200px] text-sm text-muted">Students will appear here when they request a ride.</p>
              </div>
            )}

            {/* Pending request cards */}
            {!loadingRequests && requests.map((req) => (
              <div key={req.id} className="rounded-[1.3rem] border border-border/70 bg-white/80 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{req.name}</p>
                    <p className="text-xs text-muted">{req.phone}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-surface px-2.5 py-1">
                    <Clock size={11} className="text-muted" />
                    <span className="text-[11px] font-medium text-muted">Pending</span>
                  </div>
                </div>
                <div className="rounded-[0.9rem] bg-background/70 px-3 py-2.5 space-y-1">
                  <p className="text-sm font-medium text-foreground">{getDirectionLabel(req.direction)}</p>
                  <p className="text-xs text-muted">{formatDateShort(req.date)} · {formatTime(req.time)}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {req.seats_needed} seat{req.seats_needed > 1 ? "s" : ""}
                  </span>
                  {req.solo && (
                    <span className="rounded-full border border-border/60 bg-surface px-2 py-0.5 text-[11px] font-medium">Solo (no sharing)</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleReject(req)}
                    disabled={actionLoading === req.id}
                    className="rounded-[1rem] border border-danger/30 bg-danger-light px-4 py-3 text-sm font-semibold text-danger transition-all duration-200 hover:bg-danger/10 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAccept(req)}
                    disabled={actionLoading === req.id}
                    className="rounded-[1rem] bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(17,17,17,0.18)] transition-all duration-200 hover:bg-primary-hover disabled:opacity-50"
                  >
                    {actionLoading === req.id ? "…" : "Accept"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
