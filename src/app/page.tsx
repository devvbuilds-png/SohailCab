"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Ride, RideFormData } from "@/lib/types";
import { getNext7Dates, getDirectionLabel, formatDateShort, formatTime } from "@/lib/utils";
import { Car, Lock } from "lucide-react";
import DateFilter from "@/components/DateFilter";
import RideCard from "@/components/RideCard";
import RideDetailSheet from "@/components/RideDetailSheet";
import DriverSheet from "@/components/DriverSheet";
import RequestRideSheet from "@/components/RequestRideSheet";

const DRIVER_PHONE = "918050132060";

function getMaxCustomDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Home() {
  const dates = getNext7Dates();
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [customDate, setCustomDate] = useState<string | null>(null);
  const maxCustomDate = getMaxCustomDate(60);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [postOpen, setPostOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [driverDefaultTab, setDriverDefaultTab] = useState<"post" | "requests" | "passengers">("post");
  const [requestOpen, setRequestOpen] = useState(false);
  const [focusRideId, setFocusRideId] = useState<string | null>(null);

  const loadRides = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rides");
      if (res.ok) {
        const data: Ride[] = await res.json();
        setRides(data);
      }
    } catch {
      // silently fail, show empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  // Deep link: ?tab=requests → auto-open PIN sheet, land on Requests tab after correct PIN
  // Deep link: ?date=YYYY-MM-DD → preselect that date (for shared ride links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "requests") {
      setDriverDefaultTab("requests");
      setPinDialogOpen(true);
    }
    const dateParam = params.get("date");
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) && dateParam >= dates[0] && dateParam <= maxCustomDate) {
      if (dates.includes(dateParam)) {
        setSelectedDate(dateParam);
      } else {
        setCustomDate(dateParam);
        setSelectedDate(dateParam);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRides = rides.filter((r) => r.date === selectedDate);

  const datesWithRides = useMemo(() => new Set(rides.map((r) => r.date)), [rides]);

  const nextAvailableDate = useMemo(() => {
    const today = dates[0];
    const candidates = Array.from(datesWithRides)
      .filter((d) => d >= today && d !== selectedDate)
      .sort();
    if (candidates.length === 0) return null;
    return candidates.find((d) => d > selectedDate) ?? candidates[0];
  }, [datesWithRides, selectedDate, dates]);

  const handleJumpToNextDate = () => {
    if (!nextAvailableDate) return;
    if (dates.includes(nextAvailableDate)) {
      setSelectedDate(nextAvailableDate);
    } else {
      setCustomDate(nextAvailableDate);
      setSelectedDate(nextAvailableDate);
    }
  };

  const handlePostRide = async (data: RideFormData) => {
    const res = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pin: "1234",
        direction: data.direction,
        date: data.date,
        time: data.time,
        total_seats: data.total_seats,
        booked_seats: data.booked_seats,
        passengers: data.passengers,
      }),
    });

    if (res.ok) {
      const ride: Ride = await res.json();
      await loadRides();
      setSelectedDate(data.date);

      const booked = ride.booked_seats;
      const seatsLeft = ride.total_seats - booked;
      const baseUrl = `${window.location.origin}${window.location.pathname}?date=${ride.date}`;
      const msg = `🚗 Sohail's Cab\n\n${getDirectionLabel(ride.direction)}\n${formatDateShort(ride.date)} · ${formatTime(ride.time)}\n\n${booked} person booked — sharing available, ${seatsLeft} seats left.\nFor fare negotiation and discount offers please DM me.\n\nBook a seat: ${baseUrl}`;
      window.location.href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    }
  };

  const handleBookSeat = async (rideId: string, name: string, phone: string) => {
    const ride = rides.find((r) => r.id === rideId);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ride_id: rideId, name, phone }),
    });

    if (res.ok && ride) {
      await loadRides();
      const msg = `Hi Sohail 👋 I booked a seat.\n\n${getDirectionLabel(ride.direction)}\n${formatDateShort(ride.date)} · ${formatTime(ride.time)}\n\nName: ${name}\nPhone: ${phone}`;
      const a = document.createElement("a");
      a.href = `whatsapp://send?phone=${DRIVER_PHONE}&text=${encodeURIComponent(msg)}`;
      a.click();
    }
  };

  const handleDeleteRide = (rideId: string) => {
    setRides((prev) => prev.filter((r) => r.id !== rideId));
  };

  const handleManageRide = (rideId: string) => {
    setDriverDefaultTab("passengers");
    setFocusRideId(rideId);
    if (adminUnlocked) {
      setPostOpen(true);
    } else {
      setPinDialogOpen(true);
    }
  };

  const handlePinSubmit = () => {
    if (pinInput === "1234") {
      setPinDialogOpen(false);
      setPinInput("");
      setPinError(false);
      setAdminUnlocked(true);
      setPostOpen(true);
    } else {
      setPinError(true);
    }
  };

  const currentUrl = typeof window !== "undefined"
    ? window.location.origin + window.location.pathname
    : "";

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-card/85 px-4 pt-4 pb-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_24px_rgba(17,17,17,0.18)]">
              <Car size={18} />
            </div>
            <div>
              <h1 className="text-[17px] font-semibold leading-tight tracking-tight">SohailCab</h1>
              <p className="text-[11px] font-medium text-muted">Manipal ↔ Mangalore Airport</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (adminUnlocked) {
                setPostOpen(true);
              } else {
                setDriverDefaultTab("post");
                setPinDialogOpen(true);
              }
            }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white/70 text-muted transition-colors duration-200 hover:text-foreground"
            aria-label="Driver access"
          >
            <Lock size={15} />
          </button>
        </div>
        <div className="mx-auto mt-3 max-w-md">
          <DateFilter
            dates={dates}
            selected={selectedDate}
            onSelect={setSelectedDate}
            customDate={customDate}
            onCustomDateChange={(d) => {
              setCustomDate(d);
              if (d) {
                setSelectedDate(d);
              } else if (selectedDate === customDate) {
                setSelectedDate(dates[0]);
              }
            }}
            minCustomDate={dates[0]}
            maxCustomDate={maxCustomDate}
            datesWithRides={datesWithRides}
          />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3 px-4 py-4 pb-6">
        {loading ? (
          <div className="mt-10 flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-secondary" />
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border bg-card/70 px-6 py-12 text-center shadow-[0_14px_30px_rgba(17,17,17,0.04)]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-muted-light">
              <Car size={28} />
            </div>
            <p className="text-[15px] font-semibold text-foreground">No rides on {formatDateShort(selectedDate)}</p>
            <p className="mt-1 max-w-[240px] text-sm text-muted">
              Request one for this day, or jump to a date that has rides.
            </p>
            <div className="mt-5 flex w-full max-w-[280px] flex-col gap-2">
              <button
                onClick={() => setRequestOpen(true)}
                className="rounded-[1.1rem] bg-cta px-5 py-3 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(17,17,17,0.15)] transition-all duration-200 hover:bg-cta-hover active:scale-[0.99]"
              >
                Request a ride for {formatDateShort(selectedDate)}
              </button>
              {nextAvailableDate && (
                <button
                  onClick={handleJumpToNextDate}
                  className="rounded-[1.1rem] border border-border/80 bg-white/70 px-5 py-3 text-[14px] font-semibold text-muted transition-all duration-200 hover:border-secondary/40 hover:text-foreground"
                >
                  See {formatDateShort(nextAvailableDate)} instead
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              onTap={setSelectedRide}
              onDelete={handleDeleteRide}
              onManage={handleManageRide}
            />
          ))
        )}
      </main>

      {/* Request a Ride — sticky bottom bar */}
      <div className="sticky bottom-0 z-10 border-t border-border/70 bg-card/90 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <button
            onClick={() => setRequestOpen(true)}
            className="w-full rounded-[1.2rem] bg-secondary px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(201,106,33,0.3)] transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
          >
            Request a Ride
          </button>
        </div>
      </div>

      {/* PIN Dialog */}
      {pinDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => {
            setPinDialogOpen(false);
            setPinInput("");
            setPinError(false);
          }}
        >
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
          <div
            className="dialog-enter relative z-10 w-full max-w-sm rounded-[1.75rem] border border-border bg-card p-6 shadow-[0_24px_70px_rgba(17,17,17,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Driver access</h3>
                <p className="text-sm text-muted">Enter the operator PIN to continue.</p>
              </div>
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
              placeholder="Enter PIN"
              className={`w-full rounded-[1.15rem] border px-4 py-3 text-center text-2xl tracking-[0.4em] font-semibold transition-all duration-200 ${
                pinError
                  ? "border-danger bg-danger-light text-danger"
                  : "border-border bg-surface text-foreground"
              }`}
              autoFocus
            />
            {pinError && <p className="mt-2 text-center text-sm font-medium text-danger">Incorrect PIN</p>}
            <button
              onClick={handlePinSubmit}
              className="mt-5 w-full rounded-[1.15rem] bg-primary py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-hover"
            >
              Unlock
            </button>
          </div>
        </div>
      )}

      <RideDetailSheet
        ride={selectedRide}
        onClose={() => setSelectedRide(null)}
        onBook={handleBookSeat}
      />

      <DriverSheet
        open={postOpen}
        onClose={() => { setPostOpen(false); setFocusRideId(null); }}
        onSubmitRide={handlePostRide}
        onRideCreated={loadRides}
        defaultTab={driverDefaultTab}
        currentUrl={currentUrl}
        focusRideId={focusRideId}
        onFocusConsumed={() => setFocusRideId(null)}
      />

      <RequestRideSheet
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        driverPhone={DRIVER_PHONE}
        currentUrl={currentUrl}
        initialDate={selectedDate}
      />
    </div>
  );
}
