import { createSlot, getSlotsByBusinessId } from '@/lib/db';
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
    const slots = await getSlotsByBusinessId(businessId);
    return NextResponse.json(slots);
  } catch (error) {
    console.error('API Error (GET slots):', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { businessId, date, startTime, endTime } = await request.json();

    if (!businessId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Combine date and time to create standard ISO strings
    const startISO = `${date}T${startTime}:00Z`;
    const endISO = `${date}T${endTime}:00Z`;

    const slot = await createSlot(businessId, startISO, endISO);
    return NextResponse.json(slot, { status: 201 });
  } catch (error: any) {
    console.error('API Error (POST slot):', error);
    
    // Handle unique constraint violations gracefully
    if (error.message && error.message.includes('Unique constraint violation')) {
      return NextResponse.json(
        { error: 'A time slot at this start time already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create slot' },
      { status: 500 }
    );
  }
}
