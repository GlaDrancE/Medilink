import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "MediLink - Your Trusted Healthcare Platform",
  description: "Connect with verified medical professionals, manage appointments, and access your health records securely",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing!');
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en">
        <body>
          <ServiceWorkerRegistration />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
