import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { Manrope, Noto_Serif } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  display: "swap",
});

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
      <html lang="en" className={`${manrope.variable} ${notoSerif.variable}`}>
        <body>
          <ServiceWorkerRegistration />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
