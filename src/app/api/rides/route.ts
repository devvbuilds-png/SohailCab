import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ADMIN_PIN = "1234";

export async function GET() {
  const supabase = getSupabase();
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
  const { pin, direction, date, time, total_seats, booked_seats } = body;

  if (pin !== ADMIN_PIN) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("rides")
    .insert({ direction, date, time, total_seats, booked_seats: booked_seats || 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
