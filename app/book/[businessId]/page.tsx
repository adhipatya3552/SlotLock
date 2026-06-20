'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { TimeSlot, Business } from '@/lib/mock-data';

export default function PublicBookingPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bizRes, slotsRes] = await Promise.all([
          fetch(`/api/businesses/${businessId}`),
          fetch(`/api/slots?businessId=${businessId}`),
        ]);

        if (bizRes.ok) setBusiness(await bizRes.json());
        if (slotsRes.ok) {
          const allSlots = await slotsRes.json();
          setSlots(allSlots.filter((s: TimeSlot) => s.status === 'open'));
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessId]);

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          businessId,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
        }),
      });

      if (response.ok) {
        const booking = await response.json();
        router.push(`/confirmation/${booking.id}`);
      }
    } catch (err) {
      console.error('Failed to create booking:', err);
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!business) {
    return (
      <>
        <Header />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <p className="text-lg font-semibold text-foreground">Business not found</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-80px)] bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-3xl font-bold text-foreground">{business.name}</h1>
          <p className="mb-8 text-muted-foreground">Book an appointment</p>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Available Slots */}
            <div className="lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Available Slots</h2>
              {slots.length === 0 ? (
                <p className="text-muted-foreground">No available slots at the moment. Check back soon.</p>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot)}
                      className={`w-full rounded-lg border-2 p-4 text-left transition ${
                        selectedSlot?.id === slot.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-semibold text-foreground">{slot.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Form */}
            <div className="rounded-lg border border-border bg-card p-6 h-fit">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Your Details</h2>
              {selectedSlot ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Selected Time
                    </p>
                    <p className="mt-1 font-medium text-foreground">{selectedSlot.date}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSlot.startTime} - {selectedSlot.endTime}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="customerName"
                      required
                      placeholder="John Doe"
                      value={formData.customerName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="customerEmail"
                      required
                      placeholder="john@example.com"
                      value={formData.customerEmail}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="customerPhone"
                      required
                      placeholder="+1-555-0123"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                  >
                    {submitting ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                </form>
              ) : (
                <p className="text-muted-foreground text-sm">Select a time slot to book.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
