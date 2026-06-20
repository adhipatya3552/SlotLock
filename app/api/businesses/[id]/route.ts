import { getBusinessById } from '@/lib/mock-data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const business = getBusinessById(id);

  if (!business) {
    return NextResponse.json(
      { error: 'Business not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(business);
}
