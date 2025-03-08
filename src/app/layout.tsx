import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

// Optimize font loading with display:swap for better perceived performance
const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai"],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-ibm-plex-sans-thai',
  preload: true,
});

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
    <html lang="th" className={ibmPlexSansThai.className}>
      <head>
        {/* Preload critical assets */}
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