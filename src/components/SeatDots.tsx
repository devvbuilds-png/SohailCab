interface SeatDotsProps {
  maxSeats: number;
  bookedSeats: number;
}

export default function SeatDots({ maxSeats, bookedSeats }: SeatDotsProps) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: maxSeats }).map((_, i) => (
        <div
          key={i}
          className={`h-2.5 w-2.5 rounded-full transition-colors duration-200 ${
            i < bookedSeats ? "bg-secondary" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}
