import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inepsteinfiles.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "InEpsteinFiles.com - Search Official Epstein Documents",
  description: "Search publicly released Epstein documents from official U.S. government sources",
  openGraph: {
    title: "InEpsteinFiles.com - Search Official Epstein Documents",
    description: "Search publicly released Epstein documents from official U.S. government sources",
    url: siteUrl,
    siteName: 'InEpsteinFiles.com',
    images: [
      {
        url: `${siteUrl}/api/og/index`,
        width: 1200,
        height: 628,
        alt: 'Search Epstein files by name. Neutral public records search.',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "InEpsteinFiles.com - Search Official Epstein Documents",
    description: "Search publicly released Epstein documents from official U.S. government sources",
    images: [`${siteUrl}/api/og/index`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${publicSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
