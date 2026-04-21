import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ADMIN_PIN = "1234";

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const pin = searchParams.get("pin");
  const rideId = searchParams.get("ride_id");

  if (pin === ADMIN_PIN) {
    let query = supabase.from("bookings").select("*").order("created_at", { ascending: true });
    if (rideId) query = query.eq("ride_id", rideId);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (!rideId) {
    return NextResponse.json({ error: "ride_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("ride_id", rideId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const { ride_id, name, phone, source, pin } = await req.json();

  if (!ride_id || !name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: ride, error: rideErr } = await supabase
    .from("rides")
    .select("*")
    .eq("id", ride_id)
    .single();

  if (rideErr || !ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  // Driver PIN bypasses the seat availability check
  if (pin !== ADMIN_PIN && ride.booked_seats >= ride.total_seats) {
    return NextResponse.json({ error: "Ride is full" }, { status: 400 });
  }

  const { data: booking, error: bookErr } = await supabase
    .from("bookings")
    .insert({ ride_id, name: name.trim(), phone: phone.trim(), source: source || "app" })
    .select()
    .single();

  if (bookErr) return NextResponse.json({ error: bookErr.message }, { status: 500 });

  const { error: updateErr } = await supabase
    .from("rides")
    .update({ booked_seats: ride.booked_seats + 1 })
    .eq("id", ride_id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json(booking);
}
