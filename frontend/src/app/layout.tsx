import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navigation } from "@/components/layout/Navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Responsible AI Transparency & Education Platform",
  description: "Building trust through AI transparency. Making AI decisions auditable, explainable, and fair for everyone with Model Cards, Fairness Scorecards, and educational resources.",
  keywords: ["Responsible AI", "AI Transparency", "Fairness", "Model Cards", "AI Ethics", "AI Governance", "AI Education"],
  authors: [{ name: "Responsible AI Platform Team" }],
  openGraph: {
    title: "Responsible AI Transparency & Education Platform",
    description: "Building trust through AI transparency. Making AI decisions auditable, explainable, and fair for everyone.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Responsible AI Transparency & Education Platform",
    description: "Building trust through AI transparency. Making AI decisions auditable, explainable, and fair for everyone.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/favicon_io/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "manifest",
        url: "/favicon_io/site.webmanifest",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
