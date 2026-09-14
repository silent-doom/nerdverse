import './globals.css';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import EasterEggManager from '@/components/common/EasterEggManager';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#08090c',
};

export const metadata = {
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
    url: 'https://nerdverse.app',
    siteName: 'NerdVerse',
    title: 'NerdVerse — Explore the Universe, One Concept at a Time',
    description:
      'Interactive visual explanations of paradoxes, theories, and scientific laws.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NerdVerse',
    description:
      'Interactive visual explanations of the universe\'s most fascinating concepts.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
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
      </body>
    </html>
  );
}
