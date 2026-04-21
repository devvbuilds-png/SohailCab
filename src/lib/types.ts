export type Direction = "manipal-to-airport" | "airport-to-manipal";

export interface Ride {
  id: string;
  direction: Direction;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  total_seats: number;
  booked_seats: number;
}

export interface Booking {
  id: string;
  ride_id: string;
  name: string;
  phone: string;
  created_at: string;
  source?: "app" | "pre-confirmed" | "manual";
}

export interface RideFormData {
  direction: Direction;
  date: string;
  time: string;
  total_seats: number;
  booked_seats: number;
  passengers?: { name: string; phone: string }[];
}

export type RequestStatus = "pending" | "accepted" | "rejected";

export interface RideRequest {
  id: string;
  direction: Direction;
  date: string;
  time: string;
  name: string;
  phone: string;
  seats_needed: number;
  solo: boolean;
  status: RequestStatus;
  created_at: string;
}
