import React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../polyfills";

export const metadata: Metadata = {
  title: "Digital Signage | รายงานคุณภาพอากาศ",
  description: "ระบบแสดงคุณภาพอากาศสำหรับ MWIT Digital Signage System",
  applicationName: "MWIT Digital Signage",
  authors: [{ name: "Student Committee" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Digital Signage"
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0ea5e9",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <head>
        {/* Preload critical assets and fallback font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="preload" href="/sky.webp" as="image" />
        <link rel="preload" href="/face/green.svg" as="image" />
        <link rel="preload" href="/face/yellow.svg" as="image" />
        <link rel="preload" href="/face/orange.svg" as="image" />
        <link rel="preload" href="/face/red.svg" as="image" />
        <link rel="preload" href="/face/purple.svg" as="image" />
      </head>
      <body
        className="antialiased text-black overflow-hidden"
        style={{ 
          backgroundImage: 'url(/sky.webp)', 
          backgroundSize: 'cover', 
          backgroundAttachment: 'fixed', 
          backgroundPosition: 'bottom', 
          backgroundRepeat: 'no-repeat',
          height: '100vh',
          width: '100vw',
        }}
      >
        {children}
      </body>
    </html>
  );
}