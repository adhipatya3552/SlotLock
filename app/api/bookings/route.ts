import { createBooking, getBookingsByBusinessId } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const businessId = request.nextUrl.searchParams.get('businessId');

  if (!businessId) {
    return NextResponse.json(
      { error: 'Missing businessId parameter' },
      { status: 400 }
    );
  }

  try {
    const bookings = await getBookingsByBusinessId(businessId);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('API Error (GET bookings):', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      slotId,
      businessId,
      customerName,
      customerEmail,
      customerPhone,
      depositPaid = false,
    } = await request.json();

    if (!slotId || !businessId || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const customerContact = `${customerEmail}, ${customerPhone}`;

    // Perform the booking ATOMICALLY in the database
    // This is the core "no double-booking" guarantee using DSQL/SQL atomic checks.
    const bookedSlot = await createBooking(
      slotId,
      businessId,
      customerName,
      customerContact,
      depositPaid
    );
    
    return NextResponse.json(bookedSlot, { status: 201 });
  } catch (error: any) {
    console.error('API Error (POST booking):', error);
    
    // Catch the already booked constraint violation or empty update row count
    if (error.message && (error.message.includes('already booked') || error.message.includes('does not exist'))) {
      return NextResponse.json(
        { error: 'This slot was just booked by someone else. Please pick another.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
