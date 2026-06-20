import { createSlot, getSlotsByBusinessId } from '@/lib/mock-data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const businessId = request.nextUrl.searchParams.get('businessId');

  if (!businessId) {
    return NextResponse.json(
      { error: 'Missing businessId parameter' },
      { status: 400 }
    );
  }

  const slots = getSlotsByBusinessId(businessId);
  return NextResponse.json(slots);
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

    const slot = createSlot(businessId, date, startTime, endTime);
    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create slot' },
      { status: 500 }
    );
  }
}
