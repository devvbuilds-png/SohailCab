# SohailCab

**A zero-login ride-coordination feed for shared cabs between Manipal and Mangalore Airport.**

## What it is / why I built it

Getting between Manipal and Mangalore Airport usually means coordinating in WhatsApp: a driver posts a time, people reply, seats get double-counted, and nobody knows what is actually left. Sohail, a local cab driver, was running all of this by hand.

I built SohailCab as a single shared feed. The driver posts rides with seat counts, and anyone can open the link, see what is available on a given day, and book a seat without creating an account. The booking then hands off to WhatsApp, where the conversation was already happening. It is used daily on this real route and has logged 20+ bookings.

## Features

- **Ride feed**: rides for both directions (Manipal to Airport, Airport to Manipal), filterable by date, with seat-availability dots
- **No-account booking**: enter a name and phone number to book a seat, then WhatsApp opens with a pre-filled message to the driver
- **Ride requests**: if no ride fits, passengers can request a date and time, choose the number of seats, and flag that they don't want to share
- **Driver panel** (behind a PIN), with three tabs:
  - **Post**: create a ride, optionally with pre-confirmed passengers, then share it to WhatsApp with a deep link to that date
  - **Passengers**: view, add (manual), edit and remove bookings per ride
  - **Requests**: accept or reject incoming ride requests
- Mobile-first bottom-sheet UI

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4, Lucide icons
- Supabase (Postgres) for rides, bookings and requests, accessed through Next.js API routes

## Run locally

```bash
npm install
npm run dev     # http://localhost:3000
```

Create a `.env.local` with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The Supabase project needs `rides`, `bookings` and `requests` tables. Their field shapes are in `src/lib/types.ts`.

## Project structure

```
src/
  app/            page (ride feed) + API routes: /api/rides, /api/bookings, /api/requests
  components/     ride cards, date filter, booking / request / driver bottom sheets
  lib/            Supabase client, types, date/time helpers
```

## Status

In daily use on the Manipal to Mangalore Airport route.
