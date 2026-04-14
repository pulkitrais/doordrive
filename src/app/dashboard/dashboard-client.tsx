"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  QrCode,
  MessageSquare,
  FileText,
  User,
  LogOut,
  RefreshCw,
  Download,
  Phone,
  Clock,
  Globe,
  Loader2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  logoutAction,
  updateProfileAction,
  regenerateQrAction,
} from "@/lib/actions";
import type { Profile, VisitorNote, AuditLog } from "@/types/database";
import { Toaster, toast } from "sonner";
import QRCode from "qrcode";

type TabType = "qr" | "notes" | "audit" | "profile";

interface DashboardClientProps {
  profile: Profile;
  notes: VisitorNote[];
  auditLogs: AuditLog[];
  appUrl: string;
}

export function DashboardClient({
  profile: initialProfile,
  notes,
  auditLogs,
  appUrl,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("qr");
  const [profile, setProfile] = useState(initialProfile);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [regenerating, setRegenerating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const doorUrl = `${appUrl}/door/${profile.qr_token}`;

  // Generate QR code as data URL
  async function generateQr() {
    try {
      const url = await QRCode.toDataURL(doorUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      });
      setQrDataUrl(url);
    } catch {
      toast.error("Failed to generate QR code");
    }
  }

  // Generate QR on first render
  if (!qrDataUrl) {
    generateQr();
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const result = await regenerateQrAction();
      if (result.error) {
        toast.error(result.error);
      } else if (result.token) {
        setProfile({ ...profile, qr_token: result.token });
        const newUrl = `${appUrl}/door/${result.token}`;
        const url = await QRCode.toDataURL(newUrl, {
          width: 400,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
          errorCorrectionLevel: "H",
        });
        setQrDataUrl(url);
        toast.success("QR code regenerated. Old QR code is now invalid.");
      }
    } catch {
      toast.error("Failed to regenerate QR code");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleProfileUpdate(formData: FormData) {
    setUpdating(true);
    try {
      const result = await updateProfileAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated successfully");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  }

  function downloadQr() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = "doordrive-qr.png";
    link.href = qrDataUrl;
    link.click();
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "qr", label: "QR Code", icon: <QrCode className="h-4 w-4" /> },
    {
      id: "notes",
      label: "Notes",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    { id: "audit", label: "Audit Log", icon: <FileText className="h-4 w-4" /> },
    { id: "profile", label: "Profile", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold">DoorDrive</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-500">
              <User className="h-4 w-4" />
              {profile.name}
            </div>
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 overflow-x-auto bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "notes" && notes.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {notes.length}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* QR Code Tab */}
        {activeTab === "qr" && (
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-emerald-600" />
                  Your Secure QR Code
                </CardTitle>
                <CardDescription>
                  Print this and place it on your door. Contains only an opaque
                  token — no personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                {qrDataUrl ? (
                  <div className="bg-white p-4 rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt="Your DoorDrive QR Code"
                      width={300}
                      height={300}
                    />
                  </div>
                ) : (
                  <div className="w-[300px] h-[300px] bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
                )}
                <p className="text-xs text-zinc-500 text-center break-all max-w-xs">
                  {doorUrl}
                </p>
                <div className="flex gap-3">
                  <Button onClick={downloadQr} variant="outline">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    onClick={handleRegenerate}
                    variant="destructive"
                    disabled={regenerating}
                  >
                    {regenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Regenerate
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Opaque Token</p>
                      <p className="text-zinc-500">
                        QR code contains only a random UUID token — never your
                        phone number or personal data.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <RefreshCw className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Regeneratable</p>
                      <p className="text-zinc-500">
                        Regenerate anytime to invalidate old QR codes if
                        compromised.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Audit Trail</p>
                      <p className="text-zinc-500">
                        Every scan and note is logged with timestamp and
                        metadata.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                      <p className="text-2xl font-bold">{notes.length}</p>
                      <p className="text-xs text-zinc-500">Visitor Notes</p>
                    </div>
                    <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                      <p className="text-2xl font-bold">{auditLogs.length}</p>
                      <p className="text-xs text-zinc-500">Audit Events</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Visitor Notes Tab */}
        {activeTab === "notes" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                Visitor Notes
              </CardTitle>
              <CardDescription>
                Notes left by visitors who scanned your QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No visitor notes yet.</p>
                  <p className="text-sm mt-1">
                    Notes will appear here when visitors scan your QR code.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {note.message}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-3 text-xs text-zinc-500">
                            {note.visitor_name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {note.visitor_name}
                              </span>
                            )}
                            {note.visitor_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {note.visitor_phone}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(note.created_at).toLocaleString()}
                            </span>
                            {note.ip_address && (
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {note.ip_address}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Audit Log Tab */}
        {activeTab === "audit" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Audit Log
              </CardTitle>
              <CardDescription>
                Complete security audit trail of all actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No audit events yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0"
                    >
                      <div className="mt-1">
                        <Badge
                          variant={
                            log.action === "note_submitted"
                              ? "success"
                              : log.action === "qr_scanned"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {log.action}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{log.details}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                          {log.ip_address && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {log.ip_address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your information. Changes are protected by Row Level Security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleProfileUpdate} className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={profile.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={profile.phone}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="door_instructions">
                    Door Instructions (optional)
                  </Label>
                  <Textarea
                    id="door_instructions"
                    name="door_instructions"
                    defaultValue={profile.door_instructions || ""}
                    placeholder="e.g., Apartment 3B, ring twice"
                    rows={3}
                  />
                </div>
                <Button type="submit" disabled={updating}>
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Settings className="h-4 w-4" />
                  )}
                  {updating ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
