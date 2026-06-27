import { deleteSlot } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;
    
    if (!slotId) {
      return NextResponse.json(
        { error: 'Missing slotId' },
        { status: 400 }
      );
    }

    const success = await deleteSlot(slotId);

    if (!success) {
      return NextResponse.json(
        { error: 'Slot not found or is already booked' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('API Error (DELETE slot):', error);
    return NextResponse.json(
      { error: 'Failed to delete slot' },
      { status: 500 }
    );
  }
}
