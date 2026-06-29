# SlotLock — Resilient Appointment Booking Engine

<div align="center">

![SlotLock Logo](https://img.shields.io/badge/SlotLock-Resilient%20Booking-indigo?style=for-the-badge&logo=clockify&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)
![AWS DSQL](https://img.shields.io/badge/AWS%20DSQL-Aurora-orange?style=for-the-badge&logo=amazonwebservices)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?style=for-the-badge&logo=postgresql)

**An appointment booking system that makes double-booking physically impossible, backed by Amazon Aurora DSQL's active-active global strong consistency guarantees.**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Tool (CLI)](#-database-tool-cli)
- [How It Works](#-how-it-works)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)

---

## 📅 Overview

**SlotLock** is a ultra-resilient scheduling and booking platform built to handle high-concurrency booking demands. Traditional booking platforms suffer from database race conditions, where two concurrent users book the exact same slot at the same millisecond. 

SlotLock solves this at the database hardware layer. By utilising **Amazon Aurora DSQL** (a serverless, distributed PostgreSQL-compatible database) combined with a database-level `UNIQUE` constraint, SlotLock guarantees that only a single transaction succeeds under concurrent multi-region bookings.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔒 **Atomic Anti-Double-Booking** | Enforces a `UNIQUE (business_id, start_time)` constraint at the database layer to physically prevent race conditions. |
| 🌐 **AWS DSQL Multi-Region Scaling** | Integrates Amazon Aurora DSQL for active-active replication and strong consistency across multiple AWS regions. |
| 🔐 **Programmatic IAM Auth Refresher** | Implements the official `@aws/aurora-dsql-node-postgres-connector` to automatically sign and refresh connection tokens in the background. |
| 📴 **Zero-Config Offline Fallback** | Automatically falls back to a local JSON file database (`.db.json`) if AWS credentials are not present, enabling instant offline development. |
| 🛠️ **Idempotent CLI Database Tool** | Custom management tool (`scripts/db-tool.js`) to apply schema configurations statement-by-statement and run custom queries. |
| 📊 **Owner Dashboard** | Interactive dashboard showing open, booked, and cancelled slots, along with earnings and booking analytics. |
| 🔗 **Personalized Customer Booking Link** | Generates direct links (`/book/[businessId]`) for clients to view, select, and book slots in a polished, responsive calendar. |
| 💅 **Modern Glassmorphic Dark UI** | Sleek dark-mode visual interface with micro-interactions and smooth transitions, built using Tailwind CSS. |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                              │
│                                                                      │
│  ┌──────────────────────┐        ┌────────────────────────────────┐  │
│  │   Customer Booking   │◀──────▶│      Business Dashboard        │  │
│  │   /book/[businessId] │        │     /dashboard/[businessId]    │  │
│  └──────────────────────┘        └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
           │                                      │
           ▼ (HTTP REST / JSON)                   ▼ (HTTP REST / JSON)
┌─────────────────────────────────────────────────────────────────────┐
│                       NEXT.JS / VERCEL SERVER                       │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     Next.js API Routes                        │  │
│  │  /api/businesses  |  /api/slots  |  /api/bookings             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                  │                                   │
│                                  ▼                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      Unified DB Driver                        │  │
│  │         lib/db.ts (checks process.env configuration)          │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
           │                                      │
           ├─(Fallback if no env)                 ├─(Connected)
           ▼                                      ▼
┌─────────────────────────┐            ┌──────────────────────────────┐
│  Local File Database    │            │     AWS IAM Authenticator    │
│  .db.json (offline dev) │            │ (Validates credentials & signs)│
└─────────────────────────┘            └──────────────────────────────┘
                                                  │
                                                  ▼ (PostgreSQL TLS v17)
                                       ┌──────────────────────────────┐
                                       │     Amazon Aurora DSQL       │
                                       │    [Strongly Consistent]     │
                                       │  Enforces UNIQUE Constraint  │
                                       └──────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) + TypeScript | React web application |
| **Styling** | Tailwind CSS + Custom CSS Variables | Sleek dark theme with cybernetic glassmorphism |
| **Database** | Amazon Aurora DSQL (Cloud) | PostgreSQL v17 serverless multi-region cluster |
| **Local Database** | Flat JSON file (`.db.json`) | Zero-config offline development fallback |
| **DB Client & Connector** | `pg` + `@aws/aurora-dsql-node-postgres-connector` | Dynamic database connection pooling and IAM token signing |
| **Deployment** | Vercel | Seamless edge deployment and environment hosting |

---

## 📁 Project Structure

```
SlotLock/
├── app/
│   ├── api/
│   │   ├── bookings/          # API for client bookings
│   │   ├── businesses/        # API for creating and listing businesses
│   │   └── slots/             # API for managing time slots
│   ├── book/[businessId]/     # Customer booking calendar
│   ├── confirmation/[bookingId]/ # Success confirmation screen
│   ├── dashboard/[businessId]/# Owner schedule management dashboard
│   ├── signup/                # Business owner registration
│   ├── globals.css            # Dark mode UI styles and custom animations
│   ├── layout.tsx             # Root layout with SEO and fonts
│   └── page.tsx               # Main landing page
├── components/                # Reusable UI (Feature cards, Header, Stat cards)
├── lib/
│   ├── db.ts                  # Unified database client (AWS DSQL / local fallback)
│   ├── types.ts               # Core TypeScript interfaces
│   └── utils.ts               # Tailwind CSS class merger utility
├── public/                    # Logos, SVG assets, and static files
├── scripts/
│   └── db-tool.js             # CLI utility for schema migrations & custom queries
├── slotlock_schema.sql        # Idempotent PostgreSQL database schema
├── .env.local                 # Local environment configurations (ignored by git)
├── package.json               # Dependency manifest
└── pnpm-lock.yaml             # Lockfile for package resolving
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** v18+
* **pnpm** v10+ (or **npm** / **yarn**)

### 1. Clone & Install
```bash
git clone git@github.com:adhipatya3552/SlotLock.git
cd SlotLock
pnpm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in your root directory.

#### For Local Offline Development (Default Fallback)
Simply leave `.env.local` empty. The app will automatically run on the offline fallback database [`.db.json`](./.db.json):
```bash
pnpm run dev
```

#### For Connecting to AWS Aurora DSQL
Fill out your `.env.local` with your AWS credentials:
```env
PGHOST=jbt4estecl27vvbszta7h6c7ou.dsql.us-east-1.on.aws
PGUSER=admin
PGDATABASE=postgres
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
```

### 3. Run the Development Server
```bash
pnpm run dev
```
Open **http://localhost:3000** with your browser.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PGHOST` / `DSQL_HOST` | Optional | The hostname of your Amazon Aurora DSQL cluster (e.g., `xxx.dsql.us-east-1.on.aws`). |
| `PGUSER` | Optional | The database user, defaults to `admin`. |
| `PGDATABASE` | Optional | The database name, defaults to `postgres`. |
| `AWS_ACCESS_KEY_ID` | Optional | Your AWS User Access Key ID. |
| `AWS_SECRET_ACCESS_KEY` | Optional | Your AWS User Secret Access Key. |
| `AWS_REGION` | Optional | The AWS region where your DSQL cluster is running (e.g., `us-east-1`). |

---

## 🛠️ Database Tool (CLI)

Because Amazon Aurora DSQL is a distributed serverless database, it does not support multiple DDL statements inside a single transaction. To accommodate this, the codebase includes a custom database management CLI [db-tool.js](file:///d:/Builds/new/SlotLock-updated/scripts/db-tool.js).

This tool loads your `.env.local` variables, automatically signs requests via `AuroraDSQLPool`, and executes commands.

* **Apply/Migrate Schema**: Runs the database DDL schema statement-by-statement.
  ```bash
  node scripts/db-tool.js schema
  ```
* **Run Custom Query**: Executes SQL commands and prints the results in a formatted table.
  ```bash
  node scripts/db-tool.js query "SELECT * FROM businesses;"
  ```

---

## ⚙️ How It Works

### Step 1: Slot Creation
A business owner creates a time slot on their dashboard. The Next.js API executes an `INSERT` statement, saving the slot's default state as `open`.

### Step 2: Booking Check-and-Set
When a customer clicks to book a slot, the application executes a single, atomic SQL update:
```sql
UPDATE slots 
SET status = 'booked', customer_name = $1, customer_contact = $2 
WHERE id = $3 AND status = 'open';
```

### Step 3: Global ACID Enforcement
Because of the UNIQUE constraint on the database level:
```sql
CONSTRAINT unique_booked_slot UNIQUE (business_id, start_time)
```
If two requests try to book the same slot at the exact same millisecond:
1. One request succeeds and updates the slot status to `booked`.
2. The database instantly triggers a unique key violation for the second request, failing the transaction.
3. The app catches the exception and immediately notifies the second customer that the slot is taken, ensuring zero double-bookings.

---

## 🧪 Testing

To compile and verify that the application compiles and builds successfully, run:
```bash
pnpm run build
```

To test the application routing locally:
1. Run `pnpm run dev`.
2. Navigate to `/signup` to create a new business profile.
3. You will be redirected to the owner dashboard to add slots.
4. Open the customer booking page `/book/[businessId]` to test reservation locks.

---

## 🌐 Deployment

### Deploying to Vercel
1. Run `npx vercel` to link your workspace to Vercel.
2. In your Vercel Dashboard, go to **Settings** > **Environment Variables** and add:
   * `PGHOST`
   * `PGUSER`
   * `PGDATABASE`
   * `AWS_ACCESS_KEY_ID`
   * `AWS_SECRET_ACCESS_KEY`
   * `AWS_REGION`
3. Trigger a redeploy to build the live site. The API routes will immediately fetch and sign connections in production.

---

## 🗺️ Roadmap

- [x] Atomic slot locking transaction logic
- [x] AWS Aurora DSQL database clustering
- [x] Programmatic IAM SigV4 authentication connector
- [x] Zero-config local database fallback (`.db.json`)
- [x] Idempotent database schema design
- [x] Command Line database runner utility
- [x] Multi-region live deployment compatibility
- [x] Business owner signup and dashboard analytics
- [x] Customer booking selection UI
- [ ] Multi-user session authentication (JWT token based)
- [ ] Email/SMS notification trigger on successful booking
- [ ] Custom price settings and mock payment processor integrations
