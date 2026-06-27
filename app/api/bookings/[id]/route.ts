import { getBookingById } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Deconstruct customer contact
    const contactParts = booking.customerContact ? booking.customerContact.split(', ') : [];
    const customerEmail = contactParts[0] || '';
    const customerPhone = contactParts[1] || '';

    // Transform unified schema record into the expected client-side shape
    const response = {
      id: booking.id,
      slotId: booking.id,
      businessId: booking.businessId,
      customerName: booking.customerName,
      customerEmail,
      customerPhone,
      depositPaid: booking.depositPaid,
      createdAt: booking.createdAt,
      slot: {
        id: booking.id,
        businessId: booking.businessId,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        createdAt: booking.createdAt
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error (GET booking by ID):', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}
