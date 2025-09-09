import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import ClientLayoutContent from "@/components/client-layout-content";
import { HeadLoader } from "@/components/head-loader";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'Faberland Shop - Official Faberland Merch | The Ultimate Metaverse Experience',
  description: 'Faberland - The Ultimate Metaverse Experience. Shop official Faberland merchandise including hoodies, t-shirts, and accessories. Premium merchandise that bridges the digital and physical worlds. Connect your digital identity with exclusive in-game items.',
  keywords: 'Faberland, metaverse, merchandise, hoodies, t-shirts, digital identity, Web3, blockchain, gaming, virtual world, official merch',
  authors: [{ name: 'Faberland' }],
  creator: 'Faberland',
  publisher: 'Faberland',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.faberland.shop',
    siteName: 'Faberland Shop',
    title: 'Faberland Shop - Official Faberland Merch | The Ultimate Metaverse Experience',
    description: 'Faberland - The Ultimate Metaverse Experience. Shop official Faberland merchandise including hoodies, t-shirts, and accessories. Premium merchandise that bridges the digital and physical worlds.',
    images: [
      {
        url: '/v1-logo.png',
        width: 1200,
        height: 630,
        alt: 'Faberland Shop - Official Merchandise',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Faberland Shop - Official Faberland Merch',
    description: 'Faberland - The Ultimate Metaverse Experience. Shop official Faberland merchandise.',
    images: ['/v1-logo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/test con2.png', sizes: '16x16', type: 'image/png' },
      { url: '/test con2.png', sizes: '32x32', type: 'image/png' },
      { url: '/test con2.png', sizes: '48x48', type: 'image/png' },
      { url: '/test con2.png', sizes: '192x192', type: 'image/png' },
      { url: '/test con2.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/test con2.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#000000' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code here
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/test con2.png" type="image/png" />
        <link rel="apple-touch-icon" href="/test con2.png" />
      </head>
      <body className={`${inter.className} bg-white text-gray-900`}>
        <HeadLoader />
        <ClientLayoutContent>
          {children}
        </ClientLayoutContent>
        <Analytics />
      </body>
    </html>
  )
}
