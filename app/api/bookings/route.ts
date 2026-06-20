import { createBooking, getBookingsByBusinessId } from '@/lib/mock-data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const businessId = request.nextUrl.searchParams.get('businessId');

  if (!businessId) {
    return NextResponse.json(
      { error: 'Missing businessId parameter' },
      { status: 400 }
    );
  }

  const bookings = getBookingsByBusinessId(businessId);
  return NextResponse.json(bookings);
}

export async function POST(request: NextRequest) {
  try {
    const {
      slotId,
      businessId,
      customerName,
      customerEmail,
      customerPhone,
    } = await request.json();

    if (!slotId || !businessId || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const booking = createBooking(
      slotId,
      businessId,
      customerName,
      customerEmail,
      customerPhone
    );
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
