import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile, VisitorNote, AuditLog } from "@/types/database";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch visitor notes (ordered by newest first)
  const { data: notes } = await supabase
    .from("visitor_notes")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch audit logs (ordered by newest first)
  const { data: auditLogs } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">
          Profile not found. Please contact support.
        </p>
      </div>
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <DashboardClient
      profile={profile as Profile}
      notes={(notes as VisitorNote[]) || []}
      auditLogs={(auditLogs as AuditLog[]) || []}
      appUrl={appUrl}
    />
  );
}
