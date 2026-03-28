import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalWidgets from "../components/GlobalWidgets";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClickApplyAI | The Ultimate AI Job Auto-Apply Platform",
  description: "Upload your resume once, and let ClickApplyAI automatically find and apply to matching jobs for you. The smartest automated job search engine.",
  keywords: "ClickApplyAI, click apply ai, automated job application, AI job auto apply, auto job application bot, AI resume matcher, apply to jobs automatically, find jobs AI",
  openGraph: {
    title: "ClickApplyAI",
    description: "Land your dream job on autopilot with ClickApplyAI.",
    url: "https://clickapplyai.com",
    siteName: "ClickApplyAI",
    images: [{ url: "/logo.png", width: 800, height: 600, alt: "ClickApplyAI Logo" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClickApplyAI | AI Auto-Apply Bot",
    description: "Upload your resume and let ClickApplyAI do the rest.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://clickapplyai.com",
    languages: { "en-US": "/en-US" },
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
        {children}
        <GlobalWidgets />
      </body>
    </html>
  );
}
