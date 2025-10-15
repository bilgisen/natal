// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider } from "../components/provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import LoginOneTap from "@/components/LoginOneTap";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Zodapp.com",
    template: "Zodapp.com - %s",
  },
  description:
    "Create scientific birth charts for yourself and your loved ones. Ask Gemini anything you're curious about regarding your cosmic profile",
  openGraph: {
    title: "Zodapp.com",
    description:
      "Create scientific birth charts for yourself and your loved ones. Ask Gemini anything you're curious about regarding your cosmic profile",
    url: "https://zodapp.com",
    siteName: "Zodapp.com",
    images: [
      {
        url: "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/nsk-w9fFwBBmLDLxrB896I4xqngTUEEovS.png",
        width: 1200,
        height: 630,
        alt: "Horozz Preview",
      },
    ],
    locale: "en-US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </head>
      <body suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <LoginOneTap />
            {children}
          </QueryProvider>
          <Toaster position="top-right" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
