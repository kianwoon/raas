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
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
