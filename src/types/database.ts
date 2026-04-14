export interface Profile {
  id: string;
  name: string;
  phone: string;
  door_instructions: string | null;
  qr_token: string;
  created_at: string;
}

export interface VisitorNote {
  id: string;
  profile_id: string;
  qr_token_used: string;
  visitor_name: string | null;
  visitor_phone: string | null;
  message: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  profile_id: string;
  action: string;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
