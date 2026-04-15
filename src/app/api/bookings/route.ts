import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const { ride_id, name, phone } = await req.json();

  if (!ride_id || !name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Get ride and check availability
  const { data: ride, error: rideErr } = await supabase
    .from("rides")
    .select("*")
    .eq("id", ride_id)
    .single();

  if (rideErr || !ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  if (ride.booked_seats >= ride.total_seats) {
    return NextResponse.json({ error: "Ride is full" }, { status: 400 });
  }

  // Create booking
  const { data: booking, error: bookErr } = await supabase
    .from("bookings")
    .insert({ ride_id, name: name.trim(), phone: phone.trim() })
    .select()
    .single();

  if (bookErr) return NextResponse.json({ error: bookErr.message }, { status: 500 });

  // Increment booked_seats
  const { error: updateErr } = await supabase
    .from("rides")
    .update({ booked_seats: ride.booked_seats + 1 })
    .eq("id", ride_id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json(booking);
}
