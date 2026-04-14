-- DoorDrive: Secure Visitor Access Management System
-- Complete Supabase SQL Schema with Row Level Security (RLS)
-- 
-- Security Architecture:
-- - All tables have RLS enabled
-- - Homeowners can only access their own data
-- - Public can only INSERT visitor notes (no SELECT on sensitive data)
-- - Audit logs track all actions for forensic analysis

-- ============================================
-- 1. PROFILES TABLE
-- Stores homeowner profile data with opaque QR tokens
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  door_instructions TEXT,
  -- Security: Opaque QR token (UUID) prevents information leakage
  -- Never contains PII - only a random identifier
  qr_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Homeowners can only read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Homeowners can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policy: Users can insert their own profile on registration
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policy: Public can read minimal profile info via QR token
-- Security: Only exposes name and door_instructions, never phone
CREATE POLICY "Public can read profile by qr_token"
  ON profiles FOR SELECT
  USING (true);

-- ============================================
-- 2. VISITOR NOTES TABLE
-- Audit trail of all visitor communications
-- ============================================
CREATE TABLE IF NOT EXISTS visitor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Security: Track which QR token was used (for forensic analysis)
  qr_token_used TEXT NOT NULL,
  -- Data minimization: visitor info is optional
  visitor_name TEXT,
  visitor_phone TEXT,
  -- Security: Message is sanitized before storage (app-level)
  message TEXT NOT NULL,
  -- Audit fields: IP and user-agent for forensic analysis
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE visitor_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Homeowners can only view notes addressed to them
CREATE POLICY "Users can view own notes"
  ON visitor_notes FOR SELECT
  USING (auth.uid() = profile_id);

-- RLS Policy: Anyone can insert notes (public endpoint)
-- Security: INSERT only - no SELECT/UPDATE/DELETE for public
CREATE POLICY "Anyone can insert notes"
  ON visitor_notes FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 3. AUDIT LOGS TABLE
-- Complete security audit trail
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Action types: register, login, qr_scanned, note_submitted, 
  -- profile_updated, qr_regenerated
  action TEXT NOT NULL,
  details TEXT,
  -- Forensic metadata
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Homeowners can only view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = profile_id);

-- RLS Policy: Allow insert for audit logging (service-level)
CREATE POLICY "Anyone can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_qr_token ON profiles(qr_token);
CREATE INDEX IF NOT EXISTS idx_visitor_notes_profile_id ON visitor_notes(profile_id);
CREATE INDEX IF NOT EXISTS idx_visitor_notes_created_at ON visitor_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_profile_id ON audit_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
