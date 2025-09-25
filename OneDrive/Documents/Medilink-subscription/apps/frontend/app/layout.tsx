import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import { SubscriptionProvider } from "@/context/SubscriptionContext";


export const metadata: Metadata = {
  title: "MediLink - Your Trusted Healthcare Platform",
  description: "Connect with verified medical professionals, manage appointments, and access your health records securely",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SubscriptionProvider>
            {children}
          </SubscriptionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
