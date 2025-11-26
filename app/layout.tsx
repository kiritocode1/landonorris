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
  title: "BLANKO NORRIS — Cyberpunk Helmet Interface",
  description:
    "A cyberpunk-inspired helmet interface for BLANKO NORRIS, blending fluid 3D motion with a dark, minimalist overlay.",
  metadataBase: new URL("https://blanko-norris.local"),
  openGraph: {
    title: "BLANKO NORRIS — Cyberpunk Helmet Interface",
    description:
      "Digital helmet aura inspired by Lando Norris and reimagined as a darker, grittier cyberpunk UI.",
    url: "https://blanko-norris.local",
    type: "website",
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
      </body>
    </html>
  );
}
