export interface Business {
  id: string;
  name: string;
  ownerEmail: string;
  type?: string;
  createdAt: string;
  publicLink?: string; // Derived field
}

export interface TimeSlot {
  id: string;
  businessId: string;
  startTime: string; // ISO format
  endTime: string;   // ISO format
  status: 'open' | 'booked' | 'cancelled';
  customerName?: string;
  customerContact?: string;
  depositPaid?: boolean;
  createdAt: string;
}
