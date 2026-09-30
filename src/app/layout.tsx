import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evolution Idle — A Cosmic Incremental",
  description: "A narrative-driven incremental game about a god awakening. Guide civilization from single-cell organisms to galactic transcendence across 7 stages and 10 divine layers.",
  keywords: ["idle game", "incremental game", "evolution", "cosmic", "prestige", "cell", "civilization"],
  authors: [{ name: "Evolution Idle" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Evolution Idle",
    description: "A narrative-driven incremental game about a god awakening.",
    url: "https://chat.z.ai",
    siteName: "Evolution Idle",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
