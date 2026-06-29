'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/header';

interface BookingResponse {
  id: string;
  businessId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  depositPaid: boolean;
  createdAt: string;
  slot: {
    startTime: string;
    endTime: string;
  };
}

export default function ConfirmationPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (res.ok) {
          setBooking(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch booking:', err);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080A0F] text-white">
        <Header />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </main>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#080A0F] text-white">
        <Header />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-slate-400">Appointment not found</p>
            <Link href="/" className="inline-flex text-primary hover:underline text-sm font-semibold">
              Go back home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const formatTimeStr = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' });
    } catch {
      return isoString;
    }
  };

  const formatDateStr = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0F] mesh-bg text-white">
      <Header />

      <main className="relative z-10 max-w-xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {/* Animated Celebration checkmark */}
        <div className="relative mb-8 flex h-20 w-20 items-center justify-center animate-glow-pulse rounded-full bg-emerald-500/10 border-2 border-emerald-500/30">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-ping opacity-45" style={{ animationDuration: '3s' }} />
          <span className="text-4xl animate-bounce">✓</span>
        </div>

        <div className="w-full rounded-xl border border-white/5 bg-white/[0.02] p-8 shadow-2xl glass-card space-y-6 text-center animate-slide-up">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white">Appointment Confirmed!</h1>
            <p className="text-xs text-muted-foreground">
              Your time slot has been secured. Below is your booking summary.
            </p>
          </div>

          {/* Receipt summary */}
          <div className="rounded-xl bg-black/40 border border-white/5 p-5 text-left space-y-4">
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Client Profile</p>
                <p className="text-sm font-bold text-white mt-1">{booking.customerName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{booking.customerEmail}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{booking.customerPhone}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Transaction ID</p>
                <p className="text-xs font-mono text-slate-400 mt-1">{booking.id.slice(0, 8)}...</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Date:</span>
                <span className="font-semibold text-white">{formatDateStr(booking.slot.startTime)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Time:</span>
                <span className="font-semibold text-white">
                  {formatTimeStr(booking.slot.startTime)} – {formatTimeStr(booking.slot.endTime)}
                </span>
              </div>
              <div className="flex justify-between text-xs items-center pt-2 border-t border-white/5">
                <span className="text-slate-400">Security Deposit Status:</span>
                {booking.depositPaid ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                    PAID $10.00
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded">
                    PENDING
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Calendar integrations */}
          <div className="space-y-3 pt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add to Calendar</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => alert('Mock: Exporting to Google Calendar...')}
                className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold transition-all"
              >
                Google Calendar
              </button>
              <button
                onClick={() => alert('Mock: Exporting to Outlook Calendar...')}
                className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold transition-all"
              >
                Outlook
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 py-2.5 text-xs font-bold text-white transition-all text-center"
            >
              Back to Home
            </Link>
            <Link
              href={`/book/${booking.businessId}`}
              className="flex-1 rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 text-center"
            >
              Book Another Slot
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
