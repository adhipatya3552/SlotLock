'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { StatCard } from '@/components/stat-card';
import { EmptyState } from '@/components/empty-state';
import { TimeSlot, Business } from '@/lib/types';

export default function DashboardPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'slots' | 'bookings'>('slots');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Calendar Creator State
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [creatorError, setCreatorError] = useState<string | null>(null);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);

  // Generate the next 14 days for the custom calendar selector
  const [availableDates, setAvailableDates] = useState<{ dateStr: string; label: string; dayName: string }[]>([]);

  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      
      dates.push({ dateStr, label, dayName });
    }
    setAvailableDates(dates);
    setSelectedDate(dates[0].dateStr); // Default to today
  }, []);

  const fetchData = async () => {
    try {
      const [bizRes, slotsRes] = await Promise.all([
        fetch(`/api/businesses/${businessId}`),
        fetch(`/api/slots?businessId=${businessId}`),
      ]);

      if (bizRes.ok) setBusiness(await bizRes.json());
      if (slotsRes.ok) setSlots(await slotsRes.json());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchData();
    }
  }, [businessId]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatorError(null);

    // Validate times
    if (startTime >= endTime) {
      setCreatorError('Start time must be earlier than end time');
      return;
    }

    try {
      const response = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          date: selectedDate,
          startTime,
          endTime,
        }),
      });

      if (response.ok) {
        const newSlot = await response.json();
        setSlots((prev) => [...prev, newSlot]);
        setShowAddSlot(false);
        setStartTime('09:00');
        setEndTime('10:00');
      } else {
        const errData = await response.json();
        setCreatorError(errData.error || 'Failed to create slot');
      }
    } catch (err) {
      console.error('Failed to add slot:', err);
      setCreatorError('Something went wrong. Please try again.');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    setDeletingSlotId(slotId);
    try {
      const response = await fetch(`/api/slots/${slotId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSlots((prev) => prev.filter((s) => s.id !== slotId));
      } else {
        const err = await response.json();
        alert(err.error || 'Could not delete slot');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingSlotId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080A0F] text-white">
        <Header title="Dashboard" />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </main>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-[#080A0F] text-white">
        <Header title="Dashboard" />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-slate-400">Business not found</p>
            <Link href="/signup" className="inline-flex text-primary hover:underline text-sm font-semibold">
              Create a new business calendar
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const bookedSlots = slots.filter((s) => s.status === 'booked');
  const availableSlots = slots.filter((s) => s.status === 'open');
  const totalSlotsCount = slots.length;
  
  // Filter bookings based on search
  const filteredBookings = bookedSlots.filter((b) => {
    const term = searchQuery.toLowerCase();
    return (
      (b.customerName || '').toLowerCase().includes(term) ||
      (b.customerContact || '').toLowerCase().includes(term)
    );
  });

  const getPublicBookingUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/book/${business.id}`;
    }
    return `/book/${business.id}`;
  };

  // Helper to format ISO time in visual dashboard
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
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0F] mesh-bg text-white">
      <Header title="Owner Dashboard" />

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10 space-y-8 animate-slide-up">
        {/* Business Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{business.name}</h1>
            <p className="text-xs text-muted-foreground">Owner Account: {business.ownerEmail}</p>
          </div>

          {/* Share Link box */}
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 max-w-md w-full md:w-auto">
            <div className="truncate text-xs text-slate-400 select-all font-mono">
              {getPublicBookingUrl()}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(getPublicBookingUrl());
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-xs font-bold text-primary hover:text-white transition-colors shrink-0 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Calendar Slots" value={totalSlotsCount} icon="📅" color="primary" />
          <StatCard label="Booked Appointments" value={bookedSlots.length} icon="🔒" color="accent" />
          <StatCard label="Available Time Slots" value={availableSlots.length} icon="✨" color="muted" />
        </div>

        {/* Tab Selector & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/5 pb-2">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-transparent">
            <button
              onClick={() => setActiveTab('slots')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'slots' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white'
              }`}
            >
              Time Slots Manager
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'bookings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white'
              }`}
            >
              Bookings Registry ({bookedSlots.length})
            </button>
          </div>

          {/* Quick Creator Button */}
          {activeTab === 'slots' && (
            <button
              onClick={() => setShowAddSlot(!showAddSlot)}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow shadow-primary/15 transition-all hover:bg-primary/95"
            >
              {showAddSlot ? 'Cancel' : '+ Add Time Slot'}
            </button>
          )}
        </div>

        {/* Custom Visual Slot Creator Widget */}
        {showAddSlot && activeTab === 'slots' && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 glass-card space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Create A Time Slot</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Use the calendar and preset options below to define your slot.</p>
            </div>

            {creatorError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                {creatorError}
              </div>
            )}

            <form onSubmit={handleAddSlot} className="space-y-6">
              {/* Step 1: Click a day from custom calendar row */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">1. Select Date</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {availableDates.map((item) => (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(item.dateStr)}
                      className={`flex flex-col items-center justify-center shrink-0 w-16 py-2.5 rounded-lg border text-center transition-all ${
                        selectedDate === item.dateStr
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow'
                          : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-semibold">{item.dayName}</span>
                      <span className="text-xs mt-1">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Set Hours using nice visual options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Time */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">2. Start Time</label>
                  <div className="flex flex-wrap gap-2">
                    {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setStartTime(time);
                          // Auto set end time to +1 hour
                          const hour = parseInt(time.split(':')[0]);
                          setEndTime(`${String(hour + 1).padStart(2, '0')}:00`);
                        }}
                        className={`px-3 py-2 rounded-lg border text-xs transition-all ${
                          startTime === time
                            ? 'border-primary bg-primary/10 text-primary font-bold'
                            : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/10'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                    {/* Custom Input fallback */}
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-white/5 bg-black/20 text-slate-300 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">3. End Time</label>
                  <div className="flex flex-wrap gap-2">
                    {['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setEndTime(time)}
                        className={`px-3 py-2 rounded-lg border text-xs transition-all ${
                          endTime === time
                            ? 'border-primary bg-primary/10 text-primary font-bold'
                            : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/10'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                    {/* Custom Input fallback */}
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-white/5 bg-black/20 text-slate-300 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-95"
                >
                  Create Open Slot
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSlot(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 1: Slots Management Workspace */}
        {activeTab === 'slots' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Active Calendar Slots</h3>
            
            {slots.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No time slots defined"
                description="Create your first slot using the calendar planner above to start accepting bookings."
                action={{
                  label: 'Add New Slot',
                  onClick: () => setShowAddSlot(true),
                }}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="rounded-xl border border-white/5 bg-white/[0.01] p-5 flex items-center justify-between hover:border-white/10 transition-all glass"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">
                        {formatDateStr(slot.startTime)}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatTimeStr(slot.startTime)} – {formatTimeStr(slot.endTime)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status indicator */}
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          slot.status === 'booked'
                            ? 'bg-destructive/10 text-destructive border border-destructive/25'
                            : 'bg-primary/10 text-primary border border-primary/25'
                        }`}
                      >
                        {slot.status}
                      </span>

                      {/* Cancel / Delete action */}
                      {slot.status === 'open' && (
                        <button
                          disabled={deletingSlotId === slot.id}
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-xs font-semibold text-slate-500 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/25 px-2.5 py-1 rounded transition-all disabled:opacity-50"
                        >
                          {deletingSlotId === slot.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Bookings Registry Workspace */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Search filter bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white">Confirmed Appointments</h3>
              <input
                type="text"
                placeholder="Search by customer name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:max-w-xs rounded-lg px-3 py-2 text-xs text-white placeholder-muted-foreground glass-input focus:outline-none"
              />
            </div>

            {bookedSlots.length === 0 ? (
              <EmptyState
                icon="🎫"
                title="No bookings recorded"
                description="Share your public booking calendar link with clients. Registered appointments will show up here."
              />
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-white/5 rounded-xl text-slate-500 text-sm">
                No matching bookings found for "{searchQuery}".
              </div>
            ) : (
              <div className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden glass shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 font-semibold">
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4">Contact Info</th>
                        <th className="px-6 py-4">Appointment Date & Time</th>
                        <th className="px-6 py-4">Security Deposit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredBookings.map((booking) => {
                        const parts = booking.customerContact ? booking.customerContact.split(', ') : [];
                        const email = parts[0] || '';
                        const phone = parts[1] || '';
                        return (
                          <tr key={booking.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-6 py-4 font-bold text-white">{booking.customerName}</td>
                            <td className="px-6 py-4 text-slate-300">
                              <p>{email}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{phone}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-white">{formatDateStr(booking.startTime)}</p>
                              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                {formatTimeStr(booking.startTime)} – {formatTimeStr(booking.endTime)}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              {booking.depositPaid ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                                  ✓ PAID $10
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded">
                                  PENDING
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
