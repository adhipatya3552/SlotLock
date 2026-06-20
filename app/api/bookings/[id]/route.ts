import { getBookingById, getSlotById } from '@/lib/mock-data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const booking = getBookingById(id);

  if (!booking) {
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    );
  }

  // Enrich with slot data
  const slot = getSlotById(booking.slotId);
  return NextResponse.json({ ...booking, slot });
}
