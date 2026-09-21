import './globals.css';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import EasterEggManager from '@/components/common/EasterEggManager';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#08090c',
};

export const metadata = {
  metadataBase: new URL('https://nerdverse-alpha.vercel.app'),
  title: {
    default: 'NerdVerse — Explore the Universe, One Concept at a Time',
    template: '%s | NerdVerse',
  },
  description:
    'Interactive visual explanations of the universe\'s most fascinating concepts — paradoxes, theories, scientific laws, and philosophical ideas. Explore, interact, and discuss.',
  keywords: [
    'interactive learning',
    'science concepts',
    'paradoxes explained',
    'visual explanations',
    'knowledge platform',
    'Murphy\'s Law',
    'Grandfather Paradox',
    'Schrödinger\'s Cat',
  ],
  authors: [{ name: 'NerdVerse' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nerdverse-alpha.vercel.app',
    siteName: 'NerdVerse',
    title: 'NerdVerse — Explore the Universe, One Concept at a Time',
    description:
      'Interactive 3D visual models and thought experiments of the paradoxes shaping reality.',
    images: [
      {
        url: '/images/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'NerdVerse — Explore the Universe, One Concept at a Time',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NerdVerse — Explore the Universe, One Concept at a Time',
    description:
      'Interactive 3D visual models and thought experiments of the paradoxes shaping reality.',
    images: ['/images/og-preview.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ paddingTop: '72px' }}>
          {children}
        </main>
        <Footer />
        <EasterEggManager />
        <SpeedInsights />
      </body>
    </html>
  );
}
