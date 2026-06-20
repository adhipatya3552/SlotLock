'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Booking, TimeSlot } from '@/lib/mock-data';

interface BookingDetails extends Booking {
  slot?: TimeSlot;
}

export default function ConfirmationPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (response.ok) {
          setBooking(await response.json());
        }
      } catch (err) {
        console.error('Failed to fetch booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Header />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">Booking not found</p>
            <Link href="/" className="mt-4 inline-flex text-primary hover:underline">
              Return to home
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-br from-background via-secondary to-background px-4 py-12">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent text-2xl">
              ✓
            </div>
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-foreground">You&apos;re booked!</h1>
          <p className="mb-8 text-center text-muted-foreground">
            Your appointment has been confirmed. A confirmation email has been sent to {booking.customerEmail}.
          </p>

          <div className="space-y-6 rounded-lg bg-muted p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Name</p>
              <p className="mt-1 text-lg font-medium text-foreground">{booking.customerName}</p>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact Info</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-foreground">{booking.customerEmail}</p>
                <p className="text-sm text-foreground">{booking.customerPhone}</p>
              </div>
            </div>

            {booking.slot && (
              <div className="border-t border-border pt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Appointment Time</p>
                <p className="mt-2 font-medium text-foreground">{booking.slot.date}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.slot.startTime} - {booking.slot.endTime}
                </p>
              </div>
            )}

            <div className="border-t border-border pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Booking Reference</p>
              <p className="mt-1 font-mono text-sm text-foreground">{booking.id}</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/"
              className="block rounded-lg bg-primary px-4 py-2 text-center font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
