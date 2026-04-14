import Link from "next/link";
import {
  Shield,
  QrCode,
  Bell,
  Lock,
  Eye,
  FileText,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold">DoorDrive</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Lock className="h-4 w-4" />
            Secure QR Door Access System
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Secure Visitor Access
            <br />
            <span className="text-emerald-600 dark:text-emerald-400">
              for Your Doorstep
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">
            Create a unique QR code for your door. Delivery agents, visitors,
            and service providers can securely contact you or leave audited
            notes — no sensitive data exposed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Create Your Secure QR
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 px-4 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Built with Security First
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Every feature is designed with cybersecurity best practices.
              Your privacy and safety are our top priorities.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                title: "Opaque QR Tokens",
                description:
                  "QR codes contain only random tokens — never your phone number, address, or any personal information.",
              },
              {
                icon: Shield,
                title: "Row Level Security",
                description:
                  "Database-level access control ensures users can only access their own data. Zero trust architecture.",
              },
              {
                icon: Eye,
                title: "Full Audit Logging",
                description:
                  "Every scan, note, and action is logged with timestamps, IP addresses, and user agents for complete traceability.",
              },
              {
                icon: Lock,
                title: "Input Sanitization",
                description:
                  "All visitor inputs are validated and sanitized to prevent XSS, SQL injection, and other common attacks.",
              },
              {
                icon: Bell,
                title: "Rate Limiting",
                description:
                  "Server-side rate limiting protects against brute force attacks and spam on all public endpoints.",
              },
              {
                icon: FileText,
                title: "Security Headers",
                description:
                  "CSP, HSTS, X-Frame-Options, and other security headers protect against common web vulnerabilities.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow"
              >
                <feature.icon className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Three simple steps to secure visitor communication
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Account",
                description:
                  "Register with a strong password. Your data is protected with Supabase Auth and encrypted in transit.",
              },
              {
                step: "2",
                title: "Get Your QR Code",
                description:
                  "Receive a unique, opaque QR code. Print it and place it on your door. It contains zero personal information.",
              },
              {
                step: "3",
                title: "Visitors Connect",
                description:
                  "Visitors scan the QR to securely call, text, or leave an audited note. You see everything in your dashboard.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-zinc-900 dark:bg-zinc-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Secure Your Doorstep?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Join DoorDrive and give your visitors a secure, professional way to
            reach you. Free to get started.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="h-5 w-5" />
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold">DoorDrive</span>
          </div>
          <p className="text-sm text-zinc-500">
            Secure QR-based visitor access management. Built with security-first principles.
          </p>
        </div>
      </footer>
    </div>
  );
}
