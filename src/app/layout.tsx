import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DoorDrive — Secure QR Visitor Access",
  description:
    "Secure QR-code based visitor door access & communication system. Create a unique QR code for your door and let visitors contact you securely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
