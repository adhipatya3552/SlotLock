import { createBusiness, getAllBusinesses } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const businesses = await getAllBusinesses();
    return NextResponse.json(businesses);
  } catch (error) {
    console.error('API Error (GET businesses):', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
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

    const business = await createBusiness(name, ownerEmail, type);
    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    console.error('API Error (POST business):', error);
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    );
  }
}
