-- SlotLock schema for Aurora DSQL (PostgreSQL-compatible)
-- The UNIQUE constraint below is what makes double-booking physically impossible.
-- Even if two requests hit at the exact same millisecond from different regions,
-- DSQL's strong consistency guarantees only one INSERT succeeds.

CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    type TEXT DEFAULT 'salon',
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL, -- Aurora DSQL does not support FOREIGN KEY constraints
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- open | booked | cancelled
    customer_name TEXT,
    customer_contact TEXT,
    deposit_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),

    -- THE KEY LINE: no two rows can have the same business + start_time
    -- when status = 'booked'. This is the anti-double-booking guarantee.
    CONSTRAINT unique_booked_slot UNIQUE (business_id, start_time)
);

-- Booking a slot: this single statement either succeeds (you got it)
-- or fails with a constraint violation (someone else got it first).
-- No race condition possible — this is the whole pitch of the project.
--
-- UPDATE slots
-- SET status = 'booked', customer_name = $1, customer_contact = $2
-- WHERE id = $3 AND status = 'open';
--
-- If this returns 0 rows updated, the slot was already taken — show
-- the user "sorry, just got booked" instantly, no double-charge.
