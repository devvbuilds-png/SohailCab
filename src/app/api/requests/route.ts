import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  const { direction, date, time, name, phone, seats_needed, solo } = body;

  if (!direction || !date || !time || !name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("requests")
    .insert({
      direction,
      date,
      time,
      name: name.trim(),
      phone: phone.trim(),
      seats_needed: seats_needed || 1,
      solo: solo || false,
      status: "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  const { id, action } = body;

  if (!id || !action) {
    return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
  }

  const { data: request, error: fetchErr } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (action === "reject") {
    const { error } = await supabase
      .from("requests")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "accept") {
    const { error: updateErr } = await supabase
      .from("requests")
      .update({ status: "accepted" })
      .eq("id", id);

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    const totalSeats = request.solo ? request.seats_needed : 4;
    const { data: ride, error: rideErr } = await supabase
      .from("rides")
      .insert({
        direction: request.direction,
        date: request.date,
        time: request.time,
        total_seats: totalSeats,
        booked_seats: request.seats_needed,
      })
      .select()
      .single();

    if (rideErr) return NextResponse.json({ error: rideErr.message }, { status: 500 });

    const bookingRows = Array.from({ length: request.seats_needed }, () => ({
      ride_id: ride.id,
      name: request.name,
      phone: request.phone,
      source: "app",
    }));

    const { error: bookErr } = await supabase.from("bookings").insert(bookingRows);
    if (bookErr) return NextResponse.json({ error: bookErr.message }, { status: 500 });

    return NextResponse.json({ request: { ...request, status: "accepted" }, ride });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
