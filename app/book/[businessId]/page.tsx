'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { EmptyState } from '@/components/empty-state';
import { TimeSlot, Business } from '@/lib/types';

export default function PublicBookingPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Wizard flow states
  const [groupedDates, setGroupedDates] = useState<{ dateStr: string; label: string; dayName: string; slotsCount: number }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Customer Details Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  // Stripe Mock Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [bizRes, slotsRes] = await Promise.all([
        fetch(`/api/businesses/${businessId}`),
        fetch(`/api/slots?businessId=${businessId}`),
      ]);

      if (bizRes.ok) setBusiness(await bizRes.json());
      if (slotsRes.ok) {
        const allSlots = await slotsRes.json();
        // Only show open slots
        const openSlots = allSlots.filter((s: TimeSlot) => s.status === 'open');
        setSlots(openSlots);

        // Group slots by date for our calendar date selector
        const dateMap = new Map<string, TimeSlot[]>();
        openSlots.forEach((slot: TimeSlot) => {
          const dateStr = slot.startTime.split('T')[0];
          if (!dateMap.has(dateStr)) {
            dateMap.set(dateStr, []);
          }
          dateMap.get(dateStr)!.push(slot);
        });

        const grouped = Array.from(dateMap.keys()).sort().map(dateStr => {
          const d = new Date(`${dateStr}T00:00:00Z`);
          return {
            dateStr,
            label: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            slotsCount: dateMap.get(dateStr)!.length
          };
        });

        setGroupedDates(grouped);
        if (grouped.length > 0) {
          setSelectedDate(grouped[0].dateStr); // Default to first date with slots
        }
      }
    } catch (err) {
      console.error('Failed to fetch booking details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchData();
    }
  }, [businessId]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardData({ ...cardData, number: parts.join(' ') });
    } else {
      setCardData({ ...cardData, number: value });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setCardData({ ...cardData, expiry: value.slice(0, 5) });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    setBookingError(null);

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
          depositPaid: true, // Pay mock deposit
        }),
      });

      if (response.ok) {
        const booking = await response.json();
        router.push(`/confirmation/${booking.id}`);
      } else {
        const data = await response.json();
        setBookingError(data.error || 'Could not complete booking. Please try again.');
        setShowPaymentModal(false);
        // Refresh slots list to remove the taken slot
        setSlots((prev) => prev.filter((s) => s.id !== selectedSlot.id));
        setSelectedSlot(null);
      }
    } catch (err) {
      console.error('Failed to create booking:', err);
      setBookingError('Something went wrong. Please try again.');
      setShowPaymentModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format ISO time in visual dashboard
  const formatTimeStr = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return isoString;
    }
  };

  const formatDateStr = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return isoString;
    }
  };

  // Filter slots for the selected date
  const filteredSlots = slots.filter(s => s.startTime.split('T')[0] === selectedDate);

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

  if (!business) {
    return (
      <div className="min-h-screen bg-[#080A0F] text-white">
        <Header />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <p className="text-lg font-semibold text-slate-400">Business not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080A0F] mesh-bg text-white relative">
      <Header title="Book Appointment" />

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10 animate-slide-up">
        {/* Business Banner */}
        <div className="border-b border-white/5 pb-6 mb-8 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-extrabold text-white">{business.name}</h1>
          <p className="text-sm text-slate-400">Schedule your slot. Instant locking secured by Aurora DSQL.</p>
        </div>

        {bookingError && (
          <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            ⚠️ <strong>Booking Failed:</strong> {bookingError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Wizard steps (Date & Time selector) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Select Date Calendar Row */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 glass-card space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                📅 1. Choose Date
              </h3>

              {groupedDates.length === 0 ? (
                <EmptyState
                  icon="📭"
                  title="No available times"
                  description="This business calendar has no open time slots at the moment. Please check back later."
                />
              ) : (
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {groupedDates.map((item) => (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(item.dateStr);
                        setSelectedSlot(null); // Clear selected slot
                      }}
                      className={`flex flex-col items-center justify-center shrink-0 w-20 py-3 rounded-lg border text-center transition-all ${
                        selectedDate === item.dateStr
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow'
                          : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-semibold">{item.dayName}</span>
                      <span className="text-sm mt-1">{item.label}</span>
                      <span className="text-[9px] text-muted-foreground mt-1 font-mono">
                        {item.slotsCount} open
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Time Slots Grid for selected date */}
            {selectedDate && groupedDates.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 glass-card space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  🕐 2. Select Appointment Time
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 px-4 rounded-xl border text-center transition-all ${
                        selectedSlot?.id === slot.id
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-lg shadow-primary/5'
                          : 'border-white/5 bg-black/20 text-slate-300 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-sm block">{formatTimeStr(slot.startTime)}</span>
                      <span className="text-[9px] text-muted-foreground mt-0.5 block font-mono">
                        to {formatTimeStr(slot.endTime)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Details input & Confirmation preview */}
          <div className="lg:col-span-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 glass-card space-y-6">
              <h3 className="text-base font-bold text-white">Your Appointment</h3>

              {selectedSlot ? (
                <div className="space-y-6">
                  {/* Slot details pill */}
                  <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 p-4">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">
                      Selected Slot
                    </p>
                    <p className="text-sm font-bold text-white">{formatDateStr(selectedSlot.startTime)}</p>
                    <p className="text-xs text-slate-300 mt-1">
                      {formatTimeStr(selectedSlot.startTime)} – {formatTimeStr(selectedSlot.endTime)}
                    </p>
                  </div>

                  {/* Customer details form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setShowPaymentModal(true); // Open Stripe modal
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label htmlFor="name" className="text-xs font-semibold text-slate-300">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-muted-foreground glass-input focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="email" className="text-xs font-semibold text-slate-300">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-muted-foreground glass-input focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="phone" className="text-xs font-semibold text-slate-300">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        placeholder="+1 (555) 123-4567"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-muted-foreground glass-input focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 mt-4"
                    >
                      Book With Deposit ($10)
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-3xl mb-2">⏰</p>
                  <p className="text-xs">Select a date and time slot to complete booking details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOCK STRIPE CREDIT CARD CHECKOUT MODAL */}
        {showPaymentModal && selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0e14] p-6 shadow-2xl glass-card space-y-6 animate-slide-up">
              
              {/* Modal header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">🔐 Secure Deposit Checkout</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Mock Stripe test environment</p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* 3D Glassmorphic Credit Card Preview */}
              <div className="relative h-48 w-full perspective-1000">
                <div
                  className={`relative h-full w-full rounded-xl p-6 shadow-lg transition-transform duration-700 transform-style-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, oklch(0.62 0.19 285 / 90%) 0%, oklch(0.76 0.16 152 / 90%) 100%)',
                  }}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between backface-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white">SecureCard</span>
                      <span className="text-lg">💳</span>
                    </div>
                    <div className="space-y-4">
                      <p className="text-lg font-mono tracking-widest text-white text-center">
                        {cardData.number || '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex items-center justify-between text-xs font-mono text-white/80">
                        <p>{cardData.name.toUpperCase() || 'CARDHOLDER NAME'}</p>
                        <p>{cardData.expiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Back Side (CVV flip) */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between rotate-y-180 backface-hidden">
                    <div className="bg-black/60 h-8 -mx-6 mt-2" />
                    <div className="flex justify-end items-center gap-3">
                      <span className="text-[9px] uppercase font-bold text-white/80">Security Code</span>
                      <div className="bg-white text-black px-2 py-1 font-mono text-xs rounded font-bold">
                        {cardData.cvc || '•••'}
                      </div>
                    </div>
                    <div className="text-[9px] text-white/50 text-center leading-normal">
                      This is a simulated credit card dialog supporting AWS Aurora DSQL hackathon demonstrations.
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Input Fields */}
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                {/* Card Number */}
                <div className="space-y-1">
                  <label htmlFor="cardNumber" className="text-[10px] font-bold text-slate-300">Card Number</label>
                  <input
                    id="cardNumber"
                    type="text"
                    required
                    placeholder="4111 1111 1111 1111"
                    value={cardData.number}
                    onChange={handleCardNumberChange}
                    onFocus={() => setIsFlipped(false)}
                    className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-muted-foreground glass-input focus:outline-none"
                  />
                </div>

                {/* Cardholder name */}
                <div className="space-y-1">
                  <label htmlFor="cardName" className="text-[10px] font-bold text-slate-300">Cardholder Name</label>
                  <input
                    id="cardName"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    onFocus={() => setIsFlipped(false)}
                    className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-muted-foreground glass-input focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry */}
                  <div className="space-y-1">
                    <label htmlFor="cardExpiry" className="text-[10px] font-bold text-slate-300">Expiry Date</label>
                    <input
                      id="cardExpiry"
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={handleExpiryChange}
                      onFocus={() => setIsFlipped(false)}
                      className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-muted-foreground glass-input focus:outline-none"
                    />
                  </div>

                  {/* CVC */}
                  <div className="space-y-1">
                    <label htmlFor="cardCvc" className="text-[10px] font-bold text-slate-300">CVC / CVV</label>
                    <input
                      id="cardCvc"
                      type="password"
                      required
                      placeholder="•••"
                      maxLength={3}
                      value={cardData.cvc}
                      onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '') })}
                      onFocus={() => setIsFlipped(true)}
                      onBlur={() => setIsFlipped(false)}
                      className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-muted-foreground glass-input focus:outline-none"
                    />
                  </div>
                </div>

                {/* Confirm locks */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-primary px-4 py-3.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 hover:scale-[1.01] active:scale-[0.99] mt-6"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border border-primary-foreground/30 border-t-primary-foreground" />
                      Securing Deposit & Locking Slot...
                    </span>
                  ) : (
                    'Confirm Pay & Lock Slot'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
