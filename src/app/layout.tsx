import type { Metadata } from "next";
import { Geist, Geist_Mono,IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai"],
  weight: ['400', '500', '600', '700'],
});
export const metadata: Metadata = {
  title: "Digital Signage",
  description: "For MWIT Digital Signage System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSansThai.className} antialiased text-black`}
        style={{ backgroundImage: 'url(/sky.webp)', backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'bottom', backgroundRepeat: 'no-repeat', }}
      >
        {children}
      </body>
    </html>
  );
}
