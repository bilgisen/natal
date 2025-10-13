import type { Metadata } from "next";
import { ThemeProvider } from "../components/provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Horozz - ",
  description:
    "A modern, full-stack Next.js starter kit with authentication, payments, and dashboard. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  openGraph: {
    title: "Horooz.com",
    description:
      "A modern, full-stack Next.js starter kit with authentication, payments, and dashboard. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
    url: "nextstarter.xyz",
    siteName: "Next.js Starter Kit",
    images: [
      {
        url: "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/nsk-w9fFwBBmLDLxrB896I4xqngTUEEovS.png",
        width: 1200,
        height: 630,
        alt: "Next.js Starter Kit",
      },
    ],
    locale: "en-US",
    type: "website",
  },
};

// This is a Server Component by default in Next.js 13+
// We don't need 'use client' here because we want this to be a Server Component
// Client components will be imported and used within this component

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
          </QueryProvider>
          <Toaster position="top-center" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
