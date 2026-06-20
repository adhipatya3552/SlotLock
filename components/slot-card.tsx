'use client';

import { TimeSlot } from '@/lib/mock-data';

interface SlotCardProps {
  slot: TimeSlot;
  isSelected: boolean;
  onClick: (slot: TimeSlot) => void;
}

export function SlotCard({ slot, isSelected, onClick }: SlotCardProps) {
  return (
    <button
      onClick={() => onClick(slot)}
      className={`group relative w-full rounded-lg border-2 p-4 transition-all duration-300 ${
        isSelected
          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
          : 'border-border bg-card hover:border-primary/40 hover:shadow-md hover:shadow-primary/10'
      }`}
    >
      {/* Glow effect on selection */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* Content */}
      <div className="relative space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-foreground">{slot.date}</p>
          {isSelected && <span className="text-sm font-bold text-primary">✓ Selected</span>}
        </div>
        <p className="text-sm text-muted-foreground">
          {slot.startTime} – {slot.endTime}
        </p>
      </div>
    </button>
  );
}
