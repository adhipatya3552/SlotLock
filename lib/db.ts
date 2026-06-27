import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Pool, PoolConfig } from 'pg';
import { Business, TimeSlot } from './types';

import { AuroraDSQLPool } from '@aws/aurora-dsql-node-postgres-connector';

// Detect if we should use the Postgres DB or Local File Fallback
const usePostgres = !!(process.env.PGHOST || process.env.DSQL_HOST || process.env.DATABASE_URL);

let pool: Pool | null = null;

if (usePostgres) {
  const host = process.env.PGHOST || process.env.DSQL_HOST;
  const isDSQL = host && host.includes('.dsql.');

  const sslConfig = { rejectUnauthorized: false }; // Relaxed validation for cloud/dev TLS config

  const config: PoolConfig = {
    host,
    port: parseInt(process.env.PGPORT || '5432'),
    user: process.env.PGUSER || 'admin',
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE || 'postgres',
    ssl: sslConfig,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };

  // If a full connection URI is provided, use that instead
  if (process.env.DATABASE_URL) {
    config.connectionString = process.env.DATABASE_URL;
  }

  if (isDSQL) {
    pool = new AuroraDSQLPool(config) as unknown as Pool;
  } else {
    pool = new Pool(config);
  }
}


// -------------------------------------------------------------
// LOCAL FILE DATABASE FALLBACK
// -------------------------------------------------------------
const DB_FILE_PATH = path.join(process.cwd(), '.db.json');

interface LocalDB {
  businesses: Business[];
  slots: TimeSlot[];
}

function readLocalDB(): LocalDB {
  if (!fs.existsSync(DB_FILE_PATH)) {
    // Seed default mock data matching original app state
    const defaultDB: LocalDB = {
      businesses: [
        {
          id: 'biz-1',
          name: 'Bloom Hair Studio',
          ownerEmail: 'owner@bloomhair.com',
          type: 'salon',
          createdAt: new Date().toISOString(),
        }
      ],
      slots: [
        {
          id: 'slot-1',
          businessId: 'biz-1',
          startTime: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T09:00:00Z', // Tomorrow 9:00
          endTime: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T10:00:00Z',
          status: 'open',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'slot-2',
          businessId: 'biz-1',
          startTime: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T10:00:00Z', // Tomorrow 10:00
          endTime: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T11:00:00Z',
          status: 'booked',
          customerName: 'Sarah Johnson',
          customerContact: 'sarah@example.com, +1-555-0101',
          depositPaid: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'slot-3',
          businessId: 'biz-1',
          startTime: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T14:00:00Z', // Tomorrow 14:00
          endTime: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T15:00:00Z',
          status: 'open',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'slot-4',
          businessId: 'biz-1',
          startTime: new Date(Date.now() + 172800000).toISOString().split('T')[0] + 'T11:00:00Z', // Day after tomorrow 11:00
          endTime: new Date(Date.now() + 172800000).toISOString().split('T')[0] + 'T12:00:00Z',
          status: 'open',
          createdAt: new Date().toISOString(),
        }
      ]
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultDB, null, 2), 'utf-8');
    return defaultDB;
  }
  try {
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local .db.json, resetting database.', error);
    return { businesses: [], slots: [] };
  }
}

function writeLocalDB(data: LocalDB) {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// -------------------------------------------------------------
// UNIFIED DATABASE QUERY API
// -------------------------------------------------------------

export async function getAllBusinesses(): Promise<Business[]> {
  if (usePostgres && pool) {
    const res = await pool.query('SELECT id, name, owner_email as "ownerEmail", type, created_at as "createdAt" FROM businesses ORDER BY created_at DESC');
    return res.rows.map(row => ({
      ...row,
      publicLink: `/book/${row.id}`
    }));
  } else {
    const db = readLocalDB();
    return db.businesses.map(b => ({
      ...b,
      publicLink: `/book/${b.id}`
    }));
  }
}

export async function getBusinessById(id: string): Promise<Business | undefined> {
  if (usePostgres && pool) {
    const res = await pool.query('SELECT id, name, owner_email as "ownerEmail", type, created_at as "createdAt" FROM businesses WHERE id = $1', [id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      ...row,
      publicLink: `/book/${row.id}`
    };
  } else {
    const db = readLocalDB();
    const biz = db.businesses.find(b => b.id === id);
    if (!biz) return undefined;
    return {
      ...biz,
      publicLink: `/book/${biz.id}`
    };
  }
}

export async function createBusiness(name: string, ownerEmail: string, type: string): Promise<Business> {
  if (usePostgres && pool) {
    const res = await pool.query(
      'INSERT INTO businesses (name, owner_email, type) VALUES ($1, $2, $3) RETURNING id, name, owner_email as "ownerEmail", type, created_at as "createdAt"',
      [name, ownerEmail, type]
    );
    const row = res.rows[0];
    return {
      ...row,
      publicLink: `/book/${row.id}`
    };
  } else {
    const db = readLocalDB();
    const id = 'biz-' + uuidv4().slice(0, 8);
    const newBiz: Business = {
      id,
      name,
      ownerEmail,
      type,
      createdAt: new Date().toISOString(),
    };
    db.businesses.push(newBiz);
    writeLocalDB(db);
    return {
      ...newBiz,
      publicLink: `/book/${newBiz.id}`
    };
  }
}

export async function getSlotsByBusinessId(businessId: string): Promise<TimeSlot[]> {
  if (usePostgres && pool) {
    const res = await pool.query(
      `SELECT id, business_id as "businessId", start_time as "startTime", end_time as "endTime", 
              status, customer_name as "customerName", customer_contact as "customerContact", 
              deposit_paid as "depositPaid", created_at as "createdAt"
       FROM slots WHERE business_id = $1 ORDER BY start_time ASC`,
      [businessId]
    );
    return res.rows;
  } else {
    const db = readLocalDB();
    return db.slots.filter(s => s.businessId === businessId).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
}

export async function getSlotById(id: string): Promise<TimeSlot | undefined> {
  if (usePostgres && pool) {
    const res = await pool.query(
      `SELECT id, business_id as "businessId", start_time as "startTime", end_time as "endTime", 
              status, customer_name as "customerName", customer_contact as "customerContact", 
              deposit_paid as "depositPaid", created_at as "createdAt"
       FROM slots WHERE id = $1`,
      [id]
    );
    if (res.rows.length === 0) return undefined;
    return res.rows[0];
  } else {
    const db = readLocalDB();
    return db.slots.find(s => s.id === id);
  }
}

export async function createSlot(businessId: string, startTime: string, endTime: string): Promise<TimeSlot> {
  if (usePostgres && pool) {
    const res = await pool.query(
      `INSERT INTO slots (business_id, start_time, end_time, status) 
       VALUES ($1, $2, $3, 'open') 
       RETURNING id, business_id as "businessId", start_time as "startTime", end_time as "endTime", 
                 status, customer_name as "customerName", customer_contact as "customerContact", 
                 deposit_paid as "depositPaid", created_at as "createdAt"`,
      [businessId, startTime, endTime]
    );
    return res.rows[0];
  } else {
    const db = readLocalDB();
    const id = 'slot-' + uuidv4().slice(0, 8);
    const newSlot: TimeSlot = {
      id,
      businessId,
      startTime,
      endTime,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    
    // Simulate unique constraint: ensure business doesn't already have a slot at the exact same startTime
    const duplicate = db.slots.find(s => s.businessId === businessId && s.startTime === startTime);
    if (duplicate) {
      throw new Error(`Unique constraint violation: Slot already exists for business ${businessId} at ${startTime}`);
    }

    db.slots.push(newSlot);
    writeLocalDB(db);
    return newSlot;
  }
}

export async function createBooking(
  slotId: string,
  businessId: string,
  customerName: string,
  customerContact: string,
  depositPaid: boolean = false
): Promise<TimeSlot> {
  if (usePostgres && pool) {
    // ATOMIC WRITE IN SQL
    // This is the core pitch of SlotLock: standard PostgreSQL / DSQL serializable UPDATE
    const res = await pool.query(
      `UPDATE slots 
       SET status = 'booked', customer_name = $1, customer_contact = $2, deposit_paid = $3 
       WHERE id = $4 AND status = 'open'
       RETURNING id, business_id as "businessId", start_time as "startTime", end_time as "endTime", 
                 status, customer_name as "customerName", customer_contact as "customerContact", 
                 deposit_paid as "depositPaid", created_at as "createdAt"`,
      [customerName, customerContact, depositPaid, slotId]
    );
    
    if (res.rows.length === 0) {
      throw new Error('Slot was already booked or does not exist');
    }
    
    return res.rows[0];
  } else {
    // ATOMIC WRITE IN FILE SYSTEM (using file locking simulated via memory read-update-write)
    const db = readLocalDB();
    const slotIndex = db.slots.findIndex(s => s.id === slotId);
    
    if (slotIndex === -1) {
      throw new Error('Slot does not exist');
    }
    
    const slot = db.slots[slotIndex];
    if (slot.status !== 'open') {
      throw new Error('Slot was already booked or does not exist');
    }

    // Simulate multi-region DSQL unique index checks
    const activeBookingAtSameTime = db.slots.find(s => 
      s.businessId === businessId && 
      s.startTime === slot.startTime && 
      s.status === 'booked' && 
      s.id !== slotId
    );

    if (activeBookingAtSameTime) {
      throw new Error('Duplicate booking unique constraint violation');
    }

    slot.status = 'booked';
    slot.customerName = customerName;
    slot.customerContact = customerContact;
    slot.depositPaid = depositPaid;
    
    db.slots[slotIndex] = slot;
    writeLocalDB(db);
    return slot;
  }
}

export async function deleteSlot(slotId: string): Promise<boolean> {
  if (usePostgres && pool) {
    const res = await pool.query("DELETE FROM slots WHERE id = $1 AND status = 'open'", [slotId]);
    return (res.rowCount ?? 0) > 0;
  } else {
    const db = readLocalDB();
    const slotIndex = db.slots.findIndex(s => s.id === slotId);
    if (slotIndex === -1) return false;
    
    const slot = db.slots[slotIndex];
    if (slot.status !== 'open') return false; // Can only delete open slots

    db.slots.splice(slotIndex, 1);
    writeLocalDB(db);
    return true;
  }
}

export async function getBookingById(bookingId: string): Promise<TimeSlot | undefined> {
  // Since bookings are consolidated in the slots table, bookingId is the slot ID of a booked slot
  if (usePostgres && pool) {
    const res = await pool.query(
      `SELECT id, business_id as "businessId", start_time as "startTime", end_time as "endTime", 
              status, customer_name as "customerName", customer_contact as "customerContact", 
              deposit_paid as "depositPaid", created_at as "createdAt"
       FROM slots WHERE id = $1 AND status = 'booked'`,
      [bookingId]
    );
    if (res.rows.length === 0) return undefined;
    return res.rows[0];
  } else {
    const db = readLocalDB();
    const slot = db.slots.find(s => s.id === bookingId && s.status === 'booked');
    return slot;
  }
}

export async function getBookingsByBusinessId(businessId: string): Promise<TimeSlot[]> {
  if (usePostgres && pool) {
    const res = await pool.query(
      `SELECT id, business_id as "businessId", start_time as "startTime", end_time as "endTime", 
              status, customer_name as "customerName", customer_contact as "customerContact", 
              deposit_paid as "depositPaid", created_at as "createdAt"
       FROM slots WHERE business_id = $1 AND status = 'booked' ORDER BY start_time DESC`,
      [businessId]
    );
    return res.rows;
  } else {
    const db = readLocalDB();
    return db.slots
      .filter(s => s.businessId === businessId && s.status === 'booked')
      .sort((a, b) => b.startTime.localeCompare(a.startTime));
  }
}
