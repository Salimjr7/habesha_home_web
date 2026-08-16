# Habesha Home — Full-Stack Ethiopian Home Rental Marketplace 🇪🇹

**Habesha Home** is a production-grade full-stack web application designed specifically for the Ethiopian housing and vacation rental market. It combines the refined user experience of Airbnb and Booking.com with Ethiopian financial infrastructure (Chapa & telebirr) and infrastructure assurances (24/7 standby generators, continuous water reservoir tanks, and gated security).

---

## 🌟 Key Features

### For Renters & Travelers
- **Multi-City Discovery:** Search and filter verified homes across Addis Ababa (Bole, Kazanchis, Old Airport, CMC), Bishoftu crater lake villas, Hawassa waterfront retreats, and Bahir Dar.
- **Ethiopian Living Assurances:** Guaranteed 24/7 power backup, continuous water reservoir tanks, and high-speed fiber internet tags.
- **Local Payment Checkout:** Seamless payment in Ethiopian Birr (ETB) with **Chapa** (Cards, CBEBirr, Awash, Dashen) and **telebirr** direct mobile money.
- **Real-Time Booking & Instant Reservation:** Deterministic server-side pricing engine with length-of-stay discounts and 15% Ethiopian VAT breakdown.
- **Verified Reviews & Saved Homes:** Review system restricted to completed stays with aggregate 5-star scoring.

### For Hosts & Property Owners
- **Host Hub & Multi-Step Listing Wizard:** 4-step listing creator with room capacity, amenity checklists, and nightly/monthly pricing.
- **Auditable Financial Ledger & Wallet:** Track gross revenue, platform commissions, pending escrow, and request instant withdrawals directly to Ethiopian bank accounts or telebirr.
- **Reservation Management:** Accept or manage incoming bookings with guest details.
- **Direct Host-Renter Messaging:** Real-time chat interface.

### For Platform Administrators
- **Executive Analytics:** Real-time Gross Transaction Volume, 5% platform fee collection, active listings, and user management.
- **Withdrawal Auditing:** Review and approve host payout disbursements with automated wallet reconciliation.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15+ (App Router, Server Components by default, Server Actions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Habesha Home warm gold design tokens + Dark/Light mode
- **UI Components:** Shadcn/ui patterns, Lucide icons, Framer Motion
- **Database & ORM:** PostgreSQL (Neon Serverless) + Prisma ORM
- **Authentication:** Better Auth with email/password, session tokens, and extensible OAuth
- **Authorization:** CASL.js isomorphic RBAC (`GUEST`, `RENTER`, `OWNER`, `ADMIN`) with strict server-side enforcement
- **Validation:** Shared Zod schemas for all client and server boundaries
- **Payments:** Abstraction layer supporting **Chapa** and **telebirr** with sandbox simulator

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- A free [Neon PostgreSQL](https://neon.tech) database project

### 2. Installation
```bash
# Clone the repository and navigate into the directory
git clone https://github.com/your-org/habesha-home.git
cd habesha-home

# Install dependencies
npm install --legacy-peer-deps
```

### 3. Database Configuration
Create a `.env` file in the root directory (based on `.env.example`):
```env
DATABASE_URL="postgresql://neondb_owner:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:password@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"

BETTER_AUTH_SECRET="your-32-char-random-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

CHAPA_SECRET_KEY="CHASECK_TEST-your-chapa-secret"
TELEBIRR_APP_ID="your-telebirr-app-id"
```

### 4. Push Schema & Seed Database
```bash
# Push the schema to your Neon PostgreSQL instance
npx prisma db push

# Generate the Prisma Client
npx prisma generate

# Seed with realistic Ethiopian listings, cities, hosts, and reviews
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to experience Habesha Home.

---

## ⚡ Demo User Accounts

| Role | Email | Password | Features |
|---|---|---|---|
| **Renter** | `renter@habeshahome.et` | `Password123!` | Search, book, pay with Chapa/telebirr, review |
| **Host / Owner** | `dawit@habeshahome.et` | `Password123!` | Manage Bole/Bishoftu villas, Host Hub, Wallet, Withdrawals |
| **Admin** | `admin@habeshahome.et` | `Password123!` | Executive dashboard, payout audits, user moderation |

---

## 🔒 Security & Architecture Principles

1. **Deterministic Pricing Engine:** Client calculations are strictly for UI preview. Server recalculates and locks final booking charges.
2. **Race-Condition-Proof Concurrency:** Atomic database transactions prevent double bookings for overlapping dates.
3. **Auditable Financial Ledger:** Host balances cannot be edited arbitrarily; every credit or debit is backed by an immutable ledger transaction.
4. **Isomorphic CASL Authorization:** RBAC rules defined in one central place and checked at every Server Action and API boundary.
