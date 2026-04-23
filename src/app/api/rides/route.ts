import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ADMIN_PIN = "1234";

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const pin = searchParams.get("pin");

  if (pin === ADMIN_PIN) {
    const { data, error } = await supabase
      .from("rides")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("rides")
    .select("*")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  const { pin, direction, date, time, total_seats, booked_seats, passengers } = body;

  if (pin !== ADMIN_PIN) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const { data: ride, error } = await supabase
    .from("rides")
    .insert({ direction, date, time, total_seats, booked_seats: booked_seats || 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (Array.isArray(passengers) && passengers.length > 0) {
    const bookingRows = passengers.map((p: { name: string; phone: string }) => ({
      ride_id: ride.id,
      name: p.name.trim(),
      phone: p.phone.trim(),
      source: "pre-confirmed",
    }));
    const { error: bookErr } = await supabase.from("bookings").insert(bookingRows);
    if (bookErr) return NextResponse.json({ error: bookErr.message }, { status: 500 });
  }

  return NextResponse.json(ride);
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  const { id, pin, direction, date, time, total_seats } = body;

  if (pin !== ADMIN_PIN) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { data: ride, error: fetchErr } = await supabase
    .from("rides")
    .select("booked_seats")
    .eq("id", id)
    .single();

  if (fetchErr || !ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (direction !== undefined) updates.direction = direction;
  if (date !== undefined) updates.date = date;
  if (time !== undefined) updates.time = time;
  if (total_seats !== undefined) {
    if (typeof total_seats !== "number" || total_seats < 1) {
      return NextResponse.json({ error: "Invalid total_seats" }, { status: 400 });
    }
    if (total_seats < ride.booked_seats) {
      return NextResponse.json(
        { error: `Cannot shrink seats below ${ride.booked_seats} booked. Remove passengers first.` },
        { status: 400 }
      );
    }
    updates.total_seats = total_seats;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("rides")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  const { id, pin } = body;

  if (pin !== ADMIN_PIN) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const { error: bookingsErr } = await supabase.from("bookings").delete().eq("ride_id", id);
  if (bookingsErr) return NextResponse.json({ error: bookingsErr.message }, { status: 500 });

  const { error } = await supabase.from("rides").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
