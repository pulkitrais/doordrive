# 🔒 DoorDrive — Secure QR-Code Visitor Access System

A production-ready, security-first web application for managing visitor access via QR codes. Homeowners create an account, receive a unique secure QR code for their door, and visitors can securely contact the homeowner or leave audited notes.

**Built as a cybersecurity portfolio project demonstrating secure web application development.**

## 🛡️ Cybersecurity Features Implemented

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| **Supabase Auth** | Email + strong password validation | Secure authentication with password hashing |
| **Row Level Security (RLS)** | Strict policies on all tables | Database-level access control — zero trust |
| **Opaque QR Tokens** | UUID-based tokens, no PII | Prevents information leakage from QR codes |
| **Input Sanitization** | Zod validation + HTML entity encoding | Prevents XSS and injection attacks |
| **Rate Limiting** | Server-side per-IP rate limits | Prevents brute force and spam attacks |
| **Audit Logging** | Full trail with IP, user-agent, timestamps | Forensic analysis and compliance |
| **Security Headers** | CSP, HSTS, X-Frame-Options, etc. | Protection against common web attacks |
| **Secure Sessions** | Supabase SSR cookie-based sessions | Prevents session hijacking |
| **Data Minimization** | Optional visitor fields only | Collects minimum necessary data |
| **QR Regeneration** | Token rotation capability | Invalidates compromised QR codes |

## 🏗️ Tech Stack

- **Framework**: Next.js 15 App Router + TypeScript
- **Styling**: Tailwind CSS + Custom UI Components
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Validation**: Zod v4 with strict schemas
- **Icons**: Lucide React
- **QR Generation**: qrcode library (PNG/DataURL)
- **Notifications**: Sonner toast library
- **Server Actions**: Next.js Server Actions (no API routes)

## 📊 Database Schema

### Tables

**profiles** — Homeowner profiles with opaque QR tokens
- `id` (UUID → auth.users.id)
- `name`, `phone`, `door_instructions`
- `qr_token` (unique random UUID — never contains PII)
- `created_at`

**visitor_notes** — Audit trail of visitor communications
- `id`, `profile_id`, `qr_token_used`
- `visitor_name`, `visitor_phone` (optional — data minimization)
- `message` (sanitized)
- `ip_address`, `user_agent` (forensic metadata)
- `created_at`

**audit_logs** — Complete security audit trail
- `id`, `profile_id`, `action`, `details`
- `ip_address`, `user_agent`
- `created_at`

### RLS Policies
- Homeowners: SELECT/UPDATE only their own data
- Public: INSERT only into visitor_notes and audit_logs
- No public SELECT on sensitive data (phone numbers, etc.)

## 🚀 Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/pulkitrais/doordrive.git
cd doordrive
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase Database
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key to `.env.local`

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page with security highlights |
| `/login` | Public | Secure login with rate limiting |
| `/register` | Public | Registration with strong password validation |
| `/dashboard` | Protected | Profile, QR code, notes, audit log |
| `/door/[token]` | Public | Visitor scan page (token validated server-side) |

## 🔐 Security Checklist

- [x] Supabase Auth with email + strong password
- [x] Row Level Security on all tables
- [x] Opaque QR tokens (UUID, no PII)
- [x] Input validation with Zod schemas
- [x] HTML entity encoding (XSS prevention)
- [x] Server-side rate limiting
- [x] Full audit logging (IP, user-agent, timestamps)
- [x] Security headers (HSTS, X-Frame-Options, CSP, etc.)
- [x] Secure cookie-based session management
- [x] QR code regeneration (token rotation)
- [x] Data minimization (optional visitor fields)
- [x] Server-side token validation
- [x] Protected routes via middleware

## 🌐 Deployment

### Vercel
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Supabase (Free Tier)
1. Create project at supabase.com
2. Run `supabase/schema.sql` in SQL Editor
3. Copy URL + anon key to Vercel env vars

## 📄 License

MIT
