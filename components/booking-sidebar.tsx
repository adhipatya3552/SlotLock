'use client';

import { TimeSlot } from '@/lib/mock-data';

interface BookingSidebarProps {
  selectedSlot: TimeSlot | null;
  formData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}

export function BookingSidebar({
  selectedSlot,
  formData,
  onFormChange,
  onSubmit,
  isSubmitting,
}: BookingSidebarProps) {
  return (
    <div
      className={`rounded-xl border-2 bg-card p-6 h-fit transition-all duration-300 ${
        selectedSlot ? 'border-primary/50 shadow-lg shadow-primary/15' : 'border-border'
      }`}
    >
      <h2 className="mb-6 text-lg font-semibold text-foreground">Your Details</h2>

      {selectedSlot ? (
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Selected slot preview */}
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 p-4">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
              📅 Selected Time
            </p>
            <p className="font-semibold text-foreground text-base">{selectedSlot.date}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedSlot.startTime} – {selectedSlot.endTime}
            </p>
          </div>

          {/* Form fields */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="customerName"
              required
              placeholder="John Doe"
              value={formData.customerName}
              onChange={onFormChange}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="customerEmail"
              required
              placeholder="john@example.com"
              value={formData.customerEmail}
              onChange={onFormChange}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              name="customerPhone"
              required
              placeholder="+1 (555) 123-4567"
              value={formData.customerPhone}
              onChange={onFormChange}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/30 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isSubmitting ? 'Confirming Booking...' : 'Confirm Booking'}
          </button>
        </form>
      ) : (
        <div className="text-center py-8">
          <p className="text-2xl mb-2">⏰</p>
          <p className="text-muted-foreground text-sm">Select a time slot on the left to get started</p>
        </div>
      )}
    </div>
  );
}
