'use client';

import { useEffect, useState } from 'react';

interface DemoSlot {
  id: number;
  time: string;
  booked: boolean;
  animating: boolean;
}

export function BookingDemo() {
  const [slots, setSlots] = useState<DemoSlot[]>([
    { id: 1, time: '2:00 PM', booked: false, animating: false },
    { id: 2, time: '2:30 PM', booked: false, animating: false },
    { id: 3, time: '3:00 PM', booked: false, animating: false },
    { id: 4, time: '3:30 PM', booked: false, animating: false },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlots((prevSlots) => {
        // Randomly pick a slot to animate
        const randomIndex = Math.floor(Math.random() * prevSlots.length);
        const newSlots = prevSlots.map((slot, idx) => {
          if (idx === randomIndex && !slot.booked) {
            return { ...slot, animating: true };
          }
          return slot;
        });

        // After animation, mark as booked
        setTimeout(() => {
          setSlots((s) =>
            s.map((slot, idx) => {
              if (idx === randomIndex) {
                return { ...slot, booked: true, animating: false };
              }
              return slot;
            })
          );
        }, 800);

        // Reset all slots after a delay
        setTimeout(() => {
          setSlots((s) =>
            s.map((slot) => ({
              ...slot,
              booked: false,
              animating: false,
            }))
          );
        }, 3500);

        return newSlots;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card/50 backdrop-blur p-6 shadow-lg">
      <h3 className="text-sm font-semibold text-foreground mb-4">Live Demo: Slot Booking</h3>
      <div className="space-y-2">
        {slots.map((slot) => (
          <div key={slot.id} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{slot.time}</span>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-500 ${
                slot.booked
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary text-muted-foreground'
              } ${
                slot.animating
                  ? 'scale-110 shadow-lg shadow-primary/50'
                  : ''
              }`}
            >
              {slot.booked ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block">✓</span> Booked
                </span>
              ) : (
                'Open'
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Each slot books instantly. No conflicts.
      </p>
    </div>
  );
}
