import { v4 as uuidv4 } from 'uuid';

export interface TimeSlot {
  id: string;
  businessId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'open' | 'booked';
}

export interface Booking {
  id: string;
  slotId: string;
  businessId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  ownerEmail: string;
  type: 'salon' | 'tutor' | 'doctor';
  createdAt: string;
  publicLink: string;
}

// Mock database
let businesses: Business[] = [
  {
    id: 'biz-1',
    name: 'Bloom Hair Studio',
    ownerEmail: 'owner@bloombhair.com',
    type: 'salon',
    createdAt: new Date().toISOString(),
    publicLink: '/book/biz-1',
  },
];

let timeSlots: TimeSlot[] = [
  {
    id: 'slot-1',
    businessId: 'biz-1',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    startTime: '09:00',
    endTime: '10:00',
    status: 'open',
  },
  {
    id: 'slot-2',
    businessId: 'biz-1',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    status: 'booked',
  },
  {
    id: 'slot-3',
    businessId: 'biz-1',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:00',
    status: 'open',
  },
  {
    id: 'slot-4',
    businessId: 'biz-1',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
    startTime: '11:00',
    endTime: '12:00',
    status: 'open',
  },
];

let bookings: Booking[] = [
  {
    id: 'book-1',
    slotId: 'slot-2',
    businessId: 'biz-1',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@example.com',
    customerPhone: '+1-555-0101',
    createdAt: new Date().toISOString(),
  },
];

// API functions for businesses
export function getAllBusinesses(): Business[] {
  return businesses;
}

export function getBusinessById(id: string): Business | undefined {
  return businesses.find((b) => b.id === id);
}

export function createBusiness(
  name: string,
  ownerEmail: string,
  type: 'salon' | 'tutor' | 'doctor'
): Business {
  const id = 'biz-' + uuidv4().slice(0, 8);
  const business: Business = {
    id,
    name,
    ownerEmail,
    type,
    createdAt: new Date().toISOString(),
    publicLink: `/book/${id}`,
  };
  businesses.push(business);
  return business;
}

// API functions for time slots
export function getSlotsByBusinessId(businessId: string): TimeSlot[] {
  return timeSlots.filter((s) => s.businessId === businessId);
}

export function getSlotById(id: string): TimeSlot | undefined {
  return timeSlots.find((s) => s.id === id);
}

export function createSlot(
  businessId: string,
  date: string,
  startTime: string,
  endTime: string
): TimeSlot {
  const id = 'slot-' + uuidv4().slice(0, 8);
  const slot: TimeSlot = {
    id,
    businessId,
    date,
    startTime,
    endTime,
    status: 'open',
  };
  timeSlots.push(slot);
  return slot;
}

export function updateSlotStatus(
  slotId: string,
  status: 'open' | 'booked'
): TimeSlot | undefined {
  const slot = timeSlots.find((s) => s.id === slotId);
  if (slot) {
    slot.status = status;
  }
  return slot;
}

// API functions for bookings
export function getBookingsByBusinessId(businessId: string): Booking[] {
  return bookings.filter((b) => b.businessId === businessId);
}

export function getBookingBySlotId(slotId: string): Booking | undefined {
  return bookings.find((b) => b.slotId === slotId);
}

export function getBookingById(id: string): Booking | undefined {
  return bookings.find((b) => b.id === id);
}

export function createBooking(
  slotId: string,
  businessId: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string
): Booking {
  const id = 'book-' + uuidv4().slice(0, 8);
  const booking: Booking = {
    id,
    slotId,
    businessId,
    customerName,
    customerEmail,
    customerPhone,
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);

  // Mark slot as booked
  updateSlotStatus(slotId, 'booked');

  return booking;
}
