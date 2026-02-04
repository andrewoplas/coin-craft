import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "CoinCraft - Your Personal Finance Companion",
    template: "%s | CoinCraft",
  },
  description:
    "Track expenses, manage budgets, and achieve financial goals with CoinCraft. Choose your financial character and customize your experience.",
  keywords: [
    "expense tracker",
    "budget app",
    "personal finance",
    "money management",
    "envelope budgeting",
    "savings goals",
  ],
  authors: [{ name: "CoinCraft Team" }],
  creator: "CoinCraft",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://coincraft.app"),
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "/",
    siteName: "CoinCraft",
    title: "CoinCraft - Your Personal Finance Companion",
    description:
      "Track expenses, manage budgets, and achieve financial goals with CoinCraft. Choose your financial character and customize your experience.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CoinCraft - Personal Finance Made Fun",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CoinCraft - Your Personal Finance Companion",
    description:
      "Track expenses, manage budgets, and achieve financial goals with CoinCraft.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
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
      </body>
    </html>
  );
}
