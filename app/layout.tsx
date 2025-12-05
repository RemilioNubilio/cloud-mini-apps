import "@/app/globals.css";

import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";
import { inter } from "@/lib/fonts";

import { siteConfig } from "./config";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : siteConfig.url,
  ),
  description: siteConfig.description,
  keywords: [
    "AI girlfriend",
    "AI companion",
    "virtual girlfriend",
    "AI chat",
    "clone your crush",
    "AI dating",
    "virtual companion",
    "AI relationship",
    "chatbot girlfriend",
    "AI romance",
  ],
  authors: [
    {
      name: "CloneUrCrush",
      url: siteConfig.url,
    },
  ],
  creator: "CloneUrCrush",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: "CloneUrCrush",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@cloneurcrush",
  },
  icons: {
    icon: "/images/chat-ava.png",
    apple: "/images/chat-ava.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }} className="dark">
      <body className={`${inter.className} bg-background antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
