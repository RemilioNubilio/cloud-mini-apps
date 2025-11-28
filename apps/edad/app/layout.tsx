import "@/app/globals.css";

import type { Metadata } from "next";

import { ThemeProvider } from "@/components/contexts/theme-provider";
import { inter } from "@/lib/fonts";

import { siteConfig } from "../config/site";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "development"
        ? "http://localhost:4001"
        : siteConfig.url
  ),
  description: siteConfig.description,
  keywords: [
    "AI dad",
    "AI father",
    "virtual dad",
    "AI companion",
    "father figure",
    "AI mentor",
    "dad advice",
    "fatherly support",
    "AI family",
    "virtual father",
  ],
  authors: [
    {
      name: "eDad",
      url: siteConfig.url,
    },
  ],
  creator: "eDad",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: "eDad",
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
    creator: "@edad_ai",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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

