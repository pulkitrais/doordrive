"use client";

import { useState } from "react";
import {
  Shield,
  MessageSquare,
  Send,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Lock,
  Info,
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
import { submitVisitorNote } from "@/lib/actions";
import { Toaster, toast } from "sonner";

interface DoorPageClientProps {
  profileName: string;
  doorInstructions: string | null;
  qrToken: string;
}

export function DoorPageClient({
  profileName,
  doorInstructions,
  qrToken,
}: DoorPageClientProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.append("qr_token", qrToken);
    try {
      const result = await submitVisitorNote(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        setSubmitted(true);
        toast.success("Note sent successfully!");
      }
    } catch {
      toast.error("Failed to send note. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-8">
      <Toaster position="top-center" richColors />

      <div className="max-w-md mx-auto space-y-6">
        {/* Security Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold">DoorDrive</span>
          </div>
          <div className="flex justify-center">
            <Badge variant="success" className="gap-1">
              <Lock className="h-3 w-3" />
              Secure Connection
            </Badge>
          </div>
        </div>

        {/* Homeowner Info */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {profileName}&apos;s Door
            </CardTitle>
            <CardDescription>
              You&apos;re visiting this residence via secure QR access
            </CardDescription>
          </CardHeader>
          {doorInstructions && (
            <CardContent>
              <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-blue-800 dark:text-blue-200">
                  {doorInstructions}
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Note Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              Leave a Note
            </CardTitle>
            <CardDescription>
              Your message will be securely delivered to the homeowner
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Note Sent!</h3>
                <p className="text-sm text-zinc-500 mb-4">
                  Your message has been securely delivered to {profileName}.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Note
                </Button>
              </div>
            ) : (
              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visitor_name">Your Name (optional)</Label>
                  <Input
                    id="visitor_name"
                    name="visitor_name"
                    placeholder="John"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visitor_phone">
                    Your Phone (optional)
                  </Label>
                  <Input
                    id="visitor_phone"
                    name="visitor_phone"
                    type="tel"
                    placeholder="+1234567890"
                    maxLength={15}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="e.g., Package delivered at front door"
                    required
                    maxLength={500}
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {loading ? "Sending..." : "Send Note"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-lg text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-amber-800 dark:text-amber-200">
            <p className="font-medium">Security Notice</p>
            <p className="mt-1 text-xs">
              This page is verified by DoorDrive. All submissions are logged
              and audited. Never share sensitive information through this form.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-400">
          <p className="flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            Secured by DoorDrive
          </p>
        </div>
      </div>
    </div>
  );
}
