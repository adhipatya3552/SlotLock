import { createBusiness, getAllBusinesses } from '@/lib/mock-data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const businesses = getAllBusinesses();
  return NextResponse.json(businesses);
}

export async function POST(request: NextRequest) {
  try {
    const { name, ownerEmail, type } = await request.json();

    if (!name || !ownerEmail || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const business = createBusiness(name, ownerEmail, type);
    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    );
  }
}
