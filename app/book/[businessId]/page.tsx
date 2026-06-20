'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { SlotCard } from '@/components/slot-card';
import { BookingSidebar } from '@/components/booking-sidebar';
import { EmptyState } from '@/components/empty-state';
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
              <h2 className="mb-6 text-xl font-semibold text-foreground">Available Times</h2>
              {slots.length === 0 ? (
                <EmptyState
                  icon="📭"
                  title="No Available Slots"
                  description="Sorry, there are no available time slots at the moment. Please check back soon or contact the business directly."
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {slots.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedSlot?.id === slot.id}
                      onClick={handleSlotSelect}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Booking Sidebar */}
            <BookingSidebar
              selectedSlot={selectedSlot}
              formData={formData}
              onFormChange={handleChange}
              onSubmit={handleSubmit}
              isSubmitting={submitting}
            />
          </div>
        </div>
      </main>
    </>
  );
}
