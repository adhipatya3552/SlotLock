'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { StatCard } from '@/components/stat-card';
import { EmptyState } from '@/components/empty-state';
import { TimeSlot, Booking, Business } from '@/lib/mock-data';

export default function DashboardPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bizRes, slotsRes, bookingsRes] = await Promise.all([
          fetch(`/api/businesses/${businessId}`),
          fetch(`/api/slots?businessId=${businessId}`),
          fetch(`/api/bookings?businessId=${businessId}`),
        ]);

        if (bizRes.ok) setBusiness(await bizRes.json());
        if (slotsRes.ok) setSlots(await slotsRes.json());
        if (bookingsRes.ok) setBookings(await bookingsRes.json());
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessId]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
        }),
      });

      if (response.ok) {
        const newSlot = await response.json();
        setSlots([...slots, newSlot]);
        setFormData({ date: '', startTime: '', endTime: '' });
        setShowAddSlot(false);
      }
    } catch (err) {
      console.error('Failed to add slot:', err);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="SlotLock Dashboard" />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </>
    );
  }

  if (!business) {
    return (
      <>
        <Header title="SlotLock Dashboard" />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">Business not found</p>
            <Link href="/signup" className="mt-4 inline-flex text-primary hover:underline">
              Create a new business
            </Link>
          </div>
        </main>
      </>
    );
  }

  const bookingsBySlot = new Map(bookings.map((b) => [b.slotId, b]));
  const bookedCount = slots.filter((s) => s.status === 'booked').length;
  const availableCount = slots.filter((s) => s.status === 'open').length;

  return (
    <>
      <Header title="SlotLock Dashboard" />
      <main className="min-h-[calc(100vh-80px)] bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          {/* Business Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">{business.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Booking link:{' '}
              <Link
                href={business.publicLink}
                target="_blank"
                className="font-semibold text-primary hover:underline break-all"
              >
                {`${window.location.origin}${business.publicLink}`}
              </Link>
            </p>
          </div>

          {/* Stats Row */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <StatCard label="Total Slots" value={slots.length} icon="📅" color="primary" />
            <StatCard label="Booked" value={bookedCount} icon="✓" color="accent" />
            <StatCard label="Available" value={availableCount} icon="⭐" color="muted" />
          </div>

          {/* Add Slot Section */}
          <div className="mb-8">
            {!showAddSlot ? (
              <button
                onClick={() => setShowAddSlot(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 shadow-lg hover:shadow-xl"
              >
                <span className="text-lg">+</span>
                Add New Slot
              </button>
            ) : (
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Create a Time Slot</h2>
                <form onSubmit={handleAddSlot} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-foreground mb-1">
                        Date
                      </label>
                      <input
                        id="date"
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-foreground mb-1">
                        Start Time
                      </label>
                      <input
                        id="startTime"
                        type="time"
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-foreground mb-1">
                        End Time
                      </label>
                      <input
                        id="endTime"
                        type="time"
                        required
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      Create Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddSlot(false)}
                      className="rounded-lg border border-border px-4 py-2 font-semibold text-foreground transition hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Time Slots Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Available Time Slots</h2>
            {slots.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No time slots yet"
                description="Create your first time slot to start accepting bookings. Your customers will see available slots on your public booking page."
                action={{
                  label: 'Create First Slot',
                  onClick: () => setShowAddSlot(true),
                }}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {slots.map((slot) => (
                  <div key={slot.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{slot.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {slot.startTime} - {slot.endTime}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          slot.status === 'booked'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-accent/10 text-accent'
                        }`}
                      >
                        {slot.status === 'booked' ? 'Booked' : 'Open'}
                      </span>
                    </div>
                    {bookingsBySlot.has(slot.id) && (
                      <div className="mt-3 border-t border-border pt-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Booking
                        </p>
                        <p className="mt-1 text-sm text-foreground">{bookingsBySlot.get(slot.id)?.customerName}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookings Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-foreground">Recent Bookings</h2>
            {bookings.length === 0 ? (
              <EmptyState
                icon="🎫"
                title="No bookings yet"
                description="Share your booking link with customers to start receiving appointments. They&apos;ll appear here as they book."
              />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Customer Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Booked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm text-foreground">{booking.customerName}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{booking.customerEmail}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{booking.customerPhone}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
